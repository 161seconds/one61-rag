import { httpRequest } from "@/libs"
import { ENDPOINT_PATH } from "@/shared/constants"

/** Matches `GET /auth/session` — see `AuthService.getSession` in apis. */
export type SessionUser = {
  id: string
  email: string
  status: string
  photoURL: string | null
  displayName: string | null
}

/** Envelope from `ResponseInterceptor` — body is `{ data: controllerReturn }`. */
export type SessionResponse = {
  success: true
  data: {
    user: SessionUser
  }
  path?: string
  durationMs?: string
  message?: string
}

export const getSession = (): Promise<SessionResponse> => {
  return httpRequest.get(`/${ENDPOINT_PATH.AUTH}/session`, {
    withCredentials: true,
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  })
}
