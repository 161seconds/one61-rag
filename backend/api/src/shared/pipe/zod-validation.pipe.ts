import { PipeTransform, ArgumentMetadata } from "@nestjs/common"
import { ZodSchema, ZodError } from "zod"

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const parsed = this.schema.safeParse(value)
    if (!parsed.success) {
      throw new ZodError(parsed.error.issues)
    }
    return parsed.data
  }
}
