import { Module } from "@nestjs/common"
import { GoogleController } from "./google.controller"
import { GoogleService } from "./google.service"
import { GoogleStrategy } from "./google.strategy"
import { PrismaModule } from "../../../prisma"
import { PassportModule } from "../../../passport"
import { DateModule } from "../../../date"
import { envConfig } from "@aqua-calendar/env"

@Module({
  imports: [PrismaModule, PassportModule, DateModule],
  providers: [
    GoogleService,
    ...(envConfig().google.clientID && envConfig().google.clientSecret
      ? [GoogleStrategy]
      : []),
  ],
  controllers: [GoogleController],
})
export class GoogleModule {}
