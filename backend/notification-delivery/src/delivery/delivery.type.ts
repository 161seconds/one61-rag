import { NotificationPubsubDelivery } from '@aqua-calendar/constants';

export interface Delivery<T = unknown> {
  type: NotificationPubsubDelivery;
  deliver(payload: T): Promise<void>;
}
