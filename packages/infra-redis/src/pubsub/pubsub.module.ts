import { ConfigurableModuleClass, OPTIONS_TYPE } from "./pubsub.module-builder"
import { IoRedisInstanceKey, IoRedisModule } from "../redis"
import { PubSubMode } from "./pubsub.type"
import { DynamicModule, Module } from "@nestjs/common"
import { PubSubService } from "./pubsub.service"

@Module({})
export class PubSubModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.forRoot(options)
    const mode: PubSubMode = options?.mode ?? "both"
    const instanceKeys =
      mode === "publisher"
        ? [IoRedisInstanceKey.PubSubPublisher]
        : mode === "subscriber"
          ? [IoRedisInstanceKey.PubSubSubscriber]
          : [
              IoRedisInstanceKey.PubSubPublisher,
              IoRedisInstanceKey.PubSubSubscriber,
            ]

    const ioRedisModule = IoRedisModule.register({
      instanceKeys,
    })

    return {
      ...dynamicModule,
      global: options?.isGlobal ?? false,
      imports: [ioRedisModule],
      providers: [...(dynamicModule.providers ?? []), PubSubService],
      exports: [...(dynamicModule.exports ?? []), PubSubService],
    }
  }
}
