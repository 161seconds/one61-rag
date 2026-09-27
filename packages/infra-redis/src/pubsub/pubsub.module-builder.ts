import { ConfigurableModuleBuilder } from "@nestjs/common"
import { PubSubModuleOptions } from "./pubsub.type"

export const { ConfigurableModuleClass, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<PubSubModuleOptions>()
    .setClassMethodName("forRoot")
    .build()
