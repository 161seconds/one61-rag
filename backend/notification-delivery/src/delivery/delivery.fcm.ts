import {
  NotificationPubsubDelivery,
  NotificationPubsubDeliveryPayload,
} from '@aqua-calendar/constants';
import { Injectable } from '@nestjs/common';
import { FcmService } from 'src/fcm/fcm.service';
import { Delivery } from './delivery.type';

@Injectable()
export class FcmDelivery implements Delivery<NotificationPubsubDeliveryPayload> {
  readonly type = NotificationPubsubDelivery.FCM;

  constructor(private readonly fcmService: FcmService) {}

  async deliver(payload: NotificationPubsubDeliveryPayload) {
    const { pushTokens } = payload.recipients;

    if (!pushTokens || !pushTokens.length) {
      return;
    }

    await this.fcmService.sendMulticast(
      pushTokens,
      payload.data.title,
      payload.data.body,
      payload.data.link,
    );
  }
}
