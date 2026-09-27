import { ContentType, ConversationType, MessageAuthor, PartType } from "@aqua-calendar/constants"
import type { MessagePartSchema, UserMessageContentSchema } from "@aqua-calendar/constants"
import { cn } from "@aqua-calendar/ui/lib/utils"
import { Button } from "@aqua-calendar/ui/components/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@aqua-calendar/ui/components/dropdown-menu"
import { ArrowUp, ChevronDown, FileText, ImagePlus, Mic, Plus, Sparkles, Wrench, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
   conversationQueryKeys,
   useConversation,
   useSendConversationMessage,
   useStartConversation,
   uploadFile,
   type ConversationWithMembersAndMessages,
} from "../features"
import { parseMessageContent } from "../utils/message-display"
import { useSse } from "@/shared/hooks"

/* ─── Types ────────────────────────────────────────────── */

type ChatMessageLike = {
   id: string
   contentType: "text" | "multimodal_text"
   content: unknown
   author: "user" | "assistant" | "system"
   createdAt: unknown
}

type AttachmentItem = {
   id: string
   file: File
   kind: "image" | "file"
   previewUrl?: string
   /** Set once the upload completes successfully */
   uploadedUrl?: string
   status: "uploading" | "done" | "error"
}

/* ─── Greeting helper ──────────────────────────────────── */

function getTimeGreeting(): string {
   const h = new Date().getHours()
   if (h < 12) return "Good morning"
   if (h < 17) return "Good afternoon"
   return "Good evening"
}

/* ─── Sub-components ───────────────────────────────────── */

function TypingIndicator() {
   return (
      <div className="flex items-start gap-3">
         <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-3 text-primary" />
         </div>
         <div className="flex items-center gap-1 pt-2">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
         </div>
      </div>
   )
}

/* ─── Message media renderers ──────────────────────────── */

type PreviewItem =
   | { kind: "image"; url: string; alt?: string }
   | { kind: "file"; url: string; name?: string; mimeType?: string }

/** Inline image chip used inside a message bubble */
function MsgImage({ url, alt, onPreview }: { url: string; alt?: string; onPreview?: (item: PreviewItem) => void }) {
   return (
      <button
         type="button"
         onClick={() => onPreview?.({ kind: "image", url, alt })}
         className="group overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
         aria-label="Preview image"
      >
         <img
            src={url}
            alt={alt ?? ""}
            className="h-48 max-w-[240px] rounded-xl object-cover transition-transform group-hover:scale-[1.02]"
            loading="lazy"
         />
      </button>
   )
}

/** Compact file chip used inside a message bubble */
function MsgFile({
   url,
   name,
   mimeType,
   onPreview,
}: {
   url: string
   name?: string
   mimeType?: string
   onPreview?: (item: PreviewItem) => void
}) {
   return (
      <button
         type="button"
         onClick={() => onPreview?.({ kind: "file", url, name, mimeType })}
         className="inline-flex max-w-[200px] items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-2.5 py-2 no-underline hover:bg-muted/50 transition-colors"
         aria-label="Preview file"
      >
         <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background/80">
            <FileText className="size-3.5 text-muted-foreground" />
         </div>
         <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground leading-tight">{name ?? "File"}</p>
            {mimeType && (
               <p className="text-[10px] text-muted-foreground/60 uppercase leading-tight">
                  {mimeType.split("/")[1] ?? mimeType}
               </p>
            )}
         </div>
      </button>
   )
}

