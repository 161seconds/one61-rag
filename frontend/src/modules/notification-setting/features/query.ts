import type { GetNotificationSettings } from "@aqua-calendar/constants"
import { notificationSettingQueryKeys } from "./query-key"
import { ENDPOINT_PATH } from "@/shared/constants"
import { useApi } from "@/shared/hooks"

export const useGetNotificationSettings = () => {
  return useApi<GetNotificationSettings>(
    notificationSettingQueryKeys.list(),
    `/${ENDPOINT_PATH.NOTIFICATION}/settings`,
    {},
    {
      staleTime: 1000 * 60 * 5,
    }
  )
}

export const useCheckBrowserNotification = (token: string) => {
  return useApi<boolean>(
    notificationSettingQueryKeys.subscription(),
    `/${ENDPOINT_PATH.NOTIFICATION}/settings/browser`,
    {
      params: {
        token,
      },
    },
    {
      staleTime: 1000 * 60 * 5,
    }
  )
}
