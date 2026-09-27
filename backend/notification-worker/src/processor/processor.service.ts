import {
  CacheService,
  ReminderQueuePayload,
  cacheKey,
} from '@aqua-calendar/infra-redis';
import {
  NotificationChannel,
  NotificationSetting,
  NotificationDelivery,
  NotificationDeliveryStatus,
  Notification,
} from '@aqua-calendar/database';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProcessorService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {}

  async applyPreference(
    payload: ReminderQueuePayload,
  ): Promise<NotificationChannel[]> {
    const userId = payload.target.id;
    let settings: NotificationSetting[] = [];
    const preferenceKey = cacheKey.notification.preference(userId);
    const cachedPreference =
      await this.cacheService.get<NotificationSetting[]>(preferenceKey);

    if (cachedPreference) {
      settings = cachedPreference;
    } else {
      settings = await this.prismaService.notificationSetting.findMany({
        where: {
          userId,
        },
      });

      // await this.cacheService.set({
      //   key: preferenceKey,
      //   value: settings,
      //   ttl: 60 * 60 * 24,
      // });
    }

    const enabledChannels = settings
      .filter((setting) => setting.enabled)
      .map((setting) => setting.channel);

    return enabledChannels;
  }

  async buildNotification(
    payload: ReminderQueuePayload,
    enabledChannels: NotificationChannel[],
  ): Promise<Notification> {
    console.log('Test 4');
    const notification = await this.prismaService.notification.create({
      data: {
        userId: payload.target.id,
        eventId: payload.event.id,
        content: payload.event.content,
      },
    });
    console.log('Test 5');
    // const notificationDeliveries: Omit<
    //   NotificationDelivery,
    //   | 'id'
    //   | 'createdAt'
    //   | 'updatedAt'
    //   | 'nextRetryAt'
    //   | 'retryCount'
    //   | 'maxRetries'
    //   | 'lastError'
    //   | 'lastRetryAt'
    // >[] = [];
    // for (const channel of enabledChannels) {
    //   notificationDeliveries.push({
    //     notificationId: notification.id,
    //     channel,
    //     status: NotificationDeliveryStatus.pending,
    //   });
    // }
    // console.log('Test 6');
    // await this.prismaService.notificationDelivery.createMany({
    //   data: notificationDeliveries,
    // });
    return notification;
  }

  async dispatchNotification(notification: Notification): Promise<string[]> {
    const tokens = await this.prismaService.browserSubscription.findMany({
      where: {
        userId: notification.userId,
      },
    });
    if (!tokens.length) {
      return [];
    }
    return tokens.map((token) => token.token);
  }
}
