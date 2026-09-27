import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { compare, hash } from "bcrypt"
import { SALT_ROUNDS } from "./auth.constant"
import {
  InvalidPasswordException,
  UserAlreadyExistsException,
  UserNotFoundException,
  RefreshTokenNotFoundException,
  RefreshTokenRevokedException,
  RefreshTokenExpiredException,
} from "../../exceptions"
import { JwtService } from "../../passport"
import { type LoginSchema, type SignUpSchema } from "@aqua-calendar/constants"
import { DayjsService } from "../../date"
import { getDisplayName } from "./auth.util"
import { UserService } from "../user"
import { AuthProvider, UserStatus } from "@aqua-calendar/database"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly dayjsService: DayjsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async signUp(body: SignUpSchema) {
    const { email, password } = body
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        authProvider: true,
      },
    })

    if (existingUser?.passwordHash) {
      throw new UserAlreadyExistsException(
        `User with email ${email} already exists`
      )
    }

    const passwordHash = await hash(password, SALT_ROUNDS)

    const user = existingUser
      ? await this.prismaService.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            authProvider:
              existingUser.authProvider === AuthProvider.google
                ? AuthProvider.google
                : existingUser.authProvider,
          },
          select: {
            id: true,
          },
        })
      : await this.userService.createUser({
          email,
          passwordHash,
          displayName: getDisplayName(email),
          status: UserStatus.active,
          authProvider: null,
          photoURL: null,
        })

    const tokens = await this.jwtService.generateCredentials({
      userId: user.id,
    })
    return {
      ...tokens,
    }
  }

  async loginWithEmailAndPassword(body: LoginSchema) {
    const { email, password } = body
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!user) {
      throw new UserNotFoundException(`User with email ${email} not found`)
    }

    const isPasswordValid = await compare(password, user.passwordHash ?? "")

    if (!isPasswordValid) {
      throw new InvalidPasswordException(`Invalid password for user ${email}`)
    }

    const tokens = await this.jwtService.generateCredentials({
      userId: user.id,
    })
    return {
      ...tokens,
    }
  }

  async signOut(refreshTokenId: string) {
    this.logger.debug("Sign-out request received")
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { id: refreshTokenId },
    })

    if (!refreshToken) {
      throw new RefreshTokenNotFoundException(`Refresh token not found`)
    }

    await this.prismaService.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revokedAt: this.dayjsService.now().toDate() },
    })

    return true
  }

  async getSession(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
        photoURL: true,
        displayName: true,
      },
    })

    if (!user) {
      throw new UserNotFoundException(`User not found`)
    }

    return {
      user,
    }
  }

  async refreshToken(refreshTokenId: string) {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { id: refreshTokenId },
    })

    if (!refreshToken) {
      throw new RefreshTokenNotFoundException(`Refresh token not found`)
    }

    if (refreshToken.revokedAt) {
      await this.prismaService.refreshToken.updateMany({
        where: { userId: refreshToken.userId, revokedAt: null },
        data: { revokedAt: this.dayjsService.now().toDate() },
      })
      throw new RefreshTokenRevokedException(`Refresh token revoked`)
    }

    if (refreshToken.expiresAt < this.dayjsService.now().toDate()) {
      throw new RefreshTokenExpiredException(`Refresh token expired`)
    }

    await this.prismaService.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revokedAt: this.dayjsService.now().toDate() },
    })

    const tokens = await this.jwtService.generateCredentials({
      userId: refreshToken.userId,
    })

    return tokens
  }
}
