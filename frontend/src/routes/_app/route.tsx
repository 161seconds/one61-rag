import { createFileRoute, isRedirect } from "@tanstack/react-router"
import { Outlet } from "@tanstack/react-router"
import { useRouterState } from "@tanstack/react-router"
import { queryClient } from "@/libs"
import { useAuthUIStore } from "@/modules/auth"
import { redirect } from "@tanstack/react-router"
import { authQueryKeys } from "@/modules/auth/features/query-key"
import { getSession } from "@/modules/auth/features"
import { AxiosError } from "axios"
import { AppLayout, SiteLayout } from "@/modules/apps"

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    try {
      await queryClient.ensureQueryData({
        queryKey: authQueryKeys.session(),
        queryFn: () => {
          return getSession()
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
      })
    } catch (error: unknown) {
      if (isRedirect(error)) {
        throw error
      }

      if (error instanceof AxiosError && error.response?.status === 401) {
        queryClient.removeQueries({ queryKey: authQueryKeys.session() })
      }

      useAuthUIStore.getState().setRedirectAfterLogin(location.href)

      throw redirect({
        to: "/login",
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const routerState = useRouterState()
  const pageKey = routerState.location.pathname

  return (
    <SiteLayout>
      <AppLayout pageKey={pageKey}>
        <Outlet />
      </AppLayout>
    </SiteLayout>
  )
}
