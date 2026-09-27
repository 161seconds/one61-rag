import { SharedEnvModule } from '@aqua-calendar/env';
import { PubSubModule } from '@aqua-calendar/infra-redis';
import { Module } from '@nestjs/common';
import {
  DeliveryFactory,
  DeliveryListenerService,
  FcmDelivery,
} from './delivery';
import { FcmService } from './fcm/fcm.service';

@Module({
  imports: [
    SharedEnvModule.forRoot({
      isGlobal: true,
    }),
    PubSubModule.forRoot({
      isGlobal: true,
      mode: 'subscriber',
    }),
  ],
  providers: [
    FcmService,
    FcmDelivery,
    DeliveryFactory,
    DeliveryListenerService,
  ],
})
export class AppModule {}
