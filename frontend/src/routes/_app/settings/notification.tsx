import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { RouteLoading } from "@/modules/apps"

const NotificationSettingPage = lazy(
  () => import("@/modules/notification-setting/components/page")
)

export const Route = createFileRoute("/_app/settings/notification")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <NotificationSettingPage />
    </Suspense>
  )
}
