import { Profile, Strategy } from "passport-google-oauth20"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { envConfig } from "@aqua-calendar/env"

export type GoogleUserPayload = {
  email: string
  photoURL?: string | null
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: envConfig().google.clientID,
      clientSecret: envConfig().google.clientSecret,
      callbackURL: envConfig().google.callbackURL,
      scope: ["email", "profile"],
    })
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ): GoogleUserPayload {
    const email = profile.emails?.[0]?.value ?? profile._json?.email
    const photoURL =
      profile.photos?.[0]?.value ??
      (typeof profile._json?.picture === "string"
        ? profile._json.picture
        : null)

    if (!email) {
      throw new UnauthorizedException("Google account does not expose an email")
    }

    return { email, photoURL }
  }
}
