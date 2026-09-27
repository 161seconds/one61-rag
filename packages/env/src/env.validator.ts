import { CreateEnvValidatorOptions } from "./env.type"
import { ZodIssue, ZodSchema } from "zod"

function formatIssue(issue: ZodIssue): string {
  const path = issue.path.length > 0 ? issue.path.join(".") : "root"
  return `${path}: ${issue.message}`
}

function defaultValidationError(message: string): never {
  throw new Error(message)
}

export function createEnvValidator<TSchema extends ZodSchema>({
  schema,
  onValidationError,
}: CreateEnvValidatorOptions<TSchema>) {
  return (env: Record<string, unknown>) => {
    const result = schema.safeParse(env)

    if (!result.success) {
      const message = result.error.issues.map(formatIssue).join("; ")
      const raise = onValidationError ?? defaultValidationError
      return raise(`Invalid environment variables: ${message}`)
    }

    return result.data
  }
}