function MessageBubble({ message, onPreview }: { message: ChatMessageLike; onPreview?: (item: PreviewItem) => void }) {
   const isUser = message.author === MessageAuthor.user
   const isAssistant = message.author === MessageAuthor.assistant

   if (!isUser && !isAssistant) return null

   const parsed = parseMessageContent(message)

   // Split parts into media (images + files) and text
   const mediaParts =
      parsed.kind === "multimodal" ? parsed.parts.filter((p) => p.type === "image" || p.type === "file") : []
   const textParts = parsed.kind === "multimodal" ? parsed.parts.filter((p) => p.type === "text") : []
   const plainText = parsed.kind === "text" ? parsed.text : null

   return (
      <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
         {isAssistant && (
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
               <Sparkles className="size-3 text-primary" />
            </div>
         )}

         {isUser ? (
            /* ── User message ── */
            <div className="flex max-w-[85%] sm:max-w-[72%] flex-col items-end gap-1.5">
               {/* Inline media row — on top */}
               {mediaParts.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                     {mediaParts.map((p) =>
                        p.type === "image" ? (
                           <MsgImage key={p.url} url={p.url} alt={p.alt} onPreview={onPreview} />
                        ) : p.type === "file" ? (
                           <MsgFile key={p.url} url={p.url} name={p.name} mimeType={p.mimeType} onPreview={onPreview} />
                        ) : null
                     )}
                  </div>
               )}
               {/* Text pill — below media */}
               {plainText && (
                  <div className="rounded-2xl rounded-tr-sm bg-muted/70 px-4 py-2.5">
                     <span className="text-sm leading-7 antialiased whitespace-pre-wrap wrap-break-word">
                        {plainText}
                     </span>
                  </div>
               )}
               {textParts.map((p) =>
                  p.type === "text" && p.text ? (
                     <div key={p.text.slice(0, 40)} className="rounded-2xl rounded-tr-sm bg-muted/70 px-4 py-2.5">
                        <span className="text-sm leading-7 antialiased whitespace-pre-wrap wrap-break-word">
                           {p.text}
                        </span>
                     </div>
                  ) : null
               )}
            </div>
         ) : (
            /* ── Assistant message ── */
            <div className="flex-1 min-w-0 space-y-2 text-foreground/90">
               {/* Media row on top for assistant too */}
               {mediaParts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                     {mediaParts.map((p) =>
                        p.type === "image" ? (
                           <MsgImage key={p.url} url={p.url} alt={p.alt} onPreview={onPreview} />
                        ) : p.type === "file" ? (
                           <MsgFile key={p.url} url={p.url} name={p.name} mimeType={p.mimeType} onPreview={onPreview} />
                        ) : null
                     )}
                  </div>
               )}
               {plainText && (
                  <span className="text-sm leading-7 antialiased whitespace-pre-wrap wrap-break-word">{plainText}</span>
               )}
               {textParts.map((p) =>
                  p.type === "text" && p.text ? (
                     <p
                        key={p.text.slice(0, 40)}
                        className="text-sm leading-7 antialiased whitespace-pre-wrap wrap-break-word"
                     >
                        {p.text}
                     </p>
                  ) : null
               )}
            </div>
         )}
      </div>
   )
}

function StreamingAssistantBubble({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-3">
         <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-3 text-primary" />
         </div>
         <div className="flex-1 min-w-0 text-sm leading-7 whitespace-pre-wrap wrap-break-word text-foreground/90">
            {text}
         </div>
      </div>
   )
}

/* ─── Attachment preview strip ─────────────────────────── */

/* ─── Attachment preview strip (input area) ───────────── */

function AttachmentPreview({
   attachments,
   onRemove,
}: {
   attachments: AttachmentItem[]
   onRemove: (id: string) => void
}) {
   if (attachments.length === 0) return null

   return (
      /* Single scrollable inline row — images and files together */
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
         {attachments.map((a) =>
            a.kind === "image" ? (
               /* Image thumbnail */
               <div key={a.id} className="relative shrink-0">
                  <img
                     src={a.previewUrl}
                     alt={a.file.name}
                     className={cn(
                        "size-16 rounded-xl object-cover border border-border/60",
                        a.status === "uploading" && "opacity-50",
                        a.status === "error" && "border-destructive/70 opacity-60"
                     )}
                  />
                  {a.status === "uploading" ? (
                     <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                        <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                     </div>
                  ) : (
                     <button
                        type="button"
                        onClick={() => onRemove(a.id)}
                        aria-label="Remove"
                        className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background hover:bg-destructive transition-colors"
                     >
                        <X className="size-2.5" />
                     </button>
                  )}
               </div>
            ) : (
               /* File chip */
               <div
                  key={a.id}
                  className={cn(
                     "relative flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-2.5 py-1.5",
                     a.status === "uploading" && "opacity-60",
                     a.status === "error" && "border-destructive/70"
                  )}
               >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60">
                     <FileText className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 max-w-[120px]">
                     <p className="truncate text-xs font-medium leading-tight">{a.file.name}</p>
                     <p className="text-[10px] text-muted-foreground/60 leading-tight uppercase">
                        {a.file.type?.split("/")[1] ?? "file"}
                     </p>
                  </div>
                  {a.status === "uploading" ? (
                     <span className="size-3.5 animate-spin rounded-full border-2 border-primary/80 border-t-transparent" />
                  ) : (
                     <button
                        type="button"
                        onClick={() => onRemove(a.id)}
                        aria-label="Remove"
                        className="flex size-4 items-center justify-center rounded-full bg-foreground/10 hover:bg-destructive hover:text-background transition-colors"
                     >
                        <X className="size-2.5" />
                     </button>
                  )}
               </div>
            )
         )}
      </div>
   )
}

