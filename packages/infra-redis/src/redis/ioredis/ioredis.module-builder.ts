import { ConfigurableModuleBuilder } from "@nestjs/common"
import { RedisModuleOptions } from "./ioredis.type"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<RedisModuleOptions>()
    .setClassMethodName("register")
    .setExtras({ isGlobal: true }, (instance, options) => ({
      ...instance,
      isGlobal: options.isGlobal,
    }))
    .build()
