import { NotificationChannel } from "@aqua-calendar/constants"
import { Bell, Mail, Globe } from "lucide-react"

export const NOTIFICATION_CHANNELS = [
  {
    channel: NotificationChannel.IN_APP,
    icon: Bell,
    title: "In-App",
    description: "Receive notifications within the app",
  },
  {
    channel: NotificationChannel.EMAIL,
    icon: Mail,
    title: "E-mail",
    description: "Receive notifications via email",
  },
  {
    channel: NotificationChannel.BROWSER,
    icon: Globe,
    title: "Browser",
    description: "Receive notifications via browser",
  },
]
