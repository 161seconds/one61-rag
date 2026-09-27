import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache.module-builder"
import { IoRedisInstanceKey, IoRedisModule } from "../redis"
import { DynamicModule, Module } from "@nestjs/common"
import { CacheService } from "./cache.service"

@Module({})
export class CacheModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.forRoot(options)
    const ioRedisModule = IoRedisModule.register({
      instanceKeys: [IoRedisInstanceKey.Cache],
    })
    return {
      ...dynamicModule,
      global: options?.isGlobal ?? false,
      imports: [ioRedisModule],
      providers: [...(dynamicModule.providers ?? []), CacheService],
      exports: [...(dynamicModule.exports ?? []), CacheService],
    }
  }
}
