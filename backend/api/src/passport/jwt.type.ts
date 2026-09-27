export type Credentials = {
  accessToken: string
  refreshToken: string
}

export type CredentialsPayload = {
  userId: string
}

export type JwtAccessToken = {
  userId: string
  version: number
}

export type JwtRefreshToken = {
  userId: string
  refreshTokenId: string
  version: number
}
