/* eslint-disable react-refresh/only-export-components */
import { useVirtualizer } from "@tanstack/react-virtual"
import dayjs, { type Dayjs } from "dayjs"
import {
  createContext,
  type MutableRefObject,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react"
import { useEventListener, useResizeObserver } from "usehooks-ts"
import type { Position } from "@atlaskit/pragmatic-drag-and-drop/types"

import type { CalendarChartViewData, CalendarViewUnit } from "../../constants"
import {
  calculateDateByPosition,
  duration,
  formatDate,
  getCalendarChartView,
} from "../grid/grid-helper"

type CalendarDragInfo = {
  type: "calendar"
  smp: Position
  originalDate: string
  previousDayDelta: number
  previousHourDelta: number
  dayDelta: number
  hourDelta: number
}

type CalendarTimelineContextProps = {
  currentView: CalendarChartViewData
  setCurrentView: (view: CalendarChartViewData) => void
  dragInfoRef: MutableRefObject<CalendarDragInfo | null>
  extendView: (direction: null | "left" | "right", targetDate?: string) => void
  scrollRef: MutableRefObject<HTMLDivElement | null>
  placeholderRef: MutableRefObject<HTMLDivElement | null>
  navigateToDate: (targetDate: string | Date | Dayjs) => void
  visibleRange: { startDate: string; endDate: string }
  isViewReady: boolean
}

type CalendarVirtualizerContextProps = {
  calendarVirtualizer: ReturnType<
    typeof useVirtualizer<HTMLDivElement, Element>
  >
}

const CalendarVirtualizerContext = createContext<
  CalendarVirtualizerContextProps | undefined
>(undefined)
const CalendarTimelineContext = createContext<
  CalendarTimelineContextProps | undefined
>(undefined)

type CalendarTimelineProviderProps = PropsWithChildren<{
  sidebarWidth?: number
  initialViewUnit?: CalendarViewUnit
}>

export const CalendarTimelineProvider = ({
  children,
  sidebarWidth = 0,
  initialViewUnit = "calendar-week",
}: CalendarTimelineProviderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragInfoRef = useRef<CalendarDragInfo | null>(null)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapReleaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const isSnappingRef = useRef(false)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const scrollElementRef = scrollRef as unknown as RefObject<HTMLElement>
  const [currentView, setCurrentView] = useState(() =>
    getCalendarChartView(initialViewUnit)
  )
  const [visibleRange, setVisibleRange] = useState({
    startDate: currentView.timeline.startDate,
    endDate: dayjs(currentView.timeline.startDate)
      .add(7, "day")
      .format("YYYY-MM-DD"),
  })
  const [isViewReady, setIsViewReady] = useState(false)
  const { width = 0 } = useResizeObserver({
    ref: scrollElementRef,
    box: "border-box",
  })
  const isCalendarDayWidthCalculated = useRef(false)

  useEffect(() => {
    if (width > 0) {
      const isDay = currentView.unit === "calendar-day"
      const divisor = isDay ? 1 : 5
      const newDayWidth = Math.max((width - sidebarWidth) / divisor, 0)
      isCalendarDayWidthCalculated.current = true
      setCurrentView((prev) =>
        prev.dayWidth === newDayWidth
          ? prev
          : { ...prev, dayWidth: newDayWidth }
      )
    }
  }, [width, sidebarWidth, currentView.unit])

  useEffect(() => {
    if (initialViewUnit !== currentView.key) {
      setIsViewReady(false)
      setCurrentView(getCalendarChartView(initialViewUnit))
    }
  }, [initialViewUnit, currentView.key])

  const estimateSize = (_: number, view: CalendarChartViewData): number => {
    const totalDays = view.unit === "calendar-week" ? 7 : 1
    return totalDays * view.dayWidth
  }

  const calendarVirtualizer = useVirtualizer({
    count: duration(
      currentView.timeline,
      currentView.unit === "calendar-week" ? "week" : "day"
    ),
    getScrollElement: () => scrollRef.current,
    horizontal: true,
    estimateSize: (index: number) => estimateSize(index, currentView),
    getItemKey: (index) => {
      if (currentView.unit === "calendar-week") {
        return dayjs(currentView.timeline.startDate)
          .add(index, "week")
          .format("YYYY-MM-DD")
      }
      return dayjs(currentView.timeline.startDate)
        .add(index, "day")
        .format("YYYY-MM-DD")
    },
    overscan: 3,
  })

  const extendView = useCallback(
    (direction: null | "left" | "right", targetDate?: string) => {
      const scrollElement = scrollRef.current
      if (!scrollElement) return
      const { clientWidth } = scrollElement
      const { dayWidth, unit, timeline } = currentView
      let { startDate, endDate } = timeline
      const unitWidth = unit === "calendar-week" ? dayWidth * 7 : dayWidth
      const unitsInViewport = Math.ceil(clientWidth / unitWidth)
      const extendingUnits = Math.max(unitsInViewport * 5, 4)
      const manipulateUnit = unit === "calendar-week" ? "week" : "day"
      const startOfUnit = unit === "calendar-week" ? "isoWeek" : "day"

      if (direction === "left" || direction === null) {
        startDate = dayjs(targetDate ?? startDate)
          .subtract(extendingUnits, manipulateUnit)
          .startOf(startOfUnit)
          .format("YYYY-MM-DD")
      }
      if (direction === "right" || direction === null) {
        endDate = dayjs(targetDate ?? endDate)
          .add(extendingUnits, manipulateUnit)
          .endOf(startOfUnit)
          .format("YYYY-MM-DD")
      }

      setCurrentView((prev) => ({
        ...prev,
        timeline: { startDate, endDate },
      }))

      if (direction !== "right") {
        const targetStart = dayjs(targetDate ?? timeline.startDate)
          .startOf(startOfUnit)
          .format("YYYY-MM-DD")
        const dayOffset = dayjs(targetStart).diff(dayjs(startDate), "day")
        requestAnimationFrame(() => {
          scrollElement.scrollTo({
            left: dayWidth * dayOffset - sidebarWidth,
            behavior: "instant",
          })
        })
      }
    },
    [currentView, sidebarWidth]
  )

  const navigateToDate = useCallback(
    (targetDate: string | Date | Dayjs) => {
      extendView(null, formatDate(targetDate))
    },
    [extendView]
  )

  const navigateToDateRef = useRef(navigateToDate)
  useLayoutEffect(() => {
    navigateToDateRef.current = navigateToDate
  }, [navigateToDate])

  const lastKeyRef = useRef<string | null>(null)
  useEffect(() => {
    if (width === 0 || !isCalendarDayWidthCalculated.current) {
      setIsViewReady(false)
      return
    }
    const isKeyChanged = lastKeyRef.current !== currentView.key
    if (isKeyChanged) {
      setIsViewReady(false)
      lastKeyRef.current = currentView.key
    }
    const timeout = setTimeout(() => {
      if (isKeyChanged) {
        navigateToDateRef.current(dayjs().format("YYYY-MM-DD"))
      }
      setIsViewReady(true)
    }, 100)
    return () => clearTimeout(timeout)
  }, [width, currentView.key])

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    const { clientWidth, scrollLeft, scrollWidth } = element
    const gap = clientWidth * 2
    const leftBound = sidebarWidth
    const rightBound = scrollWidth - gap

    if (scrollLeft < leftBound && scrollLeft !== 0) extendView("left")
    if (scrollLeft >= rightBound) extendView("right")

    const viewStartDate = formatDate(
      calculateDateByPosition(
        { x: scrollLeft + sidebarWidth, y: 0 },
        currentView
      )
    )
    const viewEndDate = formatDate(
      calculateDateByPosition(
        { x: scrollLeft + sidebarWidth + clientWidth, y: 0 },
        currentView
      )
    )
    if (
      viewStartDate !== visibleRange.startDate ||
      viewEndDate !== visibleRange.endDate
    ) {
      setVisibleRange({ startDate: viewStartDate, endDate: viewEndDate })
    }

    if (isSnappingRef.current) return
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    snapTimeoutRef.current = setTimeout(() => {
      const target = scrollRef.current
      if (!target) return
      const currentX = target.scrollLeft + sidebarWidth
      const nearestDayX =
        Math.round(currentX / currentView.dayWidth) * currentView.dayWidth
      const targetScrollLeft = Math.max(nearestDayX - sidebarWidth, 0)
      const distance = Math.abs(target.scrollLeft - targetScrollLeft)
      if (distance < 1) return

      isSnappingRef.current = true
      target.scrollTo({ left: targetScrollLeft, behavior: "smooth" })
      if (snapReleaseTimeoutRef.current)
        clearTimeout(snapReleaseTimeoutRef.current)
      snapReleaseTimeoutRef.current = setTimeout(() => {
        isSnappingRef.current = false
      }, 260)
    }, 140)
  }

  useEventListener("scroll", handleScroll, scrollElementRef)

  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
      if (snapReleaseTimeoutRef.current)
        clearTimeout(snapReleaseTimeoutRef.current)
    }
  }, [])

  const value = useMemo(
    () => ({
      extendView,
      scrollRef,
      dragInfoRef,
      currentView,
      setCurrentView,
      placeholderRef,
      navigateToDate,
      visibleRange,
      isViewReady,
    }),
    [currentView, extendView, navigateToDate, visibleRange, isViewReady]
  )

  return (
    <CalendarTimelineContext.Provider value={value}>
      <CalendarVirtualizerContext.Provider value={{ calendarVirtualizer }}>
        {children}
      </CalendarVirtualizerContext.Provider>
    </CalendarTimelineContext.Provider>
  )
}

export const CalendarShell = ({ children }: PropsWithChildren) => {
  return <CalendarTimelineProvider>{children}</CalendarTimelineProvider>
}

export const useCalendarVirtualizer = (): CalendarVirtualizerContextProps => {
  const context = useContext(CalendarVirtualizerContext)
  if (!context) {
    throw new Error(
      "useCalendarVirtualizer must be used within a CalendarVirtualizerProvider"
    )
  }
  return context
}

export const useCalendarTimeline = (): CalendarTimelineContextProps => {
  const context = useContext(CalendarTimelineContext)
  if (!context) {
    throw new Error(
      "useCalendarTimeline must be used within CalendarTimelineProvider"
    )
  }
  return context
}
