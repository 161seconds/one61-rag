import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@aqua-calendar/ui/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@aqua-calendar/ui/components/tooltip"
import { PanelLeftClose, X } from "lucide-react"
import {
  APP_SIDEBAR_SECTIONS,
  getActiveSidebarSection,
} from "./sidebar-navigation"
import { ChatHistorySection } from "./chat-history-section"

/* ─── App Sidebar ─────────────────────────────────────── */

export interface AppSidebarProps {
  isCollapsed: boolean
  onCollapse: () => void
  onClose?: () => void
  showCloseButton?: boolean
}

export function AppSidebar({
  isCollapsed,
  onCollapse,
  onClose,
  showCloseButton = false,
}: AppSidebarProps) {
  const { pathname } = useLocation()
  const activeSection = getActiveSidebarSection(pathname)

  return (
    <div className="flex h-full flex-col select-none overflow-hidden">

      {/* ── Sidebar header ────────────────────────────────
          Collapse button (desktop) or close button (mobile)   */}
      <div className="flex h-10 shrink-0 items-center justify-end border-b border-border/60 px-2">
        {/* Mobile close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}

        {/* Desktop collapse button — only when expanded */}
        {!showCloseButton && !isCollapsed && (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCollapse}
                aria-label="Collapse sidebar"
                className="hidden lg:flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <PanelLeftClose className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav
        className={cn(
          "shrink-0 overflow-x-hidden py-2",
          isCollapsed ? "px-1.5" : "px-2",
        )}
        aria-label="Main navigation"
      >
        {!isCollapsed && (
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Main
          </p>
        )}

        <div className="space-y-0.5">
          {APP_SIDEBAR_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection.id === section.id

            const navLink = (
              <Link
                key={section.id}
                to={section.to}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-md h-8 transition-colors duration-150 cursor-pointer",
                  isCollapsed
                    ? "w-full justify-center px-0"
                    : "gap-2.5 px-2.5 w-full",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{section.label}</span>
                )}
              </Link>
            )

            return isCollapsed ? (
              <Tooltip key={section.id} delayDuration={300}>
                <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">{section.label}</TooltipContent>
              </Tooltip>
            ) : navLink
          })}
        </div>
      </nav>

      {/* ── Chat history (only when expanded) ──────────── */}
      {!isCollapsed && <ChatHistorySection />}

    </div>
  )
}
