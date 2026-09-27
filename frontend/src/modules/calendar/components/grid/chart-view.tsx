import { cn } from "@aqua-calendar/ui/lib/utils"
import dayjs from "dayjs"
import type { ComponentType, Key, PropsWithChildren } from "react"

import { useCalendarTimeline, useCalendarVirtualizer } from "../layout/calendar-shell"
import { DayBlock } from "./day-block"
import { WeekBlock } from "./week-block"

type Props = {
  totalHeight: number
  className?: string
}

type BlockProps = {
  interval: {
    key: Key
    index: number
    start: number
    size: number
  }
  blockDate: dayjs.Dayjs
}

export default function CalendarChartView({
  totalHeight,
  children,
  className,
}: PropsWithChildren<Props>) {
  const { calendarVirtualizer } = useCalendarVirtualizer()
  const { currentView } = useCalendarTimeline()
  const intervals = calendarVirtualizer.getVirtualItems()
  const totalWidth = calendarVirtualizer.getTotalSize()

  const Block: ComponentType<BlockProps> =
    currentView.unit === "calendar-week" ? WeekBlock : DayBlock

  return (
    <div
      className={cn("absolute inset-0 flex min-h-full", className)}
      style={{ height: totalHeight, width: totalWidth }}
    >
      {intervals.map((interval) => {
        const blockUnit = currentView.unit === "calendar-week" ? "week" : "day"
        const blockDate = dayjs(currentView.timeline.startDate).add(
          interval.index,
          blockUnit
        )
        return <Block key={interval.key} interval={interval} blockDate={blockDate} />
      })}
      {children}
    </div>
  )
}
