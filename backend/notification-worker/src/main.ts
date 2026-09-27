import { createWinstonLogger, NestWinstonLogger } from '@aqua-calendar/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from '@aqua-calendar/env';

async function bootstrap() {
  const environment = envConfig().app.environment;
  const logger = new NestWinstonLogger(
    createWinstonLogger({
      service: 'notification-worker',
      environment,
    }),
  );
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });
  app.useLogger(logger);

  await app.listen(envConfig().app.notificationWorker.port);
  if (environment !== 'production') {
    logger.debug(
      `🚀 Notification worker is running on: http://localhost:${envConfig().app.notificationWorker.port}`,
    );
  }
}
void bootstrap();
