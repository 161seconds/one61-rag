import { createFileRoute } from "@tanstack/react-router"
import { ChatPage } from "@/modules/chat/components/chat-page"

export const Route = createFileRoute("/_app/chat/$conversationId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { conversationId } = Route.useParams()
  return <ChatPage conversationId={conversationId} />
}