/* ─── Input area ───────────────────────────────────────── */

interface InputAreaProps {
   draft: string
   attachments: AttachmentItem[]
   isUploading: boolean
   isSending: boolean
   disabled: boolean
   isDragOver: boolean
   textareaRef: React.RefObject<HTMLTextAreaElement | null>
   fileInputRef: React.RefObject<HTMLInputElement | null>
   onDraftChange: (v: string) => void
   onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
   onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
   onSend: () => void
   onRemoveAttachment: (id: string) => void
   canSend: boolean
   model: "fast" | "reason"
   onModelChange: (m: "fast" | "reason") => void
}

function InputArea({
   draft,
   attachments,
   isUploading,
   isDragOver,
   textareaRef,
   fileInputRef,
   onDraftChange,
   onKeyDown,
   onPaste,
   onSend,
   onRemoveAttachment,
   disabled,
   canSend,
   model,
   onModelChange,
}: InputAreaProps) {
   return (
      <div
         className={cn(
            "rounded-3xl border border-border bg-muted/30",
            "shadow-sm transition-all duration-150",
            "focus-within:border-border/70 focus-within:shadow-md",
            isDragOver && "border-primary border-dashed shadow-md",
         )}
      >
         {/* Attachment previews */}
         <AttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />

         {/* Textarea */}
         <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder="Ask anything…"
            rows={1}
            disabled={disabled}
            aria-label="Message input"
            className={cn(
               "block max-h-[200px] w-full resize-none overflow-y-auto bg-transparent",
               "px-4 pb-2 pt-3.5 text-sm leading-6 text-foreground",
               "placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50",
            )}
         />

         {/* Toolbar */}
         <div className="flex items-center justify-between gap-2 px-3 pb-3">
            {/* ── Left controls ── */}
            <div className="flex items-center gap-1">
               {/* Attach dropdown */}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                        aria-label="Add attachment"
                        className="rounded-full size-9 border-border/70 bg-background text-foreground/75"
                     >
                        <Plus />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-48">
                     <DropdownMenuItem
                        onSelect={() => {
                           fileInputRef.current?.setAttribute("accept", "image/*")
                           fileInputRef.current?.click()
                        }}
                     >
                        <ImagePlus data-icon="inline-start" />
                        Add image
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onSelect={() => {
                           fileInputRef.current?.setAttribute("accept", "*/*")
                           fileInputRef.current?.click()
                        }}
                     >
                        <FileText data-icon="inline-start" />
                        Add file
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               {/* Tools placeholder */}
               <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="rounded-full text-muted-foreground"
               >
                  <Wrench data-icon="inline-start" />
                  <span className="hidden sm:inline">Tools</span>
               </Button>

               {/* Model toggle */}
               <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onModelChange(model === "fast" ? "reason" : "fast")}
                  className="rounded-full font-medium text-muted-foreground"
               >
                  {model === "fast" ? "Fast" : "Reason"}
                  <ChevronDown data-icon="inline-end" />
               </Button>
            </div>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-1.5">
               {/* Mic placeholder */}
               <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  aria-label="Voice input"
                  className="rounded-full text-muted-foreground"
               >
                  <Mic />
               </Button>

               {/* Send */}
               <Button
                  size="icon"
                  disabled={!canSend}
                  onClick={onSend}
                  loading={isUploading}
                  aria-label="Send message"
                  className="rounded-full size-9 bg-foreground text-background hover:opacity-90 hover:bg-foreground active:scale-[0.98]"
               >
                  <ArrowUp />
               </Button>
            </div>
         </div>
      </div>
   )
}

/* ─── Chat page ────────────────────────────────────────── */

