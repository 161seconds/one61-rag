import { IoRedisInstanceKey } from "./ioredis.enum"

export const IOREDIS = "IOREDIS"

export const createIoRedisKey = (instanceKey: IoRedisInstanceKey) =>
  `${IOREDIS}_${instanceKey}` as const
