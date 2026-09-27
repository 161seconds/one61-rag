import { createFileRoute } from "@tanstack/react-router"
import { SignUpForm } from "@/modules/auth/components/signup-form"

export const Route = createFileRoute("/(auth)/signup")({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpForm />
}
