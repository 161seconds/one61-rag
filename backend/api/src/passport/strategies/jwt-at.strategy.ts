import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { envConfig } from "@aqua-calendar/env"
import { Strategy } from "passport-jwt"
import { JwtAccessToken } from "../jwt.type"

export const JWT_ACCESS_TOKEN_STRATEGY = "jwt-access-token-strategy"

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_TOKEN_STRATEGY
) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const token = req?.cookies?.at
        if (!token || typeof token !== "string") return null
        return token
      },
      ignoreExpiration: false,
      secretOrKey: envConfig().jwt.accessToken.secret,
    })
  }

  validate(payload: JwtAccessToken) {
    return {
      userId: payload.userId,
      tokenVersion: payload.version,
    }
  }
}
