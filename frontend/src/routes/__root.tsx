import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TooltipProvider } from "@aqua-calendar/ui/components/tooltip"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { DefaultCatchBoundary } from "@/modules/apps/default-catch-boundary"
import { DefaultNotFound } from "@/modules/apps/default-not-found"
import { authQueryKeys, getSession } from "@/modules/auth"
import { queryClient } from "@/libs"
import { AxiosError } from "axios"

export const Route = createRootRoute({
  beforeLoad: async () => {
    try {
      await queryClient.ensureQueryData({
        queryKey: authQueryKeys.session(),
        queryFn: getSession,
        retry: false,
        staleTime: 1000 * 60 * 5,
      })
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        queryClient.removeQueries({ queryKey: authQueryKeys.session() })
      }
    }
  },

  component: RootComponent,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: DefaultNotFound,
})

function RootComponent() {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh w-full flex-col">
        <Outlet />
        {import.meta.env.VITE_DEV ? (
          <TanStackRouterDevtools position="bottom-right" />
        ) : null}
      </div>
    </TooltipProvider>
  )
}
