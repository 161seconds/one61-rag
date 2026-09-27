import { useState } from "react"
import { Button } from "@aqua-calendar/ui/components/button"
import { FormField } from "@aqua-calendar/ui/components/form"
import { Input } from "@aqua-calendar/ui/components/input"
import { Link } from "@tanstack/react-router"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "./schemas"
import { AuthLayout } from "./auth-layout"
import { X } from "lucide-react"

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })
  const emailValue = useWatch({ control, name: "email" })

  function clearEmail() {
    setValue("email", "", {
      shouldDirty: true,
      shouldTouch: true,
    })
    setFocus("email")
  }

  function onSubmit(data: ForgotPasswordFormValues) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSubmittedEmail(data.email)
        resolve()
      }, 600)
    })
  }

  if (submittedEmail) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>
              , we&apos;ve sent a password reset link.
            </p>
          </div>
          <Button asChild className="h-10 w-full" variant="default">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField label="Email" name="email" error={errors.email?.message}>
            <div className="relative">
              <Input
                className="h-10 pr-10"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {emailValue ? (
                <button
                  type="button"
                  onClick={clearEmail}
                  aria-label="Clear email"
                  className="absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          </FormField>
          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
