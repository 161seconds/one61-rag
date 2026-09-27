import { NotificationChannel } from "@aqua-calendar/constants"
import { useGetNotificationSettings } from "../features"
import { useBrowserNotification } from "./use-browser-notification"
import { useChangeNotificationSetting } from "./use-change-notification-setting"
import { useMemo, useState } from "react"

export const useNotificationSettings = () => {
  const { data, isLoading } = useGetNotificationSettings()
  const {
    enableBrowserNotification,
    isEnabled,
    isChecking,
    loading: loadingBrowser,
  } = useBrowserNotification()
  const [activeChannel, setActiveChannel] =
    useState<NotificationChannel | null>(null)
  const { mutateAsync: changeNotificationSetting } =
    useChangeNotificationSetting({
      onEnableBrowser: enableBrowserNotification,
    })
  const settingsMap = useMemo(() => {
    const base: Record<NotificationChannel, boolean> = {
      [NotificationChannel.EMAIL]: true,
      [NotificationChannel.IN_APP]: true,
      [NotificationChannel.BROWSER]: false,
    }

    data?.forEach((s) => {
      base[s.channel] = s.enabled
    })

    return base
  }, [data])

  const settings = {
    ...settingsMap,
    [NotificationChannel.BROWSER]:
      isEnabled && settingsMap[NotificationChannel.BROWSER] && !isChecking,
  }

  const handleChange = async (channel: NotificationChannel) => {
    const currentEnabled = settings[channel]

    setActiveChannel(channel)
    try {
      await changeNotificationSetting({
        channel,
        enabled: !currentEnabled,
      })
    } finally {
      setActiveChannel(null)
    }
  }

  return {
    settings,
    isLoading: isLoading || isChecking,
    isLoadingBrowser: loadingBrowser,
    handleChange,
    activeChannel,
  }
}
