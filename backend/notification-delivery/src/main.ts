import { createWinstonLogger, NestWinstonLogger } from '@aqua-calendar/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from '@aqua-calendar/env';

async function bootstrap() {
  const environment = envConfig().app.environment;
  const logger = new NestWinstonLogger(
    createWinstonLogger({
      service: 'notification-delivery',
      environment,
    }),
  );
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });
  app.useLogger(logger);

  await app.listen(envConfig().app.notificationDelivery.port);
  if (environment !== 'production') {
    logger.debug(
      `🚀 Notification delivery is running on: http://localhost:${envConfig().app.notificationDelivery.port}`,
    );
  }
}
void bootstrap();
