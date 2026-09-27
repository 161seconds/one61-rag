import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@aqua-calendar/env"
import { Injectable } from "@nestjs/common"
import {
  CredentialsPayload,
  JwtRefreshToken,
  JwtAccessToken,
  Credentials,
} from "./jwt.type"
import { PrismaService } from "../prisma/"
import { DayjsService } from "../date"
import { v7 as uuidv7 } from "uuid"
import { hash } from "bcrypt"

@Injectable()
export class JwtService {
  private readonly accessTokenConfig = envConfig().jwt.accessToken
  private readonly refreshTokenConfig = envConfig().jwt.refreshToken

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly prismaService: PrismaService,
    private readonly dayjsService: DayjsService
  ) {}
  public async generateCredentials(
    payload: CredentialsPayload
  ): Promise<Credentials> {
    const refreshTokenId = uuidv7()
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: payload.userId,
          version: 1,
        },
        {
          secret: this.accessTokenConfig.secret,
          expiresIn: this.accessTokenConfig.expiresIn,
        }
      ),
      this.jwtService.signAsync(
        {
          userId: payload.userId,
          refreshTokenId,
          version: 1,
        },
        {
          secret: this.refreshTokenConfig.secret,
          expiresIn: this.refreshTokenConfig.expiresIn,
        }
      ),
    ])

    const tokenHash = await hash(refreshToken, 10)

    await this.prismaService.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: payload.userId,
        tokenHash,
        expiresAt: this.dayjsService
          .fromMs(this.refreshTokenConfig.expiresIn)
          .toDate(),
      },
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  public async verifyAccessToken(token: string): Promise<JwtAccessToken> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.accessTokenConfig.secret,
    })
  }

  public async verifyRefreshToken(token: string): Promise<JwtRefreshToken> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.refreshTokenConfig.secret,
    })
  }

  public decodeToken<T extends JwtAccessToken | JwtRefreshToken>(
    token: string
  ): T | null {
    return this.jwtService.decode<T>(token)
  }
}
