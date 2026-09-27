import { Button } from "@aqua-calendar/ui/components/button"
import { FormField } from "@aqua-calendar/ui/components/form"
import { Input } from "@aqua-calendar/ui/components/input"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SocialButtons } from "./social-buttons"
import { AuthLayout } from "./auth-layout"
import { GoogleIcon, MicrosoftIcon, PassKeyIcon } from "./icon"
import { AlertTriangle, Eye, EyeOff, Loader2, X } from "lucide-react"
import { useLogin } from "../features"
import { type LoginSchema, loginSchema } from "@aqua-calendar/constants"
import { baseUrl } from "@/libs"
import { ENDPOINT_PATH } from "@/shared/constants"

export function LoginForm() {
  const { handleLogin, isPending, loginErrorMessage } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })
  const emailValue = useWatch({ control, name: "email" })

  function clearEmail() {
    setValue("email", "", {
      shouldDirty: true,
      shouldTouch: true,
    })
    setFocus("email")
  }

  function onSubmit(data: LoginSchema) {
    handleLogin(data)
  }

  function handleGoogleLogin() {
    window.location.href = `${baseUrl}/${ENDPOINT_PATH.AUTH}/google`
  }

  const socialProviders = [
    { name: "Google", icon: GoogleIcon, onClick: handleGoogleLogin },
    { name: "Microsoft", icon: MicrosoftIcon, iconClassName: "size-5" },
    { name: "Passkey", icon: PassKeyIcon, iconClassName: "size-5" },
  ]

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to Aqua Calendar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            label="Email"
            name="email"
            error={loginErrorMessage ? undefined : errors.email?.message}
          >
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
          <FormField
            label="Password"
            name="password"
            error={loginErrorMessage ? undefined : errors.password?.message}
          >
            <div className="relative">
              <Input
                className="h-10 pr-10"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </FormField>
          {loginErrorMessage ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
              <AlertTriangle className="size-4" aria-hidden />
              {loginErrorMessage}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="h-10 w-full"
            disabled={isSubmitting || isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">
              Or continue with
            </span>
            <div className="flex-1 border-t border-border" />
          </div>
          <SocialButtons providers={socialProviders} />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
