import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { envConfig } from "@aqua-calendar/env"
import { Strategy } from "passport-jwt"
import { JwtRefreshToken } from "../jwt.type"

export const JWT_REFRESH_TOKEN_STRATEGY = "jwt-refresh-token-strategy"

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_TOKEN_STRATEGY
) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const token = req?.cookies?.rt
        if (!token || typeof token !== "string") return null
        return token
      },
      ignoreExpiration: false,
      secretOrKey: envConfig().jwt.refreshToken.secret,
    })
  }

  validate(payload: JwtRefreshToken) {
    return {
      userId: payload.userId,
      refreshTokenId: payload.refreshTokenId,
      tokenVersion: payload.version,
    }
  }
}
