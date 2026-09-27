import { z } from "zod"

const email = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")

const password = z.string().min(8, "Password must be at least 8 characters")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
})

export const signUpSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
