import { useCallback, useState } from "react"

const KEY_COLLAPSED = "aqua:sidebar-collapsed"
const KEY_WIDTH = "aqua:sidebar-width"

const DEFAULT_WIDTH = 220
const MIN_WIDTH = 160
const MAX_WIDTH = 420

function readBool(key: string, fallback: boolean): boolean {
  try { return localStorage.getItem(key) === "true" } catch { return fallback }
}
function readNum(key: string, fallback: number): number {
  try { const v = localStorage.getItem(key); return v ? Number(v) : fallback } catch { return fallback }
}
function persist(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* quota / private */ }
}

export { MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH }

/**
 * Unified sidebar state:
 * - isCollapsed  – icon-only mode (persisted)
 * - sidebarWidth – expanded pixel width (persisted, clamped to MIN–MAX)
 * - isMobileOpen – mobile drawer visible (in-memory only)
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(() => readBool(KEY_COLLAPSED, false))
  const [sidebarWidth, _setSidebarWidth] = useState(() => readNum(KEY_WIDTH, DEFAULT_WIDTH))
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const setSidebarWidth = useCallback((w: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w))
    _setSidebarWidth(clamped)
    persist(KEY_WIDTH, String(clamped))
  }, [])

  const collapse = useCallback(() => {
    setIsCollapsed(true)
    persist(KEY_COLLAPSED, "true")
  }, [])

  const expand = useCallback(() => {
    setIsCollapsed(false)
    persist(KEY_COLLAPSED, "false")
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      persist(KEY_COLLAPSED, String(!prev))
      return !prev
    })
  }, [])

  const openMobile  = useCallback(() => setIsMobileOpen(true), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])
  const toggleMobile = useCallback(() => setIsMobileOpen((v) => !v), [])

  return {
    isCollapsed,
    sidebarWidth,
    isMobileOpen,
    setSidebarWidth,
    collapse,
    expand,
    toggleCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
  } as const
}
