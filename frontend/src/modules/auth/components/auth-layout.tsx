import { type ReactNode } from "react"
import { cn } from "@aqua-calendar/ui/lib/utils"

type AuthLayoutProps = {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)}>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <div className="mx-auto w-[360px] max-w-full">{children}</div>
      </div>
      <div className="relative hidden min-h-svh overflow-hidden border-r border-border bg-muted/40 lg:block">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-chart-1/10"
          aria-hidden
        />
        <div
          className="absolute top-1/4 -left-1/4 h-[480px] w-[480px] rounded-full bg-chart-1/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute right-1/4 -bottom-1/4 h-[360px] w-[360px] rounded-full bg-chart-2/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute top-1/3 right-0 h-[280px] w-[280px] rounded-full bg-chart-3/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex min-h-svh flex-col justify-between p-10 xl:p-14"></div>
      </div>
    </div>
  )
}