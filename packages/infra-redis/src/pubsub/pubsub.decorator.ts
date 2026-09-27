import { IoRedisInstanceKey, createIoRedisKey } from "../redis"
import { Inject } from "@nestjs/common"

export const InjectRedisPubSubPublisher = () =>
  Inject(createIoRedisKey(IoRedisInstanceKey.PubSubPublisher))

export const InjectRedisPubSubSubscriber = () =>
  Inject(createIoRedisKey(IoRedisInstanceKey.PubSubSubscriber))
