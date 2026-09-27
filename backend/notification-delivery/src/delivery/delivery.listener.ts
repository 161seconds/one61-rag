import {
  NotificationPubsubDelivery,
  NotificationPubsubDeliveryPayload,
} from '@aqua-calendar/constants';
import { PubSubService } from '@aqua-calendar/infra-redis';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DeliveryFactory } from './delivery.factory';
import { envConfig } from '@aqua-calendar/env';

function isNotificationPayload(
  payload: unknown,
): payload is NotificationPubsubDeliveryPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.delivery === 'string' &&
    Object.values(NotificationPubsubDelivery).includes(
      candidate.delivery as NotificationPubsubDelivery,
    ) &&
    !!candidate.recipients &&
    typeof candidate.recipients === 'object' &&
    !!candidate.data &&
    typeof candidate.data === 'object'
  );
}

@Injectable()
export class DeliveryListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeliveryListenerService.name);

  constructor(
    private readonly pubSubService: PubSubService,
    private readonly deliveryFactory: DeliveryFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pubSubService.subscribe<unknown>({
      channel: envConfig().redis.pubsub.notificationDelivery,
      handler: async (payload) => {
        await this.handlePayload(payload);
      },
    });

    this.logger.log(
      `Subscribed to pubsub channel: ${envConfig().redis.pubsub.notificationDelivery}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.pubSubService.unsubscribe(
      envConfig().redis.pubsub.notificationDelivery,
    );
  }

  private async handlePayload(payload: unknown): Promise<void> {
    if (!isNotificationPayload(payload)) {
      this.logger.warn(
        `Ignored invalid payload on channel ${envConfig().redis.pubsub.notificationDelivery}`,
      );
      return;
    }

    const delivery = this.deliveryFactory.getDelivery(payload.delivery);
    await delivery.deliver(payload);
  }
}
