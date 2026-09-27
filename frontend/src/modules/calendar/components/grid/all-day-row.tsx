import { cn } from "@aqua-calendar/ui/lib/utils"
import dayjs, { type Dayjs } from "dayjs"

import type { NewCalendarEvent } from "../../contexts/calendar-context"
import { isAllDayEvent } from "../../utils/calendar-util"

type AllDayRowProps = {
  block: {
    date: Dayjs
    title: string
    isNonWorkingDay: boolean
  }
  width: number
  events: NewCalendarEvent[]
}

export const AllDayRow = ({ block, width, events }: AllDayRowProps) => {
  const allDayEvents = events
    .filter((event) => {
      if (!isAllDayEvent(event)) return false
      const dayStart = block.date.startOf("day")
      const dayEnd = block.date.endOf("day")
      return dayjs(event.startDate).isBefore(dayEnd) && dayjs(event.endDate).isAfter(dayStart)
    })
    .slice(0, 1)

  return (
    <div
      className={cn("relative overflow-hidden border-r border-border/30", {
        "non-working-day-background": block.isNonWorkingDay,
      })}
      style={{ width }}
      key={`all-day-${block.title}`}
    >
      {allDayEvents.map((event) => (
        <div
          key={event.id}
          className="absolute top-1 right-1 left-1 flex h-6 items-center truncate rounded-sm border border-red-500/70 bg-red-500/15 px-1.5 text-xs leading-5 font-medium text-red-700"
          title={event.title}
        >
          {event.title}
        </div>
      ))}
    </div>
  )
}
