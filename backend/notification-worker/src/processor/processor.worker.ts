import { Processor as WorkerProcessor, WorkerHost } from '@nestjs/bullmq';
import {
  BullQueueName,
  PubSubService,
  ReminderQueuePayload,
} from '@aqua-calendar/infra-redis';
import { ProcessorService } from './processor.service';
import { envConfig } from '@aqua-calendar/env';
import { Job } from 'bullmq';
import {
  NotificationPubsubDelivery,
  NotificationPubsubDeliveryPayload,
} from '@aqua-calendar/constants';

@WorkerProcessor(BullQueueName.REMINDER_QUEUE)
export class ProcessorWorker extends WorkerHost {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly processorService: ProcessorService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    console.log(job.data);
    const payload = job.data as ReminderQueuePayload;
    const enabledChannels =
      await this.processorService.applyPreference(payload);
    console.log('Test 1');
    const notification = await this.processorService.buildNotification(
      payload,
      enabledChannels,
    );
    console.log('Test 2');
    const pushTokens =
      await this.processorService.dispatchNotification(notification);
    console.log('Test 3');
    await this.pubSubService.publish<NotificationPubsubDeliveryPayload>({
      channel: envConfig().redis.pubsub.notificationDelivery,
      payload: {
        delivery: NotificationPubsubDelivery.FCM,
        recipients: {
          pushTokens,
        },
        data: {
          title: 'title',
          body: 'body',
          link: 'link',
        },
      },
    });
  }
}
