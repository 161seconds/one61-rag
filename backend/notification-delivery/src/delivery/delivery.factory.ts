import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  NotificationPubsubDelivery,
  NotificationPubsubDeliveryPayload,
} from '@aqua-calendar/constants';
import { FcmDelivery } from './delivery.fcm';
import { Delivery } from './delivery.type';

@Injectable()
export class DeliveryFactory implements OnModuleInit {
  private readonly deliveriesMap = new Map<
    NotificationPubsubDelivery,
    Delivery<NotificationPubsubDeliveryPayload>
  >();

  constructor(private readonly fcmDelivery: FcmDelivery) {}

  onModuleInit() {
    this.initializeDeliveries();
  }

  private initializeDeliveries(): void {
    const deliveries = [this.fcmDelivery];

    deliveries.forEach((delivery) => {
      this.deliveriesMap.set(delivery.type, delivery);
    });
  }

  getDelivery(type: NotificationPubsubDelivery) {
    const delivery = this.deliveriesMap.get(type);
    if (!delivery) {
      throw new Error(`No delivery found for type ${type}`);
    }
    return delivery;
  }
}
