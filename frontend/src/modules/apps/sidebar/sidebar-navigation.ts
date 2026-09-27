import {
  Calendar,
  Home,
  Settings,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AppSidebarSectionId = "home" | "calendar" | "chat" | "settings"

export interface AppSidebarSection {
  id: AppSidebarSectionId
  label: string
  to: "/" | "/calendar" | "/chat" | "/settings/preferences"
  icon: LucideIcon
  matchPrefixes: string[]
}

export const APP_SIDEBAR_SECTIONS: AppSidebarSection[] = [
  {
    id: "home",
    label: "Home",
    to: "/",
    icon: Home,
    matchPrefixes: ["/"],
  },
  {
    id: "calendar",
    label: "Calendar",
    to: "/calendar",
    icon: Calendar,
    matchPrefixes: ["/calendar"],
  },
  {
    id: "chat",
    label: "AI Assistant",
    to: "/chat",
    icon: Sparkles,
    matchPrefixes: ["/chat"],
  },
  {
    id: "settings",
    label: "Settings",
    to: "/settings/preferences",
    icon: Settings,
    matchPrefixes: ["/settings"],
  },
]

const startsWithSegment = (pathname: string, prefix: string) => {
  if (prefix === "/") return pathname === "/"
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export const getActiveSidebarSection = (pathname: string) => {
  return (
    APP_SIDEBAR_SECTIONS.find((section) =>
      section.matchPrefixes.some((prefix) =>
        startsWithSegment(pathname, prefix)
      )
    ) ?? APP_SIDEBAR_SECTIONS[1] // Default to Dashboard if not home
  )
}
