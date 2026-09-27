import dayjs from "dayjs"
import { memo, useEffect, useState } from "react"

import { CALENDAR_TOTAL_HEADER_HEIGHT, HEIGHT_PER_HOUR } from "../../constants"
import { calculateTimelinePosition } from "../grid/grid-helper"
import { useCalendarTimeline } from "./calendar-shell"

export const CalendarCurrentTimeMarker = memo(() => {
  const { currentView, visibleRange } = useCalendarTimeline()
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const todayString = now.format("YYYY-MM-DD")
  const pos = calculateTimelinePosition(
    { startDate: todayString, endDate: todayString },
    currentView
  )
  const { x } = pos
  const currentWeekStart = now.startOf("isoWeek").format("YYYY-MM-DD")
  const currentWeekEnd = now.endOf("isoWeek").format("YYYY-MM-DD")

  const isCurrentWeekInView =
    visibleRange.startDate <= currentWeekEnd && visibleRange.endDate >= currentWeekStart
  const isTodayInView =
    todayString >= visibleRange.startDate && todayString <= visibleRange.endDate

  const totalMinutes = now.hour() * 60 + now.minute()
  const pixelsPerMinute = (HEIGHT_PER_HOUR * 4) / 60
  const timeTopOffset = CALENDAR_TOTAL_HEADER_HEIGHT + totalMinutes * pixelsPerMinute

  return (
    <>
      {isCurrentWeekInView && (
        <div
          className="pointer-events-none absolute right-0 left-0 z-10"
          style={{ top: timeTopOffset, height: 1 }}
        >
          <div className="h-full w-full bg-primary/30" />
        </div>
      )}
      {isTodayInView && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: 0,
            top: timeTopOffset,
            width: currentView.dayWidth,
            transform: `translate(${x}px, -50%)`,
          }}
        >
          <div className="relative flex items-center">
            <div className="-ml-0.5 h-3 w-1 flex-shrink-0 rounded-full bg-primary" />
            <div className="h-0.5 flex-1 bg-primary" />
          </div>
        </div>
      )}
    </>
  )
})

CalendarCurrentTimeMarker.displayName = "CalendarCurrentTimeMarker"
