import {
  ContentType,
  ConversationType,
  conversationListCursorPayloadSchema,
  SendConversationMessageSchema,
  type AiResponseSchema,
  type StartConversationSchema,
  type UpdateConversationMemberSelfSchema,
  type UpdateConversationSchema,
} from "@aqua-calendar/constants"
import {
  ConversationMemberRole,
  MessageAuthor,
  MessageStatus,
  type Conversation,
  type ConversationMember,
  type Message,
} from "@aqua-calendar/database"
import {
  BullQueueName,
  type ConversationQueuePayload,
} from "@aqua-calendar/infra-redis"
import { PrismaService } from "../../../prisma"
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { AiWorkerSseBridgeService, SseService } from "../../sse"
import { InjectQueue } from "@nestjs/bullmq"
import { v4 as uuidv4 } from "uuid"
import { Queue } from "bullmq"

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

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiWorkerSseBridgeService: AiWorkerSseBridgeService,
    private readonly sseService: SseService,
    @InjectQueue(BullQueueName.CONVERSATION_QUEUE)
    private readonly conversationQueue: Queue<ConversationQueuePayload>
  ) { }

  async listConversations(
    userId: string,
    options: { limit: number; cursor?: string }
  ): Promise<ListConversationsPage> {
    const take = options.limit + 1
    const cursorPayload = options.cursor
      ? this.decodeListCursor(options.cursor)
      : null

    const whereMember = { members: { some: { userId } } } as const
    const where =
      cursorPayload === null
        ? whereMember
        : {
          ...whereMember,
          OR: [
            { updatedAt: { lt: new Date(cursorPayload.u) } },
            {
              AND: [
                { updatedAt: new Date(cursorPayload.u) },
                { id: { lt: cursorPayload.i } },
              ],
            },
          ],
        }

    const rows = await this.prismaService.conversation.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take,
      include: {
        members: true,
      },
    })

    const hasMore = rows.length > options.limit
    const items = hasMore ? rows.slice(0, options.limit) : rows
    const last = items[items.length - 1]
    const nextCursor =
      hasMore && last
        ? this.encodeListCursor({ u: last.updatedAt.toISOString(), i: last.id })
        : null

    return { items, nextCursor }
  }

  private encodeListCursor(payload: { u: string; i: string }): string {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
  }

  private decodeListCursor(cursor: string): { u: string; i: string } {
    let json: string
    try {
      json = Buffer.from(cursor, "base64url").toString("utf8")
    } catch {
      throw new BadRequestException("Invalid cursor")
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new BadRequestException("Invalid cursor")
    }
    const result = conversationListCursorPayloadSchema.safeParse(parsed)
    if (!result.success) {
      throw new BadRequestException("Invalid cursor")
    }
    return result.data
  }

  async startConversation(
    userId: string,
    body: StartConversationSchema
  ): Promise<ConversationWithMembersAndMessages> {
    const id = body.id ?? uuidv4()
    const type = body.type ?? ConversationType.ai

    const existing = await this.prismaService.conversation.findUnique({
      where: { id },
    })
    if (existing) {
      throw new ConflictException()
    }

    return this.prismaService.conversation.create({
      data: {
        id,
        type,
        title: body.title ?? null,
        members: {
          create: {
            userId,
            role: ConversationMemberRole.member,
          },
        },
      },
      include: {
        members: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    })
  }

  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<ConversationWithMembersAndMessages> {
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        members: { some: { userId } },
      },
      include: {
        members: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!conversation) {
      throw new NotFoundException()
    }

    return conversation
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    body: UpdateConversationSchema
  ): Promise<ConversationWithMembersAndMessages> {
    await this.requireMembership(conversationId, userId)

    return this.prismaService.conversation.update({
      where: { id: conversationId },
      data: { title: body.title },
      include: {
        members: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    })
  }

  async updateMyMembership(
    conversationId: string,
    userId: string,
    body: UpdateConversationMemberSelfSchema
  ): Promise<ConversationWithMembersAndMessages> {
    const membership = await this.prismaService.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    })
    if (!membership) {
      throw new NotFoundException()
    }

    await this.prismaService.conversationMember.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        lastReadAt: body.lastReadAt,
      },
    })

    return this.getConversation(conversationId, userId)
  }

  async leaveConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const membership = await this.prismaService.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    })
    if (!membership) {
      throw new NotFoundException()
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.conversationMember.delete({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      })

      const remaining = await tx.conversationMember.count({
        where: { conversationId },
      })
      if (remaining === 0) {
        await tx.conversation.delete({ where: { id: conversationId } })
      }
    })
  }

  async sendConversationMessage(
    body: SendConversationMessageSchema,
    userId: string
  ): Promise<ConversationWithMembersAndMessages> {
    const { conversationId, message, type, author } = body

    const senderId = author === MessageAuthor.user ? userId : undefined

    const messageData = {
      senderId,
      author,
      contentType: message.content.contentType,
      content: message.content,
      status: MessageStatus.sent,
    }

    const conversation = await this.prismaService.$transaction(async (tx) => {
      const existing = await tx.conversation.findUnique({
        where: { id: conversationId },
      })

      if (!existing) {
        const conversationType = type ?? ConversationType.ai

        return tx.conversation.create({
          data: {
            id: conversationId,
            type: conversationType,
            members: {
              create: {
                userId,
                role: ConversationMemberRole.member,
              },
            },
            messages: {
              create: messageData,
            },
          },
          include: {
            members: true,
            messages: { orderBy: { createdAt: "asc" } },
          },
        })
      }

      const membership = await tx.conversationMember.findUnique({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      })
      if (!membership) {
        throw new ForbiddenException()
      }

      await tx.message.create({
        data: {
          conversationId,
          ...messageData,
        },
      })

      return tx.conversation.findUniqueOrThrow({
        where: { id: conversationId },
        include: {
          members: true,
          messages: { orderBy: { createdAt: "asc" } },
        },
      })
    })

    if (author === MessageAuthor.user) {
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      if (lastMessage) {
        this.enqueueForAi({
          conversationId,
          userId,
          messageId: lastMessage.id,
          content: lastMessage.content as ConversationQueuePayload["content"],
        })
      }
    }

    return conversation
  }

  async receiveAiResponse(body: AiResponseSchema): Promise<void> {
    const { conversationId, userId, content } = body

    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) {
      throw new NotFoundException("Conversation not found")
    }

    const message = await this.prismaService.message.create({
      data: {
        conversationId,
        author: MessageAuthor.assistant,
        contentType: content.contentType,
        content,
        status: MessageStatus.sent,
      },
    })

    this.sseService.emit(userId, conversationId, "ai:message", {
      conversationId,
      message: {
        id: message.id,
        author: message.author,
        content,
        createdAt: message.createdAt,
      },
    })

    this.sseService.emit(userId, conversationId, "ai:done", {
      conversationId,
    })
  }

  private mockAiResponse(conversationId: string, userId: string): void {
    const mockText = "Xìn chào! tôi có thể giúp gì cho bạn?"
    const tokens = mockText.split(" ")

    setTimeout(async () => {
      for (let i = 0; i < tokens.length; i++) {
        const text = (i === 0 ? "" : " ") + tokens[i]
        this.sseService.emit(userId, conversationId, "ai:token", { text })
        await new Promise((r) => setTimeout(r, 50))
      }

      await this.receiveAiResponse({
        conversationId,
        userId,
        content: { contentType: ContentType.text, text: mockText },
      })
    }, 500)
  }

  private async enqueueForAi(
    payload: ConversationQueuePayload
  ): Promise<void> {
    try {
      await this.conversationQueue.add(
        BullQueueName.CONVERSATION_QUEUE,
        payload
      )
    } catch (error) {
      this.logger.error(
        `Failed to enqueue conversation job: ${payload.conversationId}`,
        error instanceof Error ? error.stack : error
      )
    }
  }

  private async requireMembership(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const membership = await this.prismaService.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    })
    if (!membership) {
      throw new ForbiddenException()
    }
  }
}
