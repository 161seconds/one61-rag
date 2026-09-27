import { ConfigurableModuleClass, OPTIONS_TYPE } from "./ioredis.module-builder"
import { DynamicModule, Module } from "@nestjs/common"
import { createIoRedisProvider } from "./ioredis.providers"

@Module({})
export class IoRedisModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options)

    const { instanceKeys } = options
    const redisProviders = instanceKeys.map((instanceKey) =>
      createIoRedisProvider(instanceKey)
    )

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...redisProviders],
      exports: [...(dynamicModule.exports ?? []), ...redisProviders],
    }
  }
}
