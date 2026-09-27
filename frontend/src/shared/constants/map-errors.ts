import { AUTH_ERROR_CODE } from "@aqua-calendar/constants"

export const mapErrors = (errorCode: string) => {
  switch (errorCode) {
    case AUTH_ERROR_CODE.INVALID_PASSWORD:
      return "The email or password is incorrect."
    default:
      return "An unexpected error occurred"
  }
}
