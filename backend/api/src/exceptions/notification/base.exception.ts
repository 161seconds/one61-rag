import { AppException } from "../abstract"

export class BrowserSubscriptionNotFoundException extends AppException {
  constructor(message: string) {
    super({
      message: message ?? "Browser subscription not found",
      code: "BROWSER_SUBSCRIPTION_NOT_FOUND_EXCEPTION",
      status: 404,
    })
  }
}
