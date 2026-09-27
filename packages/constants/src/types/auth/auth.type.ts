import type { z } from "zod"
import type { loginSchema, signUpSchema } from "../../schemas"

export type LoginSchema = z.infer<typeof loginSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
