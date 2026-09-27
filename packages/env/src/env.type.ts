import { ConfigFactory } from "@nestjs/config"
import { ZodSchema } from "zod"

export interface SharedEnvModuleOptions {
  isGlobal?: boolean
  envFilePath?: string[]
  load?: ConfigFactory[]
  cache?: boolean
  expandVariables?: boolean
  ignoreEnvFile?: boolean
}

export interface CreateEnvValidatorOptions<TSchema extends ZodSchema> {
  schema: TSchema
  onValidationError?: (errorMessage: string) => never
}
