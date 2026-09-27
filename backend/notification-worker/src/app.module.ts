import {
  BullMQModule,
  CacheModule,
  PubSubModule,
} from '@aqua-calendar/infra-redis';
import { SharedEnvModule } from '@aqua-calendar/env';
import { AppController } from './app.controller';
import { ProcessorModule } from './processor';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { Module } from '@nestjs/common';

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
    PubSubModule.forRoot({
      isGlobal: true,
      mode: 'publisher',
    }),
    PrismaModule,
    ProcessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
