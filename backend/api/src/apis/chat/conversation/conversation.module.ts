import {
  ConversationAiController,
  ConversationController,
} from "./conversation.controller"
import { ConversationService } from "./conversation.service"
import { Module } from "@nestjs/common"

@Module({
  controllers: [ConversationController, ConversationAiController],
  providers: [ConversationService],
})
export class ConversationModule {}
