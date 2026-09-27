import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { queryClient } from "@/libs"
import { authQueryKeys } from "@/modules/auth"

export const Route = createFileRoute("/(auth)")({
  beforeLoad: () => {
    const session = queryClient.getQueryData(authQueryKeys.session())

    if (session) {
      throw redirect({ to: "/" })
    }
  },

  component: () => <Outlet />,
})
