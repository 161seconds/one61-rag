import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { GoogleOAuthLoginGuard } from "../../../passport/guards"
import { GoogleService } from "./google.service"
import type { GoogleUserPayload } from "./google.strategy"
import type { Request, Response } from "express"
import { MsService } from "../../../date"
import { envConfig } from "@aqua-calendar/env"
import { Environment } from "@aqua-calendar/constants"

type GoogleRequest = Request & {
  user: GoogleUserPayload
}

@Controller("auth/google")
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly msService: MsService
  ) {}

  @Get()
  @UseGuards(GoogleOAuthLoginGuard)
  googleAuth() {
    return
  }

  @Get("callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.googleService.loginWithGoogle(req.user)

    res.cookie("rt", refreshToken, {
      httpOnly: true,
      secure: envConfig().app.environment !== Environment.DEVELOPMENT,
      sameSite: "lax",
      path: "/auth",
      maxAge: this.msService.fromString(envConfig().jwt.refreshToken.expiresIn),
    })

    res.cookie("at", accessToken, {
      httpOnly: true,
      secure: envConfig().app.environment !== Environment.DEVELOPMENT,
      sameSite: "lax",
      path: "/",
      maxAge: this.msService.fromString(envConfig().jwt.accessToken.expiresIn),
    })

    return res.redirect(envConfig().google.successRedirectURL)
  }
}
