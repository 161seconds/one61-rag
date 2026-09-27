import { ENDPOINT_PATH } from "@/shared/constants"
import { useApiPatch, useApiPost } from "@/shared/hooks"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import type {
  SendConversationMessageSchema,
  StartConversationSchema,
  UpdateConversationMemberSelfSchema,
  UpdateConversationSchema,
} from "@aqua-calendar/constants"
import { conversationQueryKeys } from "./query-key"
import { leaveConversation, unwrapApi } from "./api"
import type {
  ConversationWithMembersAndMessages,
  ListConversationsPage,
} from "./api"
import type { ApiResponse } from "@/shared/hooks"

export const useStartConversation = () => {
  const qc = useQueryClient()
  return useApiPost<
    ConversationWithMembersAndMessages,
    StartConversationSchema
  >(`/${ENDPOINT_PATH.CONVERSATIONS}/start`, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: conversationQueryKeys.all })
    },
  })
}

export const useSendConversationMessage = () => {
  const qc = useQueryClient()
  return useApiPost<
    ConversationWithMembersAndMessages,
    SendConversationMessageSchema
  >(`/${ENDPOINT_PATH.CONVERSATIONS}`, {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: conversationQueryKeys.detail(variables.conversationId),
      })
      qc.invalidateQueries({ queryKey: conversationQueryKeys.all })
    },
  })
}

export const useUpdateConversation = (conversationId: string) => {
  const qc = useQueryClient()
  return useApiPatch<
    ConversationWithMembersAndMessages,
    UpdateConversationSchema
  >(`/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}`, {
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      })
      qc.invalidateQueries({ queryKey: conversationQueryKeys.all })
    },
  })
}

export const useUpdateMyMembership = (conversationId: string) => {
  const qc = useQueryClient()
  return useApiPatch<
    ConversationWithMembersAndMessages,
    UpdateConversationMemberSelfSchema
  >(`/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}/me`, {
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      })
    },
  })
}

export const useLeaveConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await leaveConversation(conversationId)
      unwrapApi(res as unknown as ApiResponse<void>)
    },
    onMutate: async (conversationId) => {
      await qc.cancelQueries({
        queryKey: conversationQueryKeys.list._def,
      })
      await qc.cancelQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      })

      const previousLists = qc.getQueriesData<
        InfiniteData<ListConversationsPage>
      >({
        queryKey: conversationQueryKeys.list._def,
      })

      for (const [queryKey, oldData] of previousLists) {
        if (!oldData) continue
        const nextData: InfiniteData<ListConversationsPage> = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== conversationId),
          })),
        }
        qc.setQueryData(queryKey, nextData)
      }

      qc.removeQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      })

      return { previousLists }
    },
    onError: (_error, _conversationId, context) => {
      for (const [queryKey, data] of context?.previousLists ?? []) {
        qc.setQueryData(queryKey, data)
      }
    },
    onSuccess: (_, conversationId) => {
      qc.removeQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      })
    },
  })
}
