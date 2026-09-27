import { BullMQModule, CacheModule } from "@aqua-calendar/infra-redis"
import {
  AuthModule,
  ConversationModule,
  EventModule,
  UserModule,
  NotificationModule,
  SseModule,
  UploadModule,
} from "./apis"
import { SharedEnvModule } from "@aqua-calendar/env"
import { AppController } from "./app.controller"
import { PassportModule } from "./passport"
import { AppService } from "./app.service"
import { Module } from "@nestjs/common"
import { PrismaModule } from "./prisma"
import { DateModule } from "./date"

@Module({
  imports: [
    SharedEnvModule.forRoot({
      isGlobal: true,
    }),
    BullMQModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PassportModule,
    DateModule,
    AuthModule,
    EventModule,
    ConversationModule,
    UserModule,
    NotificationModule,
    SseModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
