import { AuthProvider, UserStatus } from "@aqua-calendar/database"
import { GoogleUserPayload } from "./google.strategy"
import { PrismaService } from "../../../prisma"
import { JwtService } from "../../../passport"
import { getDisplayName } from "../auth.util"
import { Injectable } from "@nestjs/common"
import { UserService } from "../../user"

@Injectable()
export class GoogleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async loginWithGoogle(payload: GoogleUserPayload) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        authProvider: true,
        status: true,
        photoURL: true,
      },
    })

    const user = existingUser
      ? await this.prismaService.user.update({
          where: { id: existingUser.id },
          data: {
            authProvider: AuthProvider.google,
            status:
              existingUser.status === UserStatus.pending
                ? UserStatus.active
                : existingUser.status,
            photoURL: payload.photoURL ?? existingUser.photoURL,
          },
          select: { id: true, email: true, status: true, authProvider: true },
        })
      : await this.userService.createUser({
          email: payload.email,
          displayName: getDisplayName(payload.email),
          status: UserStatus.active,
          authProvider: AuthProvider.google,
          passwordHash: null,
          photoURL: payload.photoURL ?? null,
        })

    const { accessToken, refreshToken } =
      await this.jwtService.generateCredentials({
        userId: user.id,
      })

    return {
      accessToken,
      refreshToken,
    }
  }
}
