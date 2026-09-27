import { Injectable, Logger, type MessageEvent } from "@nestjs/common"
import { Subject, finalize, type Observable } from "rxjs"

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name)
  private readonly connections = new Map<string, Subject<MessageEvent>>()

  private getChannelKey(userId: string, conversationId: string): string {
    return `${userId}:${conversationId}`
  }

  connect(userId: string, conversationId = "global"): Observable<MessageEvent> {
    this.disconnect(userId, conversationId)

    const subject = new Subject<MessageEvent>()
    const channelKey = this.getChannelKey(userId, conversationId)
    this.connections.set(channelKey, subject)

    this.logger.debug(`SSE connected: ${channelKey}`)

    return subject.asObservable().pipe(
      finalize(() => {
        this.connections.delete(channelKey)
        this.logger.debug(`SSE disconnected: ${channelKey}`)
      })
    )
  }

  disconnect(userId: string, conversationId = "global"): void {
    const channelKey = this.getChannelKey(userId, conversationId)
    const existing = this.connections.get(channelKey)
    if (existing) {
      existing.complete()
      this.connections.delete(channelKey)
    }
  }

  emit(
    userId: string,
    conversationId: string,
    event: string,
    data: unknown
  ): void {
    const channelKey = this.getChannelKey(userId, conversationId)
    const subject = this.connections.get(channelKey)
    if (!subject) return
    subject.next({ type: event, data } as MessageEvent)
  }

  broadcast(event: string, data: unknown): void {
    for (const subject of this.connections.values()) {
      subject.next({ type: event, data } as MessageEvent)
    }
  }

  isConnected(userId: string, conversationId = "global"): boolean {
    return this.connections.has(this.getChannelKey(userId, conversationId))
  }
}