export function ChatPage(props: { conversationId?: string }) {
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const [draft, setDraft] = useState("")
   const [streamText, setStreamText] = useState("")
   const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageLike[]>([])
   const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null)
   const [attachments, setAttachments] = useState<AttachmentItem[]>([])
   const [isDragOver, setIsDragOver] = useState(false)
   const [model, setModel] = useState<"fast" | "reason">("fast")

   // Derived — true while any attachment is still uploading
   const isUploading = attachments.some((a) => a.status === "uploading")
   const conversationId = props.conversationId ?? null

   const pendingMessageRef = useRef<UserMessageContentSchema | null>(null)
   const messagesEndRef = useRef<HTMLDivElement>(null)
   const textareaRef = useRef<HTMLTextAreaElement>(null)
   const fileInputRef = useRef<HTMLInputElement>(null)
   const dropZoneRef = useRef<HTMLDivElement>(null)

   const { mutate: startConversation, isPending: isStarting } = useStartConversation()

   const {
      data: conversation,
      isLoading: isLoadingConversation,
      error: conversationError,
   } = useConversation(conversationId ?? undefined)

   const { mutate: sendConversationMessage, isPending: isSending } = useSendConversationMessage()

   useSse(conversationId, {
      onToken: (payload) => {
         if (
            payload &&
            typeof payload === "object" &&
            "text" in payload &&
            typeof (payload as { text: unknown }).text === "string"
         ) {
            setStreamText((s) => s + (payload as { text: string }).text)
            return
         }
         if (typeof payload === "string") {
            setStreamText((s) => s + payload)
         }
      },
      onMessage: (payload) => {
         if (
            !conversationId ||
            !payload ||
            typeof payload !== "object" ||
            !("message" in payload)
         )
            return

         const { message } = payload as {
            message: {
               id: string
               author: string
               content: unknown
               createdAt: string
            }
         }

         queryClient.setQueryData<ConversationWithMembersAndMessages>(
            conversationQueryKeys.detail(conversationId),
            (old) => {
               if (!old) return old
               const exists = old.messages.some((m) => m.id === message.id)
               if (exists) return old
               return {
                  ...old,
                  messages: [
                     ...old.messages,
                     message as unknown as ConversationWithMembersAndMessages["messages"][number],
                  ],
               }
            }
         )
      },
      onDone: () => {
         setStreamText("")
         if (conversationId) {
            void queryClient.invalidateQueries({
               queryKey: conversationQueryKeys.detail(conversationId),
            })
         }
      },
   })

   // Auto-resize textarea
   // biome-ignore lint/correctness/useExhaustiveDependencies: resize whenever draft changes
   useEffect(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
   }, [draft])

   // Scroll to bottom on new messages
   // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages / stream
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
   }, [conversation?.messages, streamText, isSending])

   /* ─── Attachment helpers ─────────────────────────────── */

   const addFiles = useCallback((files: File[]) => {
      if (files.length === 0) return

      // Enforce 3-file maximum
      setAttachments((prev) => {
         const slots = 3 - prev.length
         if (slots <= 0) return prev

         const toAdd = Array.from(files).slice(0, slots)
         const items: AttachmentItem[] = toAdd.map((file) => {
            const isImage = file.type.startsWith("image/")
            return {
               id: crypto.randomUUID(),
               file,
               kind: isImage ? "image" : "file",
               previewUrl: isImage ? URL.createObjectURL(file) : undefined,
               status: "uploading",
            }
         })

         // Fire uploads outside the setState updater
         for (const item of items) {
            uploadFile(item.file, "chat")
               .then((url) => {
                  setAttachments((p) =>
                     p.map((a) => (a.id === item.id ? { ...a, status: "done", uploadedUrl: url } : a))
                  )
               })
               .catch(() => {
                  setAttachments((p) => p.map((a) => (a.id === item.id ? { ...a, status: "error" } : a)))
               })
         }

         return [...prev, ...items]
      })
   }, [])

   const removeAttachment = useCallback((id: string) => {
      setAttachments((prev) => {
         const item = prev.find((a) => a.id === id)
         if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
         return prev.filter((a) => a.id !== id)
      })
   }, [])

   /* ─── Paste ──────────────────────────────────────────── */

   const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
         const items = Array.from(e.clipboardData.items)
         const imageItems = items.filter((item) => item.type.startsWith("image/"))
         if (imageItems.length === 0) return
         e.preventDefault()
         const files = imageItems.map((item) => item.getAsFile()).filter((f): f is File => f !== null)
         addFiles(files)
      },
      [addFiles]
   )

   /* ─── Drag & drop ────────────────────────────────────── */

   const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
   }, [])

   const handleDragLeave = useCallback((e: React.DragEvent) => {
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
         setIsDragOver(false)
      }
   }, [])

   const handleDrop = useCallback(
      (e: React.DragEvent) => {
         e.preventDefault()
         e.stopPropagation()
         setIsDragOver(false)
         addFiles(Array.from(e.dataTransfer.files))
      },
      [addFiles]
   )

   const handleFileInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         addFiles(Array.from(e.target.files ?? []))
         e.target.value = ""
      },
      [addFiles]
   )

   /* ─── Send ───────────────────────────────────────────── */

   const dispatchMessage = useCallback(
      (content: UserMessageContentSchema, cid: string, optimisticId?: string) => {
         sendConversationMessage(
            {
               conversationId: cid,
               author: MessageAuthor.user,
               message: { content },
            },
            {
               onSettled: () => {
                  if (!optimisticId) return
                  setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId))
               },
            }
         )
      },
      [sendConversationMessage]
   )

   const handleSend = useCallback(() => {
      const text = draft.trim()
      const readyAttachments = attachments.filter((a) => a.status === "done" && a.uploadedUrl)

      if ((!text && readyAttachments.length === 0) || isSending || isUploading) return

      setDraft("")
      setStreamText("")

      // Clear attachments and revoke blob URLs
      setAttachments([])
      for (const a of attachments) if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)

      let content: UserMessageContentSchema
      if (readyAttachments.length === 0) {
         content = { contentType: ContentType.text, text }
      } else {
         const parts: MessagePartSchema[] = []
         if (text) parts.push({ type: PartType.text, text })
         for (const item of readyAttachments) {
            if (item.kind === "image") {
               // biome-ignore lint/style/noNonNullAssertion: filtered above
               parts.push({ type: PartType.image, url: item.uploadedUrl! })
            } else {
               parts.push({
                  type: PartType.file,
                  // biome-ignore lint/style/noNonNullAssertion: filtered above
                  url: item.uploadedUrl!,
                  name: item.file.name,
                  mimeType: item.file.type || "application/octet-stream",
               })
            }
         }
         content = { contentType: ContentType.multimodal_text, parts }
      }

      if (!conversationId) {
         pendingMessageRef.current = content
         startConversation(
            { type: ConversationType.ai },
            {
               onSuccess: (data) => {
                  void navigate({
                     to: "/chat/$conversationId",
                     params: { conversationId: data.id },
                  })
                  const pending = pendingMessageRef.current
                  pendingMessageRef.current = null
                  if (!pending) return
                  dispatchMessage(pending, data.id)
               },
            }
         )
         return
      }

      const optimisticId = crypto.randomUUID()
      setOptimisticMessages((prev) => [
         ...prev,
         {
            id: optimisticId,
            author: MessageAuthor.user,
            contentType: content.contentType,
            content,
            createdAt: new Date().toISOString(),
         },
      ])

      dispatchMessage(content, conversationId, optimisticId)
   }, [attachments, conversationId, dispatchMessage, draft, isSending, isUploading, navigate, startConversation])

   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
         if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
         }
      },
      [handleSend]
   )

   /* ─── Derived state ──────────────────────────────────── */

   const messages = conversation?.messages ?? []
   const renderedMessages = conversationId ? [...messages, ...optimisticMessages] : messages
   const showLoading =
      (conversationId === null && isStarting) ||
      (conversationId !== null && isLoadingConversation && conversation === undefined)

   const hasReadyAttachment = attachments.some((a) => a.status === "done" && a.uploadedUrl)
   const canSend = (draft.trim().length > 0 || hasReadyAttachment) && !isSending && !isUploading && !showLoading

   /* ─── Render ─────────────────────────────────────────── */

   return (
      // biome-ignore lint/a11y/noStaticElementInteractions: drag-drop zone
      <div
         ref={dropZoneRef}
         className="relative flex min-h-full flex-col"
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
      >
         {/* Drag overlay */}
         {isDragOver && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
               <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg">
                  <ImagePlus className="size-4" />
                  <p className="text-sm font-medium">Drop to attach</p>
               </div>
            </div>
         )}

         {/* ── Messages / Empty state ──────────────────────── */}
         {!conversationId ? (
            /* Empty state — no conversation selected */
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
               <div className="mb-8 text-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">{getTimeGreeting()}</h1>
                  <p className="mt-2 text-base text-muted-foreground">How can I help you today?</p>
               </div>

               {/* Centered input for empty state */}
               <div className="w-full max-w-2xl">
                  <InputArea
                     draft={draft}
                     attachments={attachments}
                     isUploading={isUploading}
                     isSending={isSending}
                     disabled={showLoading}
                     isDragOver={isDragOver}
                     textareaRef={textareaRef}
                     fileInputRef={fileInputRef}
                     onDraftChange={setDraft}
                     onKeyDown={handleKeyDown}
                     onPaste={handlePaste}
                     onSend={handleSend}
                     onRemoveAttachment={removeAttachment}
                     canSend={canSend}
                     model={model}
                     onModelChange={setModel}
                  />
               </div>
            </div>
         ) : conversationError ? (
            <div className="flex flex-1 items-center justify-center px-4">
               <p className="text-sm text-muted-foreground">Failed to load this conversation.</p>
            </div>
         ) : showLoading ? (
            <div className="flex flex-1 items-center justify-center px-4">
               <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
         ) : (
            /* Conversation with messages */
            <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1">
               <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-40 sm:space-y-8 sm:px-6 sm:pb-48">
                  {renderedMessages.map((m) => (
                     <MessageBubble key={m.id} message={m} onPreview={setPreviewItem} />
                  ))}
                  {streamText.length > 0 && <StreamingAssistantBubble text={streamText} />}
                  {isSending && streamText.length === 0 && <TypingIndicator />}
               </div>
               <div ref={messagesEndRef} className="h-1" />
            </div>
         )}

         {/* ── Sticky input (only shown in an active, loaded conversation) ── */}
         {conversationId && !conversationError && !showLoading && (
            <div className="sticky bottom-0 z-20 shrink-0 bg-background/95 backdrop-blur px-4 pb-6 pt-3 sm:px-6">
               <div className="mx-auto max-w-3xl">
                  <InputArea
                     draft={draft}
                     attachments={attachments}
                     isUploading={isUploading}
                     isSending={isSending}
                     disabled={showLoading}
                     isDragOver={isDragOver}
                     textareaRef={textareaRef}
                     fileInputRef={fileInputRef}
                     onDraftChange={setDraft}
                     onKeyDown={handleKeyDown}
                     onPaste={handlePaste}
                     onSend={handleSend}
                     onRemoveAttachment={removeAttachment}
                     canSend={canSend}
                     model={model}
                     onModelChange={setModel}
                  />
               </div>
            </div>
         )}

         {/* Hidden file input */}
         <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
         />

         {/* Media preview overlay */}
         {previewItem && (
            <div
               className="fixed inset-0 z-50 bg-black/80"
               role="dialog"
               aria-modal="true"
               onMouseDown={() => setPreviewItem(null)}
            >
               <div
                  className="relative h-full w-full"
                  onMouseDown={(e) => e.stopPropagation()}
               >
                  <Button
                     variant="ghost"
                     size="icon"
                     aria-label="Close preview"
                     onClick={() => setPreviewItem(null)}
                     className="absolute right-3 top-3 z-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                  >
                     <X className="size-5" />
                  </Button>

                  <div className="flex h-full w-full items-center justify-center p-4">
                     {previewItem.kind === "image" ? (
                        <img
                           src={previewItem.url}
                           alt={previewItem.alt ?? ""}
                           className="max-h-full w-auto max-w-full object-contain"
                        />
                     ) : previewItem.mimeType?.includes("pdf") || previewItem.url.toLowerCase().includes(".pdf") ? (
                        <iframe
                           src={previewItem.url}
                           title={previewItem.name ?? "File preview"}
                           className="h-full w-full rounded-lg bg-white"
                        />
                     ) : (
                        <a
                           href={previewItem.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                        >
                           Open file
                        </a>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
