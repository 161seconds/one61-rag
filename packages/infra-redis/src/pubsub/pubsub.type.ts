export type PubSubMode = "publisher" | "subscriber" | "both"

export interface PubSubModuleOptions {
  isGlobal?: boolean
  mode?: PubSubMode
}

export type PubSubHandler<TPayload> = (
  payload: TPayload
) => Promise<void> | void

export interface PublishParams<TPayload> {
  channel: string
  payload: TPayload
}

export interface SubscribeParams<TPayload> {
  channel: string
  handler: PubSubHandler<TPayload>
}
