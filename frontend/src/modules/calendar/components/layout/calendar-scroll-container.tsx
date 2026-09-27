import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { cn } from "@aqua-calendar/ui/lib/utils"
import dayjs from "dayjs"
import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react"
import invariant from "tiny-invariant"

import {
  CALENDAR_ALL_DAY_HEIGHT,
  CALENDAR_DAY_HEADER_HEIGHT,
  CALENDAR_HEADER_HEIGHT,
  CALENDAR_TOTAL_HEADER_HEIGHT,
  HEIGHT_PER_HOUR,
} from "../../constants"
import {
  calculateAbsolutePosition,
  calculateDateByPosition,
} from "../grid/grid-helper"
import { useCalendarTimeline } from "./calendar-shell"

type DragItemData = {
  sourceType?: string
  type?: string
}

type ScrollContainerProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

const HOUR_GUTTER_WIDTH = 84

export const CalendarScrollContainer = ({
  children,
  className,
  ...props
}: ScrollContainerProps) => {
  const { scrollRef, dragInfoRef, currentView } = useCalendarTimeline()
  const timelineTrackRef = useRef<HTMLDivElement>(null)
  const utcOffset = dayjs().format("Z")
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timeZoneLabel = `GMT${utcOffset}`

  useEffect(() => {
    const scrollContainer = scrollRef.current
    invariant(scrollContainer)

    return combine(
      monitorForElements({
        canMonitor: ({ source }) => {
          const data = source.data as DragItemData
          return Boolean(data?.sourceType?.startsWith("timeline_"))
        },
        onDragStart: ({ location }) => {
          preventUnhandled.start()
          const current = scrollRef.current
          invariant(current)
          const currentPosition = calculateAbsolutePosition(location, current)
          const originalDate = calculateDateByPosition(currentPosition, currentView)
          dragInfoRef.current = {
            type: "calendar",
            smp: currentPosition,
            originalDate,
            previousDayDelta: -1,
            previousHourDelta: -1,
            dayDelta: 0,
            hourDelta: 0,
          }
        },
        onDrag: ({ location, source }) => {
          const dragInfo = dragInfoRef.current
          invariant(scrollContainer)
          invariant(dragInfo)
          const anchorPosition = dragInfo.smp
          const currentPosition = calculateAbsolutePosition(location, scrollContainer)
          const currentDate = calculateDateByPosition(currentPosition, currentView)

          dragInfo.dayDelta = dayjs(currentDate).diff(dragInfo.originalDate, "day")
          const data = source.data as DragItemData
          const hourEnabled = dragInfo.type === "calendar" && data.type === "calendar"
          if (hourEnabled) {
            const deltaY = currentPosition.y - anchorPosition.y
            dragInfo.hourDelta = Math.floor(deltaY / 16) * 0.25
          }
        },
        onDrop: () => {
          dragInfoRef.current = null
        },
      }),
      autoScrollForElements({
        element: scrollContainer,
      })
    )
  }, [scrollRef, dragInfoRef, currentView])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="flex h-full w-full">
        <div
          className="pointer-events-none relative h-full shrink-0 overflow-hidden border-r border-border/60 bg-background"
          style={{ width: HOUR_GUTTER_WIDTH }}
        >
          <div className="relative z-20 bg-background" style={{ height: CALENDAR_TOTAL_HEADER_HEIGHT }}>
            <div className="border-border/60" style={{ height: CALENDAR_HEADER_HEIGHT }} />
            <div
              className="flex items-center justify-end border-b border-border/60 pr-2 text-[10px] font-medium text-muted-foreground"
              style={{ height: CALENDAR_DAY_HEADER_HEIGHT }}
              title={`${timeZone} (${timeZoneLabel})`}
            >
              {timeZoneLabel}
            </div>
            <div
              className="flex items-center justify-end border-b border-border/60 pr-2 text-[11px] font-medium text-muted-foreground"
              style={{ height: CALENDAR_ALL_DAY_HEIGHT }}
            >
              All day
            </div>
          </div>
          <div
            ref={timelineTrackRef}
            className="absolute inset-x-0 z-10"
            style={{ top: CALENDAR_TOTAL_HEADER_HEIGHT }}
          >
            {Array.from({ length: 24 }).map((_, hour) =>
              hour === 0 ? null : (
                <div
                  key={hour}
                  className="absolute right-2 text-[11px] text-muted-foreground"
                  style={{ top: hour * HEIGHT_PER_HOUR * 4 - 8 }}
                >
                  {`${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? "AM" : "PM"}`}
                </div>
              )
            )}
          </div>
        </div>
        <div
          ref={scrollRef}
          className={cn(
            "relative h-full min-w-0 flex-1 overflow-auto",
            "[-ms-overflow-style:none] [scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
            className
          )}
          onScroll={(event) => {
            const scrollTop = event.currentTarget.scrollTop
            if (timelineTrackRef.current) {
              timelineTrackRef.current.style.transform = `translateY(${-scrollTop}px)`
            }
          }}
          data-testid="calendar-scroll-container"
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
