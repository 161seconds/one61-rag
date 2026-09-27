import { createParamDecorator } from "@nestjs/common"
import { ExecutionContext } from "@nestjs/common"
import { JwtAccessToken } from "../jwt.type"

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtAccessToken => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
