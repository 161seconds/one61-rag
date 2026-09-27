import { z } from "zod"
import {
  ContentType,
  ConversationType,
  MessageAuthor,
  PartType,
} from "../../types"

const textPartSchema = z.object({
  type: z.literal(PartType.text),
  text: z.string().min(1).max(100_000),
})

const imagePartSchema = z.object({
  type: z.literal(PartType.image),
  url: z.string().url(),
  alt: z.string().max(500).optional(),
})

const videoPartSchema = z.object({
  type: z.literal(PartType.video),
  url: z.string().url(),
})

const audioPartSchema = z.object({
  type: z.literal(PartType.audio),
  url: z.string().url(),
})

const filePartSchema = z.object({
  type: z.literal(PartType.file),
  url: z.string().url(),
  name: z.string().max(255).optional(),
  mimeType: z.string().max(255).optional(),
})

export const messagePartSchema = z.discriminatedUnion("type", [
  textPartSchema,
  imagePartSchema,
  videoPartSchema,
  audioPartSchema,
  filePartSchema,
])

export const userMessageContentSchema = z.discriminatedUnion("contentType", [
  z.object({
    contentType: z.literal(ContentType.text),
    text: z.string().min(1).max(100_000),
  }),
  z.object({
    contentType: z.literal(ContentType.multimodal_text),
    parts: z.array(messagePartSchema).min(1).max(50),
  }),
])

export const userMessageSchema = z.object({
  content: userMessageContentSchema,
})

export const sendConversationMessageSchema = z.object({
  conversationId: z.string().uuid(),
  type: z.nativeEnum(ConversationType).optional(),
  author: z.nativeEnum(MessageAuthor),
  message: userMessageSchema,
})

export const aiResponseContentSchema = z.discriminatedUnion("contentType", [
  z.object({
    contentType: z.literal(ContentType.text),
    text: z.string().min(1).max(100_000),
  }),
  z.object({
    contentType: z.literal(ContentType.multimodal_text),
    parts: z.array(messagePartSchema).min(1).max(50),
  }),
])

export const aiResponseSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  content: aiResponseContentSchema,
})

export type MessagePartSchema = z.infer<typeof messagePartSchema>
export type UserMessageContentSchema = z.infer<typeof userMessageContentSchema>
export type UserMessageSchema = z.infer<typeof userMessageSchema>
export type SendConversationMessageSchema = z.infer<
  typeof sendConversationMessageSchema
>
export type AiResponseSchema = z.infer<typeof aiResponseSchema>
