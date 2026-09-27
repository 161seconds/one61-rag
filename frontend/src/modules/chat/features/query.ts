import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { conversationQueryKeys } from "./query-key"
import {
  getConversation,
  listConversations,
  unwrapApi,
  type ConversationWithMembersAndMessages,
  type ListConversationsPage,
} from "./api"
import type { ApiResponse } from "@/shared/hooks"

export const useConversationList = (limit = 50) => {
  return useInfiniteQuery({
    queryKey: conversationQueryKeys.list({ limit }),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const response = await listConversations({
        limit,
        cursor: pageParam,
      })
      return unwrapApi(response as unknown as ApiResponse<ListConversationsPage>)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export const useConversation = (
  conversationId: string | undefined,
  options?: { enabled?: boolean }
) => {
  const enabled = Boolean(conversationId) && (options?.enabled ?? true)
  return useQuery({
    queryKey: conversationId
      ? conversationQueryKeys.detail(conversationId)
      : ["chat", "detail", "none"],
    queryFn: async () => {
      const response = await getConversation(conversationId!)
      return unwrapApi(
        response as unknown as ApiResponse<ConversationWithMembersAndMessages>
      )
    },
    enabled,
  })
}
