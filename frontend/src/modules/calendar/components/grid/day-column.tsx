import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/border"
import { cn } from "@aqua-calendar/ui/lib/utils"
import dayjs, { type Dayjs } from "dayjs"
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
} from "react"
import invariant from "tiny-invariant"

import { CALENDAR_TOTAL_HEADER_HEIGHT, PIXELS_PER_HOUR } from "../../constants"
import { useCalendarContext } from "../../hooks/use-calendar-context"
import {
  createDateFromHours,
  formatCalendarDate,
  isAllDayEvent,
  roundToNearest15Min,
} from "../../utils/calendar-util"
import { layoutTimedEvents } from "../../utils/event-layout"
import { CalendarEventCard } from "../event/event-card"
import {
  calculateAbsolutePositionFromMouseEvent,
  calculateDateByPosition,
} from "./grid-helper"
import { useCalendarTimeline } from "../layout/calendar-shell"

type Props = {
  b: {
    date: Dayjs
    isNonWorkingDay: boolean
    title: string
  }
  subBlockWidth: number
  hours: number[]
}

export const DayColumn = memo(({ b, subBlockWidth, hours }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const { dragInfoRef, currentView, scrollRef } = useCalendarTimeline()
  const { events } = useCalendarContext()

  const dayEvents = useMemo(() => {
    const dayStart = b.date.startOf("day")
    const dayEnd = b.date.endOf("day")
    const dayStartIso = dayStart.toISOString()
    const dayEndIso = dayEnd.toISOString()

    return events
      .filter((event) => {
        if (isAllDayEvent(event)) return false
        return event.startDate < dayEndIso && event.endDate > dayStartIso
      })
      .map((event) => {
        let clampedStart = event.startDate
        let clampedEnd = event.endDate
        if (event.startDate < dayStartIso) clampedStart = dayStartIso
        if (event.endDate > dayEndIso) clampedEnd = dayEndIso
        return { ...event, startDate: clampedStart, endDate: clampedEnd }
      })
  }, [events, b.date])

  const positionedEvents = useMemo(() => {
    return layoutTimedEvents({
      events: dayEvents,
      dayWidth: subBlockWidth,
    })
  }, [dayEvents, subBlockWidth])

  const [placeholder, setPlaceholder] = useState<{
    startDate: string
    endDate: string
  } | null>(null)

  useEffect(() => {
    const element = ref.current
    invariant(element, "Day column element not found")
    return combine(
      draggable({
        element,
        canDrag: ({ input }) => {
          const rect = element.getBoundingClientRect()
          return input.clientY - rect.top >= CALENDAR_TOTAL_HEADER_HEIGHT
        },
        getInitialData: ({ input }) => {
          const rect = element.getBoundingClientRect()
          const y = input.clientY - rect.top
          const time = Math.min(
            23.75,
            Math.max(0, (y - CALENDAR_TOTAL_HEADER_HEIGHT) / PIXELS_PER_HOUR)
          )
          return {
            sourceType: "timeline_calendar-column",
            type: "calendar",
            date: formatCalendarDate(b.date),
            time: roundToNearest15Min(time),
          }
        },
        onDrop: () => setPlaceholder(null),
        onDrag: ({ source }) => {
          const dragInfo = dragInfoRef.current
          if (!dragInfo || dragInfo.type !== "calendar") return
          const data = source.data as { time: number }
          const baseTime = data.time || 0
          const startString = dragInfo.originalDate
          const endString = dayjs(dragInfo.originalDate)
            .add(dragInfo.dayDelta, "day")
            .toISOString()

          const startHours = baseTime
          const endHours = Math.max(
            0,
            Math.min(23.75, baseTime + dragInfo.hourDelta)
          )

          let start = createDateFromHours(startString, startHours)
          let end = createDateFromHours(endString, endHours).add(15, "minute")
          if (end.isBefore(start)) {
            start = createDateFromHours(endString, endHours)
            end = createDateFromHours(startString, startHours).add(15, "minute")
          }

          if (
            dragInfo.dayDelta !== dragInfo.previousDayDelta ||
            dragInfo.hourDelta !== dragInfo.previousHourDelta
          ) {
            setPlaceholder({
              startDate: start.toISOString(),
              endDate: end.toISOString(),
            })
            dragInfo.previousDayDelta = dragInfo.dayDelta
            dragInfo.previousHourDelta = dragInfo.hourDelta
          }
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          disableNativeDragPreview({ nativeSetDragImage })
        },
      }),
      dropTargetForElements({
        element,
        canDrop: ({ input }) => {
          const rect = element.getBoundingClientRect()
          return input.clientY - rect.top >= CALENDAR_TOTAL_HEADER_HEIGHT
        },
        getData: ({ input }) => {
          const rect = element.getBoundingClientRect()
          const y = input.clientY - rect.top
          const time = Math.min(
            23.75,
            Math.max(0, (y - CALENDAR_TOTAL_HEADER_HEIGHT) / PIXELS_PER_HOUR)
          )
          return {
            date: formatCalendarDate(b.date),
            dayIndex: b.date.day(),
            time,
            allDay: false,
          }
        },
      })
    )
  }, [b, dragInfoRef])

  const onDoubleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target !== event.currentTarget || !scrollRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    if (y < CALENDAR_TOTAL_HEADER_HEIGHT) return

    const time = Math.min(
      23.75,
      Math.max(0, (y - CALENDAR_TOTAL_HEADER_HEIGHT) / PIXELS_PER_HOUR)
    )
    const roundedTime = roundToNearest15Min(time)
    const currentPosition = calculateAbsolutePositionFromMouseEvent(
      event,
      scrollRef.current
    )
    const currentDate = calculateDateByPosition(currentPosition, currentView)
    const start = createDateFromHours(currentDate, roundedTime)
    const end = start.add(15, "minute")
    setPlaceholder({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })

    setTimeout(() => {
      const clear = () => {
        setPlaceholder(null)
        window.removeEventListener("pointerdown", clear, true)
        window.removeEventListener("keydown", clear, true)
      }
      window.addEventListener("pointerdown", clear, true)
      window.addEventListener("keydown", clear, true)
    }, 100)
  }

  return (
    <div
      ref={ref}
      onDoubleClick={onDoubleClick}
      className={cn("relative border-r border-border/30", {
        "non-working-day-background": b.isNonWorkingDay,
      })}
      style={{ width: subBlockWidth }}
    >
      {placeholder &&
        (() => {
          const start = dayjs(placeholder.startDate)
          const end = dayjs(placeholder.endDate)
          const startDay = start.startOf("day")
          const endDay = end.startOf("day")
          const daysDiff = endDay.diff(startDay, "day")

          return Array.from({ length: daysDiff + 1 }).map((_, index) => {
            const currentDay = startDay.add(index, "day")
            const isFirstDay = index === 0
            const isLastDay = index === daysDiff
            const topHour = isFirstDay ? start.hour() + start.minute() / 60 : 0
            const bottomHour = isLastDay ? end.hour() + end.minute() / 60 : 24
            const eventDuration = bottomHour - topHour
            return (
              <div
                key={currentDay.format("YYYY-MM-DD")}
                className="pointer-events-none absolute z-10 rounded-md bg-primary/20"
                style={
                  {
                    top:
                      CALENDAR_TOTAL_HEADER_HEIGHT + topHour * PIXELS_PER_HOUR,
                    height: eventDuration * PIXELS_PER_HOUR,
                    left:
                      currentDay.diff(b.date.startOf("day"), "day") *
                      subBlockWidth,
                    width: subBlockWidth,
                    "--ds-border-selected": "hsl(var(--primary))",
                  } as CSSProperties
                }
              >
                <DropIndicator />
              </div>
            )
          })
        })()}

      {hours.map((hour) => (
        <div
          key={hour}
          className="pointer-events-none absolute w-full border-b border-border/30"
          style={{ top: CALENDAR_TOTAL_HEADER_HEIGHT + hour * PIXELS_PER_HOUR }}
        />
      ))}

      {positionedEvents.map((positioned) => {
        const originalEvent = events.find(
          (event) => event.id === positioned.event.id
        )
        return (
          <CalendarEventCard
            key={positioned.event.id}
            event={originalEvent ?? positioned.event}
            columnDate={formatCalendarDate(b.date)}
            dayIndex={b.date.day()}
            rect={positioned.rect}
            subBlockWidth={subBlockWidth}
          />
        )
      })}
    </div>
  )
})
