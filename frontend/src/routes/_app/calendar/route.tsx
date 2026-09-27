import { createFileRoute } from "@tanstack/react-router"
import { Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/calendar")({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
