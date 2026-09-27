export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  BROWSER = "browser",
}

export interface NotificationSetting {
  channel: NotificationChannel
  enabled: boolean
}

export type GetNotificationSettings = NotificationSetting[]
