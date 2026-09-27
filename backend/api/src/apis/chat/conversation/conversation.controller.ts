import {
  aiResponseSchema,
  type AiResponseSchema,
  listConversationsQuerySchema,
  type ListConversationsQuerySchema,
  sendConversationMessageSchema,
  SendConversationMessageSchema,
  startConversationSchema,
  StartConversationSchema,
  updateConversationMemberSelfSchema,
  UpdateConversationMemberSelfSchema,
  updateConversationSchema,
  UpdateConversationSchema,
} from "@aqua-calendar/constants"
import {
  type Conversation,
  type ConversationMember,
  type Message,
} from "@aqua-calendar/database"
import {
  ConversationService,
  type ConversationWithMembersAndMessages,
  type ListConversationsPage,
} from "./conversation.service"
import {
  CurrentUser,
  JwtAccessToken,
  JwtAccessTokenGuard,
} from "../../../passport"
import { ZodValidationPipe } from "../../../shared/pipe"
import { z } from "zod"
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common"

@Controller("conversations")
@UseGuards(JwtAccessTokenGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async listConversations(
    @CurrentUser() user: JwtAccessToken,
    @Query(new ZodValidationPipe(listConversationsQuerySchema))
    query: ListConversationsQuerySchema
  ): Promise<ListConversationsPage> {
    const limit = query.limit ?? 50
    return this.conversationService.listConversations(user.userId, {
      limit,
      cursor: query.cursor,
    })
  }

  @Post("start")
  async startConversation(
    @CurrentUser() user: JwtAccessToken,
    @Body(new ZodValidationPipe(startConversationSchema))
    body: StartConversationSchema
  ): Promise<ConversationWithMembersAndMessages> {
    return this.conversationService.startConversation(user.userId, body)
  }

  @Get(":conversationId")
  async getConversation(
    @CurrentUser() user: JwtAccessToken,
    @Param(
      "conversationId",
      new ZodValidationPipe(z.string().uuid())
    )
    conversationId: string
  ): Promise<
    Conversation & {
      members: ConversationMember[]
      messages: Message[]
    }
  > {
    return this.conversationService.getConversation(
      conversationId,
      user.userId
    )
  }

  @Patch(":conversationId/me")
  async updateMyMembership(
    @CurrentUser() user: JwtAccessToken,
    @Param(
      "conversationId",
      new ZodValidationPipe(z.string().uuid())
    )
    conversationId: string,
    @Body(new ZodValidationPipe(updateConversationMemberSelfSchema))
    body: UpdateConversationMemberSelfSchema
  ): Promise<ConversationWithMembersAndMessages> {
    return this.conversationService.updateMyMembership(
      conversationId,
      user.userId,
      body
    )
  }

  @Patch(":conversationId")
  async updateConversation(
    @CurrentUser() user: JwtAccessToken,
    @Param(
      "conversationId",
      new ZodValidationPipe(z.string().uuid())
    )
    conversationId: string,
    @Body(new ZodValidationPipe(updateConversationSchema))
    body: UpdateConversationSchema
  ): Promise<ConversationWithMembersAndMessages> {
    return this.conversationService.updateConversation(
      conversationId,
      user.userId,
      body
    )
  }

  @Delete(":conversationId")
  async leaveConversation(
    @CurrentUser() user: JwtAccessToken,
    @Param(
      "conversationId",
      new ZodValidationPipe(z.string().uuid())
    )
    conversationId: string
  ): Promise<void> {
    return this.conversationService.leaveConversation(
      conversationId,
      user.userId
    )
  }

  @Post()
  async sendConversationMessage(
    @CurrentUser() user: JwtAccessToken,
    @Body(new ZodValidationPipe(sendConversationMessageSchema))
    body: SendConversationMessageSchema
  ): Promise<
    Conversation & {
      members: ConversationMember[]
      messages: Message[]
    }
  > {
    return this.conversationService.sendConversationMessage(body, user.userId)
  }
}

@Controller("conversations/ai")
export class ConversationAiController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post("response")
  async receiveAiResponse(
    @Body(new ZodValidationPipe(aiResponseSchema))
    body: AiResponseSchema
  ): Promise<void> {
    return this.conversationService.receiveAiResponse(body)
  }
}
