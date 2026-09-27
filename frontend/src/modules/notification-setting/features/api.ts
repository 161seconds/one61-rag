import { ENDPOINT_PATH } from "@/shared/constants"
import { httpRequest } from "@/libs"
import type { NotificationChannel } from "@aqua-calendar/constants"

export const checkBrowserSubscription = (browser: string, token: string) => {
  return httpRequest.get(
    `/${ENDPOINT_PATH.NOTIFICATION}/settings/browser/subscribe?browser=${browser}&token=${token}`
  )
}

export const enableBrowserSubscription = (browser: string, token: string) => {
  return httpRequest.post(
    `/${ENDPOINT_PATH.NOTIFICATION}/settings/browser/subscribe`,
    { browser, token }
  )
}

export const updateNotificationSetting = (
  channel: NotificationChannel,
  enabled: boolean
) => {
  return httpRequest.patch(
    `/${ENDPOINT_PATH.NOTIFICATION}/settings/channels/${channel}`,
    {
      enabled,
    }
  )
}
