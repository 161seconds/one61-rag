import { createIoRedisKey } from "./ioredis.constant"
import { IoRedisInstanceKey } from "./ioredis.enum"
import { Logger, Provider } from "@nestjs/common"
import { IOREDIS } from "./ioredis.constant"
import { envConfig } from "@aqua-calendar/env"
import { Redis } from "ioredis"

const getInstanceLabel = (instanceKey: IoRedisInstanceKey): string => {
  switch (instanceKey) {
    case IoRedisInstanceKey.BullMQ:
      return "BullMQ Redis"
    case IoRedisInstanceKey.Cache:
      return "Cache Redis"
    case IoRedisInstanceKey.PubSubPublisher:
      return "Pub/Sub Publisher Redis"
    case IoRedisInstanceKey.PubSubSubscriber:
      return "Pub/Sub Subscriber Redis"
    default:
      return "Redis"
  }
}

export const createIoRedisProvider = (
  instanceKey: IoRedisInstanceKey
): Provider => ({
  provide: createIoRedisKey(instanceKey),
  useFactory: () => {
    const logger = new Logger(`${IOREDIS}:${instanceKey}`)
    const isProduction = envConfig().app.environment === "production"
    const instanceMap = {
      [IoRedisInstanceKey.BullMQ]: {
        host: envConfig().redis.bullmq.host,
        port: envConfig().redis.bullmq.port,
        password: envConfig().redis.bullmq.password,
        additionalOptions: {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        },
      },
      [IoRedisInstanceKey.Cache]: {
        host: envConfig().redis.cache.host,
        port: envConfig().redis.cache.port,
        password: envConfig().redis.cache.password,
        additionalOptions: {},
      },
      [IoRedisInstanceKey.PubSubPublisher]: {
        host: envConfig().redis.pubsub.host,
        port: envConfig().redis.pubsub.port,
        password: envConfig().redis.pubsub.password,
        additionalOptions: {
          maxRetriesPerRequest: null,
        },
      },
      [IoRedisInstanceKey.PubSubSubscriber]: {
        host: envConfig().redis.pubsub.host,
        port: envConfig().redis.pubsub.port,
        password: envConfig().redis.pubsub.password,
        additionalOptions: {
          maxRetriesPerRequest: null,
        },
      },
    }

    const instance = instanceMap[instanceKey]
    const { host, port, password, additionalOptions } = instance

    const instanceLabel = getInstanceLabel(instanceKey)

    const redis = new Redis({
      host,
      port,
      password,
      ...additionalOptions,
    })

    redis.once("ready", () => {
      if (!isProduction) {
        logger.debug(`${instanceLabel} connected`)
      }
    })

    redis.on("error", (error: Error) => {
      logger.error(
        `${instanceLabel} connection error: ${error.message}`,
        error.stack
      )
    })

    return redis
  },
})
