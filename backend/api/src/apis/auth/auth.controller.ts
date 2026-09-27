import { Controller, Post, Body, Res, UseGuards, Get } from "@nestjs/common"
import { ZodValidationPipe } from "../../shared/pipe"
import { AuthService } from "./auth.service"
import {
  type SignUpSchema,
  type LoginSchema,
  signUpSchema,
  loginSchema,
  Environment,
} from "@aqua-calendar/constants"
import type { Response } from "express"
import { envConfig } from "@aqua-calendar/env"
import { MsService } from "../../date"
import {
  JwtRefreshTokenGuard,
  JwtAccessTokenGuard,
  JwtRefreshToken,
  JwtAccessToken,
  CurrentUser,
} from "../../passport"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly msService: MsService
  ) {}

  @Post("sign-up")
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) body: SignUpSchema,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.signUp(body)

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

    return true
  }

  @Post("login")
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginSchema,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } =
      await this.authService.loginWithEmailAndPassword(body)

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

    return true
  }

  @Post("sign-out")
  @UseGuards(JwtRefreshTokenGuard)
  async signOut(
    @CurrentUser() user: JwtRefreshToken,
    @Res({ passthrough: true }) res: Response
  ) {
    res.clearCookie("rt", { path: "/auth" })
    res.clearCookie("at", { path: "/" })

    await this.authService.signOut(user.refreshTokenId)

    return true
  }

  @Get("session")
  @UseGuards(JwtAccessTokenGuard)
  async getSession(@CurrentUser() user: JwtAccessToken) {
    const userData = await this.authService.getSession(user.userId)
    return userData
  }

  @Post("refresh")
  @UseGuards(JwtRefreshTokenGuard)
  async refreshToken(
    @CurrentUser() user: JwtRefreshToken,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      user.refreshTokenId
    )
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

    return {
      message: "Token refreshed successfully",
    }
  }
}
