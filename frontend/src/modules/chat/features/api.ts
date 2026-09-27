import { httpRequest } from "@/libs"
import { ENDPOINT_PATH } from "@/shared/constants"
import type { ApiResponse } from "@/shared/hooks"

export const unwrapApi = <T>(res: ApiResponse<T>): T => res.data
import type {
  Conversation,
  ConversationMember,
  Message,
} from "@aqua-calendar/database"
import type {
  SendConversationMessageSchema,
  StartConversationSchema,
  UpdateConversationMemberSelfSchema,
  UpdateConversationSchema,
} from "@aqua-calendar/constants"

export type ConversationWithMembersAndMessages = Conversation & {
  members: ConversationMember[]
  messages: Message[]
}

export type ConversationListItem = Conversation & {
  members: ConversationMember[]
}

export type ListConversationsPage = {
  items: ConversationListItem[]
  nextCursor: string | null
}

export const listConversations = (params: {
  limit?: number
  cursor?: string
}) => {
  const search = new URLSearchParams()
  if (params.limit != null) search.set("limit", String(params.limit))
  if (params.cursor) search.set("cursor", params.cursor)
  const qs = search.toString()
  return httpRequest.get<ApiResponse<ListConversationsPage>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}${qs ? `?${qs}` : ""}`
  )
}

export const startConversation = (body: StartConversationSchema) => {
  return httpRequest.post<ApiResponse<ConversationWithMembersAndMessages>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}/start`,
    body
  )
}

export const getConversation = (conversationId: string) => {
  return httpRequest.get<ApiResponse<ConversationWithMembersAndMessages>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}`
  )
}

export const sendConversationMessage = (
  body: SendConversationMessageSchema
) => {
  return httpRequest.post<ApiResponse<ConversationWithMembersAndMessages>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}`,
    body
  )
}

export const updateConversation = (
  conversationId: string,
  body: UpdateConversationSchema
) => {
  return httpRequest.patch<ApiResponse<ConversationWithMembersAndMessages>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}`,
    body
  )
}

export const updateMyMembership = (
  conversationId: string,
  body: UpdateConversationMemberSelfSchema
) => {
  return httpRequest.patch<ApiResponse<ConversationWithMembersAndMessages>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}/me`,
    body
  )
}

export const leaveConversation = (conversationId: string) => {
  return httpRequest.delete<ApiResponse<void>>(
    `/${ENDPOINT_PATH.CONVERSATIONS}/${conversationId}`
  )
}
