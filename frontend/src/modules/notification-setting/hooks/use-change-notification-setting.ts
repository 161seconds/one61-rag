import {
  notificationSettingQueryKeys,
  updateNotificationSetting,
} from "../features"
import {
  NotificationChannel,
  type NotificationSetting,
} from "@aqua-calendar/constants"
import { useCallback, useEffect, useRef } from "react"
import { debounce, type DebouncedFunc } from "lodash"
import type { ApiResponse } from "@/shared/hooks"
import { queryClient } from "@/libs"

interface UseChangeNotificationSettingOptions {
  onEnableBrowser?: () => void
}

interface UseChangeNotificationSettingPayload {
  channel: NotificationChannel
  enabled: boolean
}

export const useChangeNotificationSetting = (
  options: UseChangeNotificationSettingOptions
) => {
  const onEnableBrowserRef = useRef(options?.onEnableBrowser)
  onEnableBrowserRef.current = options?.onEnableBrowser

  const debouncedMutationRef = useRef<DebouncedFunc<
    (payload: UseChangeNotificationSettingPayload) => Promise<void>
  > | null>(null)
  const originalDataRef = useRef<ApiResponse<NotificationSetting[]> | null>(
    null
  )

  if (!debouncedMutationRef.current) {
    debouncedMutationRef.current = debounce(
      async (payload: UseChangeNotificationSettingPayload) => {
        try {
          const { channel, enabled } = payload
          if (channel === NotificationChannel.BROWSER && enabled) {
            const onEnableBrowser = onEnableBrowserRef.current
            if (onEnableBrowser) {
              await onEnableBrowser()
            } else {
              throw new Error(
                "onEnableBrowser is required when enabling browser notifications"
              )
            }
          } else {
            await updateNotificationSetting(channel, enabled)
          }
          queryClient.setQueryData(
            notificationSettingQueryKeys.list(),
            (old: ApiResponse<NotificationSetting[]> | undefined) => {
              if (!old) {
                return [
                  { channel: payload.channel, enabled: payload.enabled },
                ] as NotificationSetting[]
              }
            }
          )
          originalDataRef.current = null
        } catch {
          if (originalDataRef.current) {
            queryClient.setQueryData(
              notificationSettingQueryKeys.list(),
              originalDataRef.current
            )
            originalDataRef.current = null
          }
        }
      },
      300
    )
  }

  useEffect(() => {
    return () => {
      if (debouncedMutationRef.current) {
        debouncedMutationRef.current.cancel()
      }
    }
  }, [])

  const updateOptimistically = useCallback(
    async (payload: UseChangeNotificationSettingPayload) => {
      await queryClient.cancelQueries({
        queryKey: notificationSettingQueryKeys.list(),
      })

      if (!originalDataRef.current) {
        const currentData = queryClient.getQueryData<
          ApiResponse<NotificationSetting[]>
        >(notificationSettingQueryKeys.list())
        originalDataRef.current = currentData || null
      }

      queryClient.setQueryData(
        notificationSettingQueryKeys.list(),
        (old: ApiResponse<NotificationSetting[]> | undefined) => {
          if (!old) {
            return [
              { channel: payload.channel, enabled: payload.enabled },
            ] as NotificationSetting[]
          }

          const existingValues = Array.isArray(old) ? old : []

          let found = false
          const updatedValues = existingValues.map(
            (setting: NotificationSetting) => {
              if (setting.channel === payload.channel) {
                found = true
                return {
                  ...setting,
                  enabled: payload.enabled,
                }
              }
              return setting
            }
          )

          if (!found) {
            updatedValues.push({
              channel: payload.channel,
              enabled: payload.enabled,
            })
          }

          return updatedValues
        }
      )

      debouncedMutationRef.current?.(payload)
    },
    [queryClient]
  )

  return {
    mutateAsync: updateOptimistically,
  }
}
