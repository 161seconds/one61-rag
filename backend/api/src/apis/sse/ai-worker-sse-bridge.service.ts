import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common"
import { SseService } from "./sse.service"

type BridgeTarget = {
  userId: string
  conversationId: string
}

@Injectable()
export class AiWorkerSseBridgeService implements OnModuleDestroy {
  private readonly logger = new Logger(AiWorkerSseBridgeService.name)
  private readonly activeStreams = new Map<string, AbortController>()
  private readonly workerSseUrl =
    process.env.AI_WORKER_SSE_URL ?? "https://mock-ai-worker.local/sse/stream"

  constructor(private readonly sseService: SseService) {}

  onModuleDestroy(): void {
    for (const controller of this.activeStreams.values()) {
      controller.abort()
    }
    this.activeStreams.clear()
  }

  startBridge(target: BridgeTarget): void {
    const streamKey = this.getStreamKey(target.userId, target.conversationId)
    this.stopBridge(target.userId, target.conversationId)

    const controller = new AbortController()
    this.activeStreams.set(streamKey, controller)

    void this.pipeWorkerStream(target, controller.signal).finally(() => {
      const active = this.activeStreams.get(streamKey)
      if (active === controller) {
        this.activeStreams.delete(streamKey)
      }
    })
  }

  stopBridge(userId: string, conversationId: string): void {
    const streamKey = this.getStreamKey(userId, conversationId)
    const controller = this.activeStreams.get(streamKey)
    if (!controller) return

    controller.abort()
    this.activeStreams.delete(streamKey)
  }

  private async pipeWorkerStream(
    target: BridgeTarget,
    signal: AbortSignal
  ): Promise<void> {
    const streamUrl = new URL(this.workerSseUrl)
    streamUrl.searchParams.set("conversationId", target.conversationId)
    streamUrl.searchParams.set("userId", target.userId)

    this.sseService.emit(target.userId, target.conversationId, "ai:start", {
      conversationId: target.conversationId,
      workerUrl: streamUrl.toString(),
    })

    try {
      const response = await fetch(streamUrl, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
        signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(
          `Worker SSE connect failed: ${response.status} ${response.statusText}`
        )
      }

      await this.readAndForwardSse(response.body, target, signal)

      this.sseService.emit(target.userId, target.conversationId, "ai:done", {
        conversationId: target.conversationId,
      })
    } catch (error) {
      if (signal.aborted) {
        this.logger.debug(
          `Worker SSE aborted: ${target.userId}:${target.conversationId}`
        )
        return
      }

      const message =
        error instanceof Error ? error.message : "Unknown worker SSE error"
      this.logger.error(message)
      this.sseService.emit(target.userId, target.conversationId, "ai:error", {
        conversationId: target.conversationId,
        message,
      })
    }
  }

  private async readAndForwardSse(
    body: ReadableStream<Uint8Array>,
    target: BridgeTarget,
    signal: AbortSignal
  ): Promise<void> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let eventName = "message"
    let dataLines: string[] = []

    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim() || "message"
          continue
        }
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim())
          continue
        }
        if (line === "") {
          if (dataLines.length > 0) {
            const rawData = dataLines.join("\n")
            this.sseService.emit(
              target.userId,
              target.conversationId,
              this.mapWorkerEvent(eventName),
              this.safeJson(rawData)
            )
          }
          eventName = "message"
          dataLines = []
        }
      }
    }
  }

  private safeJson(data: string): unknown {
    try {
      return JSON.parse(data)
    } catch {
      return { text: data }
    }
  }

  private mapWorkerEvent(eventName: string): string {
    if (eventName === "token" || eventName === "delta") {
      return "ai:token"
    }
    if (eventName === "done") {
      return "ai:done"
    }
    if (eventName === "error") {
      return "ai:error"
    }
    return "ai:message"
  }

  private getStreamKey(userId: string, conversationId: string): string {
    return `${userId}:${conversationId}`
  }
}
