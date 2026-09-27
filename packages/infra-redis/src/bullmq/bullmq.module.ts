import { ConfigurableModuleClass, OPTIONS_TYPE } from "./bullmq.module-builder"
import { IoRedisModule, IoRedisInstanceKey, createIoRedisKey } from "../redis"
import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { DynamicModule, Module } from "@nestjs/common"
import { RegisterQueueOptions } from "./bullmq.type"
import { envConfig } from "@aqua-calendar/env"
import { BullQueueName } from "./bullmq.enum"
import { Redis } from "ioredis"

@Module({})
export class BullMQModule extends ConfigurableModuleClass {
  static registerQueue(options: RegisterQueueOptions): DynamicModule {
    const queueName = options.name
    const registerQueue = NestBullModule.registerQueue({
      name: queueName,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: envConfig().redis.bullmq.attempts,
        backoff: {
          type: "exponential",
          delay: envConfig().redis.bullmq.delay,
        },
      },
    })

    return {
      global: options.isGlobal,
      module: BullMQModule,
      imports: [registerQueue],
      exports: [registerQueue],
    }
  }

  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.forRoot(options)
    const bullMqIoRedisModule = IoRedisModule.register({
      instanceKeys: [IoRedisInstanceKey.BullMQ],
    })

    const queueModules = Object.values(BullQueueName).map((queueName) =>
      this.registerQueue({ name: queueName, isGlobal: true })
    )

    return {
      ...dynamicModule,
      global: options?.isGlobal ?? false,
      imports: [
        bullMqIoRedisModule,
        NestBullModule.forRootAsync({
          imports: [bullMqIoRedisModule],
          inject: [createIoRedisKey(IoRedisInstanceKey.BullMQ)],
          useFactory: (redis: Redis) => ({
            connection: redis,
          }),
        }),
        ...queueModules,
      ],
    }
  }
}
