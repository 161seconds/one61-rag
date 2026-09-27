import { BullQueueName } from "./bullmq.enum"

export interface RegisterQueueOptions {
  name: BullQueueName
  isGlobal?: boolean
}

export interface ConversationQueuePayload {
  conversationId: string
  userId: string
  messageId: string
  content:
    | { contentType: "text"; text: string }
    | {
        contentType: "multimodal_text"
        parts: Array<
          | { type: "text"; text: string }
          | { type: "image"; url: string; alt?: string }
          | { type: "video"; url: string }
          | { type: "audio"; url: string }
          | { type: "file"; url: string; name?: string; mimeType?: string }
        >
      }
}

export interface ReminderQueuePayload {
  reminderId: string
  event: {
    id: string
    content: {
      title: string
      description: string
      startDate: Date
      endDate: Date
    }
  }
  target: {
    id: string
    content: {
      displayName: string
      email: string
    }
  }
}
