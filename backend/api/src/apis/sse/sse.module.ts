import { Global, Module } from "@nestjs/common"
import { AiWorkerSseBridgeService } from "./ai-worker-sse-bridge.service"
import { SseController } from "./sse.controller"
import { SseService } from "./sse.service"

@Global()
@Module({
  controllers: [SseController],
  providers: [SseService, AiWorkerSseBridgeService],
  exports: [SseService, AiWorkerSseBridgeService],
})
export class SseModule {}
