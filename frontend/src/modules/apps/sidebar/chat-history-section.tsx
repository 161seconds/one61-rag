import { cn } from "@aqua-calendar/ui/lib/utils"
import { Button } from "@aqua-calendar/ui/components/button"
import { ScrollArea } from "@aqua-calendar/ui/components/scroll-area"
import { Skeleton } from "@aqua-calendar/ui/components/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@aqua-calendar/ui/components/tooltip"
import { useNavigate, useParams } from "@tanstack/react-router"
import { SquarePen, Trash2 } from "lucide-react"
import { useConversationList, useLeaveConversation } from "@/modules/chat/features"

export function ChatHistorySection() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { conversationId?: string }
  const activeConversationId = params.conversationId ?? null

  const { data, isLoading } = useConversationList(50)
  const { mutate: leaveConversation, isPending: isDeleting } = useLeaveConversation()

  const items = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border/60">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-2.5 pb-1 pt-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
          Chats
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => void navigate({ to: "/chat" })}
              aria-label="New chat"
            >
              <SquarePen />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New chat</TooltipContent>
        </Tooltip>
      </div>

      {/* List */}
      <ScrollArea className="min-h-0 flex-1 px-2 pb-2">
        {isLoading ? (
          <div className="flex flex-col gap-1 px-1 py-1">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-4/5 rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-3/5 rounded-md" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted-foreground/50">
            No conversations yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((c) => {
              const isActive = c.id === activeConversationId
              const label = c.title?.trim() || "New chat"

              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group flex h-8 items-center gap-2 rounded-md px-2.5",
                      isActive ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void navigate({
                          to: "/chat/$conversationId",
                          params: { conversationId: c.id },
                        })
                      }
                      className={cn(
                        "min-w-0 flex-1 truncate text-left text-sm font-medium",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation()
                            const ok = window.confirm(
                              "Delete this conversation? This cannot be undone.",
                            )
                            if (!ok) return
                            leaveConversation(c.id, {
                              onSuccess: () => {
                                if (activeConversationId === c.id) {
                                  void navigate({ to: "/chat" })
                                }
                              },
                            })
                          }}
                          aria-label="Delete conversation"
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}
