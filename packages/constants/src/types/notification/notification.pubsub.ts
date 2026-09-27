export enum NotificationPubsubDelivery {
  FCM = "fcm",
  SES = "ses",
}

export interface NotificationPubsubDeliveryPayload {
  delivery: NotificationPubsubDelivery
  recipients: {
    emails?: string[]
    pushTokens?: string[]
    socketIds?: string[]
  }
  data: Record<string, any>
}
