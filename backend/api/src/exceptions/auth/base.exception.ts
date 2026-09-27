import { AppException } from "../abstract"
import { AUTH_ERROR_CODE } from "@aqua-calendar/constants"

export class InvalidPasswordException extends AppException {
  constructor(message: string) {
    super({ message, code: AUTH_ERROR_CODE.INVALID_PASSWORD, status: 401 })
  }
}

export class RefreshTokenNotFoundException extends AppException {
  constructor(message: string) {
    super({ message, code: "REFRESH_TOKEN_NOT_FOUND", status: 404 })
  }
}

export class InvalidRefreshTokenException extends AppException {
  constructor(message: string) {
    super({ message, code: "INVALID_REFRESH_TOKEN", status: 401 })
  }
}

export class RefreshTokenRevokedException extends AppException {
  constructor(message: string) {
    super({ message, code: "REFRESH_TOKEN_REVOKED", status: 403 })
  }
}

export class RefreshTokenExpiredException extends AppException {
  constructor(message: string) {
    super({ message, code: "REFRESH_TOKEN_EXPIRED", status: 401 })
  }
}

export class RateLimitExceededException extends AppException {
  constructor(message: string) {
    super({ message, code: "RATE_LIMIT_EXCEEDED", status: 429 })
  }
}
