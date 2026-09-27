import { z } from "zod"
import { ConversationType } from "../../types"

export const startConversationSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.nativeEnum(ConversationType).optional(),
  title: z.string().max(200).optional().nullable(),
})

export type StartConversationSchema = z.infer<typeof startConversationSchema>

export const updateConversationSchema = z.object({
  title: z.string().max(200).nullable(),
})

export type UpdateConversationSchema = z.infer<typeof updateConversationSchema>

export const updateConversationMemberSelfSchema = z.object({
  lastReadAt: z.coerce.date().nullable(),
})

export type UpdateConversationMemberSelfSchema = z.infer<
  typeof updateConversationMemberSelfSchema
>

export const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
})

export type ListConversationsQuerySchema = z.infer<
  typeof listConversationsQuerySchema
>

export const conversationListCursorPayloadSchema = z.object({
  u: z.string().datetime(),
  i: z.string().uuid(),
})

export type ConversationListCursorPayload = z.infer<
  typeof conversationListCursorPayloadSchema
>
