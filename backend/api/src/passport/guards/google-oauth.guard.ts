import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

/** Forces Google’s account chooser on each login (OAuth `prompt=select_account`). */
@Injectable()
export class GoogleOAuthLoginGuard extends AuthGuard("google") {
  getAuthenticateOptions(_context: ExecutionContext) {
    return { prompt: "select_account" as const }
  }
}
