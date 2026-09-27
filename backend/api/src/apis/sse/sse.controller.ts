import { Controller, Req, Sse, UseGuards, type MessageEvent } from "@nestjs/common"
import { CurrentUser, JwtAccessToken, JwtAccessTokenGuard } from "../../passport"
import type { Request } from "express"
import { SseService } from "./sse.service"
import type { Observable } from "rxjs"
import { Query } from "@nestjs/common"

@Controller("sse")
@UseGuards(JwtAccessTokenGuard)
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse("stream")
  stream(
    @CurrentUser() user: JwtAccessToken,
    @Req() req: Request,
    @Query("conversationId") conversationId?: string
  ): Observable<MessageEvent> {
    const streamConversationId = conversationId?.trim() || "global"
    const observable = this.sseService.connect(user.userId, streamConversationId)

    req.on("close", () => {
      this.sseService.disconnect(user.userId, streamConversationId)
    })

    return observable
  }
}
