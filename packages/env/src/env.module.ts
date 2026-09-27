import { getEnvFilePath } from "./env.constant"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./env.module-builder"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigModule, ConfigModuleOptions } from "@nestjs/config"

@Module({})
export class SharedEnvModule extends ConfigurableModuleClass {
  static forRoot(options?: typeof OPTIONS_TYPE): DynamicModule {
    const environment = process.env.NODE_ENV
    const configModule = ConfigModule.forRoot<ConfigModuleOptions>({
      isGlobal: options?.isGlobal ?? true,
      cache: options?.cache ?? true,
      expandVariables: options?.expandVariables ?? true,
      ignoreEnvFile: options?.ignoreEnvFile ?? false,
      envFilePath: options?.envFilePath ?? getEnvFilePath(environment),
      load: options?.load ?? [],
    })

    return {
      ...super.forRoot(options ?? {}),
      imports: [configModule],
      exports: [ConfigModule],
    }
  }
}
