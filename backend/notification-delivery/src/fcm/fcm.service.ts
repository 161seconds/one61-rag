import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { envConfig } from '@aqua-calendar/env';
import { existsSync, readFileSync } from 'fs';
import admin from 'firebase-admin';
import path from 'path';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  onModuleInit() {
    if (!admin.apps.length) {
      const config = envConfig();
      if (config.app.environment === 'development') {
        const serviceAccountPath =
          config.fcm.serviceAccountPath ??
          path.resolve(process.cwd(), 'service-account.json');

        if (!existsSync(serviceAccountPath)) {
          throw new Error(
            `Missing Firebase service account file at ${serviceAccountPath}. Set FCM_SERVICE_ACCOUNT_PATH or add service-account.json at workspace root.`,
          );
        }

        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, 'utf-8'),
        ) as admin.ServiceAccount;

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.fcm.projectId,
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: config.fcm.projectId,
        });
      }
    }
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    link: string,
  ) {
    try {
      const message: MulticastMessage = {
        tokens,
        data: {
          title,
          body,
          link,
        },
      };
      const response = await getMessaging().sendEachForMulticast(message);
      this.logger.debug(
        `sendMulticast completed: success=${response.successCount}, failure=${response.failureCount}`,
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown FCM error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`sendMulticast failed: ${message}`, stack);
      throw error;
    }
  }
}
