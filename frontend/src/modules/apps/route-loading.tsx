import { Skeleton } from "@aqua-calendar/ui/components/skeleton"
import { useRouterState } from "@tanstack/react-router"

/* ─────────────────────────────────────────────
   Shared top progress shimmer bar
───────────────────────────────────────────── */
function TopProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
        style={{
          animation: "route-progress 1.4s ease-in-out infinite",
          backgroundSize: "60% 100%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Landing page loading — minimal fade-in screen
───────────────────────────────────────────── */
function LandingLoading() {
  return (
    <div className="min-h-svh bg-background page-enter">
      <TopProgressBar />
      {/* Navbar skeleton */}
      <div className="fixed top-4 left-1/2 z-40 w-full max-w-5xl -translate-x-1/2 px-4">
        <div className="flex items-center justify-between rounded-2xl border bg-background/70 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 hidden sm:block" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Hero skeleton */}
      <div className="flex min-h-svh flex-col items-center justify-center gap-5 pt-24 px-4">
        <Skeleton className="h-5 w-48 rounded-full" />
        <Skeleton className="h-14 w-[480px] max-w-full rounded-xl" />
        <Skeleton className="h-14 w-[360px] max-w-full rounded-xl" />
        <Skeleton className="h-5 w-80 max-w-full" />
        <Skeleton className="h-5 w-64 max-w-full" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Auth page loading — centered card skeleton
───────────────────────────────────────────── */
function AuthLoading() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-4 page-enter">
      <TopProgressBar />
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>
      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border bg-card/70 p-8 shadow-xl backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-36" />
          <Skeleton className="mx-auto h-4 w-52" />
        </div>
        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <Skeleton className="h-3 w-24" />
          <div className="flex-1 border-t border-border" />
        </div>
        {/* Social */}
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
        <Skeleton className="mx-auto h-3 w-44" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Dashboard / app page loading skeleton
───────────────────────────────────────────── */
function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-5 page-enter">
      <TopProgressBar />

      {/* Greeting banner skeleton */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/8 via-primary/4 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-3">
          {/* Timeline card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-64" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[112px_1fr_auto] gap-3 rounded-lg border p-3 items-center">
                <Skeleton className="h-3 w-24" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>

          {/* Now/Next/Later card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-6 rounded" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Risk radar skeleton */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="size-4 rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>

          {/* Goals skeleton */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="size-4 rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>

          {/* AI suggestions skeleton */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-primary/3 p-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Generic list skeleton for other app routes
   (calendar, chat, settings, etc.)
───────────────────────────────────────────── */
function AppPageLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-5 page-enter">
      <TopProgressBar />
      {/* Page title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Content area */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Smart route-aware loading component
───────────────────────────────────────────── */
export function RouteLoading() {
  // Read the pending (next) location from router state
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })

  // Landing page
  if (pathname === "/") return <LandingLoading />

  // Auth pages (/login, /signup, /forgot-password)
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
    return <AuthLoading />
  }

  // Main dashboard
  if (pathname === "/") {
    return <DashboardLoading />
  }

  // Other authenticated app pages (calendar, chat, settings, etc.)
  return <AppPageLoading />
}

/** Simple list skeleton — kept for backwards compatibility */
export function ListLoading() {
  return (
    <div className="space-y-3 p-4 page-enter">
      <TopProgressBar />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}
