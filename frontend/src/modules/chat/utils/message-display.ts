import { ContentType, PartType } from "@aqua-calendar/constants"

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "image"; url: string; alt?: string }
  | { type: "video"; url: string }
  | { type: "audio"; url: string }
  | { type: "file"; url: string; name?: string; mimeType?: string }

export type ParsedMessageContent =
  | { kind: "text"; text: string }
  | { kind: "multimodal"; parts: MessagePart[] }

type ChatMessageLike = {
  contentType: "text" | "multimodal_text"
  content: unknown
}

export function parseMessageContent(
  message: ChatMessageLike
): ParsedMessageContent {
  if (message.contentType === ContentType.text) {
    const c = message.content as { text?: string }
    return { kind: "text", text: typeof c?.text === "string" ? c.text : "" }
  }

  if (message.contentType === ContentType.multimodal_text) {
    const c = message.content as { parts?: unknown[] }
    const raw = Array.isArray(c?.parts) ? c.parts : []
    const parts: MessagePart[] = []
    for (const p of raw) {
      if (!p || typeof p !== "object") continue
      const part = p as Record<string, unknown>
      if (part.type === PartType.text && typeof part.text === "string") {
        parts.push({ type: "text", text: part.text })
      } else if (part.type === PartType.image && typeof part.url === "string") {
        parts.push({ type: "image", url: part.url, alt: typeof part.alt === "string" ? part.alt : undefined })
      } else if (part.type === PartType.video && typeof part.url === "string") {
        parts.push({ type: "video", url: part.url })
      } else if (part.type === PartType.audio && typeof part.url === "string") {
        parts.push({ type: "audio", url: part.url })
      } else if (part.type === PartType.file && typeof part.url === "string") {
        parts.push({
          type: "file",
          url: part.url,
          name: typeof part.name === "string" ? part.name : undefined,
          mimeType: typeof part.mimeType === "string" ? part.mimeType : undefined,
        })
      }
    }
    return { kind: "multimodal", parts }
  }

  return { kind: "text", text: "" }
}

export function getMessageDisplayText(message: ChatMessageLike): string {
  const parsed = parseMessageContent(message)
  if (parsed.kind === "text") return parsed.text
  return parsed.parts
    .filter((p): p is Extract<MessagePart, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join(" ")
}
