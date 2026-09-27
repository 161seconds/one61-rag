import { ConfigurableModuleBuilder } from "@nestjs/common"

export const { ConfigurableModuleClass, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<{ isGlobal?: boolean }>()
    .setClassMethodName("forRoot")
    .build()
