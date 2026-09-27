import { InjectRedisPubSubPublisher, InjectRedisPubSubSubscriber } from "./pubsub.decorator"
import { PublishParams, PubSubHandler, SubscribeParams } from "./pubsub.type"
import { Injectable, Logger, OnModuleDestroy, Optional } from "@nestjs/common"
import superjson from "superjson"
import { Redis } from "ioredis"

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name)
  private readonly channelHandlers = new Map<string, Set<PubSubHandler<unknown>>>()
  private isMessageListenerBound = false

  constructor(
    @Optional()
    @InjectRedisPubSubPublisher()
    private readonly publisher?: Redis,
    @Optional()
    @InjectRedisPubSubSubscriber()
    private readonly subscriber?: Redis
  ) {
    this.bindMessageListener()
  }

  public async publish<TPayload>({
    channel,
    payload,
  }: PublishParams<TPayload>): Promise<number> {
    const publisher = this.getPublisher()
    const serialized = superjson.stringify(payload)
    return publisher.publish(channel, serialized)
  }

  public async subscribe<TPayload>({
    channel,
    handler,
  }: SubscribeParams<TPayload>): Promise<void> {
    const subscriber = this.getSubscriber()
    const handlers = this.channelHandlers.get(channel) ?? new Set()
    handlers.add(handler as PubSubHandler<unknown>)
    this.channelHandlers.set(channel, handlers)
    await subscriber.subscribe(channel)
  }

  public async unsubscribe(channel: string): Promise<void> {
    const subscriber = this.getSubscriber()
    this.channelHandlers.delete(channel)
    await subscriber.unsubscribe(channel)
  }

  public async onModuleDestroy(): Promise<void> {
    if (!this.subscriber) {
      return
    }
    const channels = [...this.channelHandlers.keys()]
    if (channels.length > 0) {
      await this.subscriber.unsubscribe(...channels)
    }
    this.channelHandlers.clear()
  }

  private bindMessageListener(): void {
    if (this.isMessageListenerBound || !this.subscriber) {
      return
    }

    this.subscriber.on("message", (channel, rawMessage) => {
      const handlers = this.channelHandlers.get(channel)
      if (!handlers || handlers.size === 0) {
        return
      }

      let payload: unknown
      try {
        payload = superjson.parse(rawMessage)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown parse error"
        this.logger.error(
          `Failed to parse pub/sub message on channel ${channel}: ${message}`
        )
        return
      }

      handlers.forEach((handler) => {
        void Promise.resolve(handler(payload)).catch((error) => {
          const message =
            error instanceof Error ? error.message : "Unknown handler error"
          const stack = error instanceof Error ? error.stack : undefined
          this.logger.error(
            `Pub/Sub handler failed on channel ${channel}: ${message}`,
            stack
          )
        })
      })
    })

    this.isMessageListenerBound = true
  }

  private getPublisher(): Redis {
    if (!this.publisher) {
      throw new Error(
        "PubSubService publisher is not configured. Initialize PubSubModule with mode 'publisher' or 'both'."
      )
    }
    return this.publisher
  }

  private getSubscriber(): Redis {
    if (!this.subscriber) {
      throw new Error(
        "PubSubService subscriber is not configured. Initialize PubSubModule with mode 'subscriber' or 'both'."
      )
    }
    return this.subscriber
  }
}
