import { AppException } from "../abstract"

export class UserNotFoundException extends AppException {
  constructor(message: string) {
    super({
      message: message ?? "User not found",
      code: "USER_NOT_FOUND_EXCEPTION",
      status: 404,
    })
  }
}

export class UserAlreadyExistsException extends AppException {
  constructor(message: string) {
    super({
      message: message ?? "User already exists",
      code: "USER_ALREADY_EXISTS_EXCEPTION",
      status: 400,
    })
  }
}
