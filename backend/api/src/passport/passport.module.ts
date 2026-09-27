import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from "./strategies"
import { JwtModule as JwtNestModule } from "@nestjs/jwt"
import { Global, Module } from "@nestjs/common"
import { JwtService } from "./jwt.service"

@Global()
@Module({
  imports: [JwtNestModule],
  providers: [JwtService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  exports: [JwtService],
})
export class PassportModule {}
