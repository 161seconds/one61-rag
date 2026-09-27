import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { PassportModule } from "../../passport"
import { AuthController } from "./auth.controller"
import { DateModule } from "../../date"
import { GoogleModule } from "./google/google.module"
@Module({
  imports: [PrismaModule, PassportModule, DateModule, GoogleModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
