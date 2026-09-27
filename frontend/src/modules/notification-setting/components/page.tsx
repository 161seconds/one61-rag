import { NOTIFICATION_CHANNELS } from "../notification-setting.constant"
import { NotificationChannelSetting } from "./notification-channel-setiing"
import { NotificationSettingSkeleton } from "./skeleton"
import { useNotificationSettings } from "../hooks"
import { NotificationChannel } from "@aqua-calendar/constants"

function NotificationSettingPage() {
  const { settings, isLoading, handleChange, activeChannel, isLoadingBrowser } =
    useNotificationSettings()

  if (isLoading) {
    return <NotificationSettingSkeleton />
  }
  return (
    <div className="m-auto max-w-4xl px-12">
      <div className="pt-6 pb-8">
        <h1 className="text-xl">Notification Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage how you receive updates from your workspace.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {NOTIFICATION_CHANNELS.map((channel) => (
          <NotificationChannelSetting
            {...channel}
            key={channel.channel}
            isEnabled={settings[channel.channel]}
            loading={
              activeChannel === channel.channel ||
              (channel.channel === NotificationChannel.BROWSER &&
                isLoadingBrowser)
            }
            onToggle={() => handleChange(channel.channel)}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationSettingPage
