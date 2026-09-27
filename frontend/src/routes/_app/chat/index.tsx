import { createFileRoute } from "@tanstack/react-router"
import { ChatPage } from "@/modules/chat/components/chat-page"

export const Route = createFileRoute("/_app/chat/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <ChatPage />
}

