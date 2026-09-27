import { Inject } from "@nestjs/common"
import { createIoRedisKey } from "../redis"
import { IoRedisInstanceKey } from "../redis"

export const InjectRedisCache = () =>
  Inject(createIoRedisKey(IoRedisInstanceKey.Cache))
