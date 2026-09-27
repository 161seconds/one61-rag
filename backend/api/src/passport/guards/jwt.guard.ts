import { AuthGuard } from "@nestjs/passport"
import {
  JWT_ACCESS_TOKEN_STRATEGY,
  JWT_REFRESH_TOKEN_STRATEGY,
} from "../strategies"

export class JwtAccessTokenGuard extends AuthGuard(JWT_ACCESS_TOKEN_STRATEGY) {
  constructor() {
    super()
  }
}

export class JwtRefreshTokenGuard extends AuthGuard(
  JWT_REFRESH_TOKEN_STRATEGY
) {
  constructor() {
    super()
  }
}
