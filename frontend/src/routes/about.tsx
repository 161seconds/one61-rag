import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

const LandingPageLazy = lazy(() =>
  import("@/modules/landing/components/landing-page").then((m) => ({
    default: m.LandingPage,
  }))
)

export const Route = createFileRoute("/about")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense fallback={<div className="min-h-svh animate-pulse bg-background" />}>
      <LandingPageLazy />
    </Suspense>
  )
}
