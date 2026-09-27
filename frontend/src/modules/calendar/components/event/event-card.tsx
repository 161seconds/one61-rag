import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/border"
import { cn } from "@aqua-calendar/ui/lib/utils"
import dayjs from "dayjs"
import { createPortal, flushSync } from "react-dom"
import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import invariant from "tiny-invariant"

import type { NewCalendarEvent } from "../../contexts/calendar-context"
import { useCalendarContext } from "../../hooks/use-calendar-context"
import {
  createDateFromHours,
  getHoursFromDate,
  isAllDayEvent,
  roundToNearest15Min,
} from "../../utils/calendar-util"
import type { CalendarEventRect } from "../../utils/event-layout"
import { CALENDAR_TOTAL_HEADER_HEIGHT, PIXELS_PER_HOUR } from "../../constants"
import { EventDragPreview } from "./event-drag-preview"

type CalendarEventProps = {
  event: NewCalendarEvent
  columnDate?: string
  dayIndex: number
  rect: CalendarEventRect
  subBlockWidth: number
}

const formatTime = (date: dayjs.Dayjs) => date.format("HH:mm")

const getEventColorClass = (event: NewCalendarEvent) => {
  if (event.eventType === "task" || event.eventType === "event") {
    return "border-red-500 bg-red-500/15 text-red-700"
  }
  return "border-primary bg-primary/10 text-foreground"
}

const getEventDensity = (height: number) => {
  if (height < 32) return "compact"
  if (height < 52) return "normal"
  return "full"
}

const getEventBodyClass = (height: number) => {
  const density = getEventDensity(height)
  if (density === "compact") return "px-1 py-0 text-xs"
  if (density === "normal") return "px-1.5 py-0.5 text-xs"
  return "px-2 py-1 text-sm"
}

const getTitleClass = (height: number) => {
  const density = getEventDensity(height)
  if (density === "compact") return "text-[11px] leading-4"
  if (density === "normal") return "text-xs leading-4"
  return "text-sm leading-5"
}

const getInlineTimeClass = (height: number) => {
  const density = getEventDensity(height)
  if (density === "compact") return "text-[10px] leading-4 opacity-90"
  return "text-[11px] leading-4 opacity-90"
}

const ResizePreview = ({
  event,
  resizeState,
  startDate,
  endDate,
  columnDate,
  subBlockWidth,
  rect,
}: {
  event: NewCalendarEvent
  resizeState: {
    edge?: "top" | "bottom"
    targetDate?: string
    targetTime?: number
  }
  startDate: dayjs.Dayjs
  endDate: dayjs.Dayjs
  columnDate?: string
  subBlockWidth: number
  rect: CalendarEventRect
}) => {
  if (!resizeState.targetDate || resizeState.targetTime === undefined) return null

  let newStart = createDateFromHours(
    startDate,
    roundToNearest15Min(getHoursFromDate(startDate))
  )
  let newEnd = createDateFromHours(endDate, roundToNearest15Min(getHoursFromDate(endDate)))

  if (resizeState.edge === "top") {
    newStart = createDateFromHours(resizeState.targetDate, resizeState.targetTime)
    if (newStart.isAfter(newEnd.subtract(15, "minute"))) {
      const temp = newStart
      newStart = newEnd
      newEnd = temp.add(15, "minute")
    }
  } else {
    newEnd = createDateFromHours(resizeState.targetDate, resizeState.targetTime)
    if (newEnd.isBefore(newStart.add(15, "minute"))) {
      const temp = newEnd
      newEnd = newStart
      newStart = temp.subtract(15, "minute")
    }
  }

  const startDay = newStart.startOf("day")
  const endDay = newEnd.startOf("day")
  const daysDiff = endDay.diff(startDay, "day")
  const eventColorClass = getEventColorClass(event)

  return (
    <>
      {Array.from({ length: daysDiff + 1 }).map((_, i) => {
        const currentDay = startDay.add(i, "day")
        const isFirstDay = i === 0
        const isLastDay = i === daysDiff
        const topHour = isFirstDay ? newStart.hour() + newStart.minute() / 60 : 0
        const bottomHour = isLastDay ? newEnd.hour() + newEnd.minute() / 60 : 24
        const duration = Math.max(0.25, bottomHour - topHour)
        const previewHeight = duration * PIXELS_PER_HOUR
        const previewDensity = getEventDensity(previewHeight)
        const showInlineTime = !isAllDayEvent(event) && previewDensity !== "full"
        const showDetailTime = !isAllDayEvent(event) && previewDensity === "full"

        return (
          <div
            key={currentDay.format("YYYY-MM-DD")}
            className={cn(
              "pointer-events-none absolute z-50 rounded-sm border-l-2 font-medium opacity-50 shadow-sm",
              "group flex flex-col justify-center",
              getEventBodyClass(previewHeight),
              eventColorClass
            )}
            style={{
              top: CALENDAR_TOTAL_HEADER_HEIGHT + topHour * PIXELS_PER_HOUR,
              height: previewHeight,
              left:
                currentDay.diff(dayjs(columnDate || event.startDate).startOf("day"), "day") *
                  subBlockWidth +
                rect.left,
              width: rect.width,
            }}
          >
            <div className="flex items-center justify-between gap-1 truncate font-semibold">
              <span className={cn("truncate", getTitleClass(previewHeight))}>
                {event.title}
              </span>
              {showInlineTime && (
                <span className={cn("shrink-0 whitespace-nowrap", getInlineTimeClass(previewHeight))}>
                  {formatTime(newStart)}
                </span>
              )}
            </div>
            {showDetailTime && (
              <div className="text-sm opacity-90">
                {formatTime(newStart)} - {formatTime(newEnd)}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

type DragState =
  | { type: "idle" }
  | { type: "dragging" }
  | { type: "preview"; container: HTMLElement }

export const CalendarEventCard = ({
  event,
  columnDate,
  dayIndex,
  rect,
  subBlockWidth,
}: CalendarEventProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const topResizerRef = useRef<HTMLDivElement>(null)
  const bottomResizerRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState>({ type: "idle" })
  const [resizeState, setResizeState] = useState<{
    type: "idle" | "resizing"
    edge?: "top" | "bottom"
    targetDate?: string
    targetTime?: number
  }>({ type: "idle" })
  const [preview, setPreview] = useState<{ date: string; time: number } | null>(null)

  const startDate = dayjs(event.startDate)
  const endDate = dayjs(event.endDate)
  const eventColorClass = getEventColorClass(event)
  const density = getEventDensity(rect.height)
  const showInlineTime = !isAllDayEvent(event) && density !== "full"
  const showDetailTime = !isAllDayEvent(event) && density === "full"
  const { updateEvent } = useCalendarContext()

  useEffect(() => {
    const element = ref.current
    invariant(element)

    return combine(
      draggable({
        element,
        getInitialData({ input }) {
          const elementRect = element.getBoundingClientRect()
          const offsetTime = (input.clientY - elementRect.top) / PIXELS_PER_HOUR
          return {
            type: "calendar_event",
            event,
            dayIndex,
            offsetTime,
          }
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              flushSync(() => {
                setDragState({ type: "preview", container })
              })
              return () => setDragState({ type: "dragging" })
            },
          })
        },
        onDragStart() {
          setDragState((prev) => (prev.type === "preview" ? prev : { type: "dragging" }))
        },
        onDrag({ location, source }) {
          const dropData = location.current.dropTargets[0]?.data as
            | { date: string; time: number }
            | undefined
          if (dropData) {
            const offsetTime = (source.data.offsetTime as number) || 0
            const roundedTime = roundToNearest15Min(
              Math.max(0, dropData.time - offsetTime)
            )
            setPreview({ date: dropData.date, time: roundedTime })
          } else {
            setPreview(null)
          }
        },
        onDrop() {
          setDragState({ type: "idle" })
          setPreview(null)
        },
      })
    )
  }, [event, dayIndex])

  useEffect(() => {
    const topElement = topResizerRef.current
    const bottomElement = bottomResizerRef.current
    if (!topElement || !bottomElement) return

    const handleResizeDrop = (
      edge: "top" | "bottom",
      targetDate: string,
      targetTime: number
    ) => {
      const roundedTime = roundToNearest15Min(targetTime)
      if (edge === "top") {
        let start = createDateFromHours(targetDate, roundedTime)
        let end = dayjs(event.endDate)
        if (start.isAfter(end.subtract(15, "minute"))) {
          const temp = start
          start = end
          end = temp.add(15, "minute")
        }
        updateEvent(event.id, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
      } else {
        let end = createDateFromHours(targetDate, roundedTime)
        let start = dayjs(event.startDate)
        if (end.isBefore(start.add(15, "minute"))) {
          const temp = end
          end = start
          start = temp.subtract(15, "minute")
        }
        updateEvent(event.id, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
      }
    }

    return combine(
      draggable({
        element: topElement,
        getInitialData: () => ({
          type: "calendar_event_resize",
          event,
          edge: "top",
        }),
        onGenerateDragPreview({ nativeSetDragImage }) {
          disableNativeDragPreview({ nativeSetDragImage })
        },
        onDragStart: () => setResizeState({ type: "resizing", edge: "top" }),
        onDrag({ location }) {
          const target = location.current.dropTargets.find(
            (item) => item.data.date !== undefined && item.data.time !== undefined
          )
          const dropData = target?.data as { date: string; time: number } | undefined
          if (dropData) {
            setResizeState((prev) => ({
              ...prev,
              targetDate: dropData.date,
              targetTime: roundToNearest15Min(dropData.time),
            }))
          }
        },
        onDrop({ location }) {
          const target = location.current.dropTargets.find(
            (item) => item.data.date !== undefined && item.data.time !== undefined
          )
          const dropData = target?.data as { date: string; time: number } | undefined
          if (dropData) {
            handleResizeDrop("top", dropData.date, dropData.time)
          }
          setResizeState({ type: "idle" })
        },
      }),
      draggable({
        element: bottomElement,
        getInitialData: () => ({
          type: "calendar_event_resize",
          event,
          edge: "bottom",
        }),
        onGenerateDragPreview({ nativeSetDragImage }) {
          disableNativeDragPreview({ nativeSetDragImage })
        },
        onDragStart: () => setResizeState({ type: "resizing", edge: "bottom" }),
        onDrag({ location }) {
          const target = location.current.dropTargets.find(
            (item) => item.data.date !== undefined && item.data.time !== undefined
          )
          const dropData = target?.data as { date: string; time: number } | undefined
          if (dropData) {
            setResizeState((prev) => ({
              ...prev,
              targetDate: dropData.date,
              targetTime: roundToNearest15Min(dropData.time),
            }))
          }
        },
        onDrop({ location }) {
          const target = location.current.dropTargets.find(
            (item) => item.data.date !== undefined && item.data.time !== undefined
          )
          const dropData = target?.data as { date: string; time: number } | undefined
          if (dropData) {
            handleResizeDrop("bottom", dropData.date, dropData.time)
          }
          setResizeState({ type: "idle" })
        },
      })
    )
  }, [event, updateEvent])

  return (
    <>
      <div
        ref={ref}
        data-calendar-event="true"
        className={cn(
          "group absolute flex cursor-grab flex-col justify-center rounded-sm border-l-2 font-medium shadow-sm hover:shadow-md active:cursor-grabbing",
          getEventBodyClass(rect.height),
          eventColorClass,
          (dragState.type === "dragging" ||
            dragState.type === "preview" ||
            resizeState.type === "resizing") &&
            "opacity-30"
        )}
        style={{
          top: rect.top,
          left: rect.left,
          height: rect.height,
          width: rect.width,
          zIndex: rect.zIndex ?? 12,
        }}
        title={event.description ?? undefined}
      >
        <div
          ref={topResizerRef}
          className="absolute top-0 left-0 z-10 h-3 w-full cursor-ns-resize hover:bg-black/5"
        />
        <div className="flex items-center justify-between gap-1 truncate font-semibold">
          <span className={cn("truncate", getTitleClass(rect.height))}>
            {event.title}
          </span>
          {showInlineTime && (
            <span className={cn("shrink-0 whitespace-nowrap", getInlineTimeClass(rect.height))}>
              {formatTime(startDate)}
            </span>
          )}
        </div>
        {showDetailTime && (
          <div className="text-xs opacity-90">
            {formatTime(startDate)} - {formatTime(endDate)}
          </div>
        )}
        <div
          ref={bottomResizerRef}
          className="absolute bottom-0 left-0 z-10 h-3 w-full cursor-ns-resize hover:bg-black/5"
        />
      </div>

      <ResizePreview
        event={event}
        resizeState={resizeState}
        startDate={startDate}
        endDate={endDate}
        columnDate={columnDate}
        subBlockWidth={subBlockWidth}
        rect={rect}
      />

      {dragState.type === "preview" &&
        createPortal(
          <EventDragPreview
            title={event.title}
            timeLabel={
              showDetailTime
                ? `${formatTime(startDate)} - ${formatTime(endDate)}`
                : showInlineTime
                  ? formatTime(startDate)
                  : undefined
            }
            colorClass={eventColorClass}
            bodyClass={getEventBodyClass(rect.height)}
            titleClass={getTitleClass(rect.height)}
            height={rect.height}
            width={rect.width}
          />,
          dragState.container
        )}

      {preview &&
        (dragState.type === "dragging" || dragState.type === "preview") && (
          <div
            className="pointer-events-none absolute z-50 rounded-md bg-primary/20"
            style={
              {
                top: CALENDAR_TOTAL_HEADER_HEIGHT + preview.time * PIXELS_PER_HOUR,
                left:
                  dayjs(preview.date).diff(
                    dayjs(columnDate || event.startDate).startOf("day"),
                    "day"
                  ) * subBlockWidth,
                height: Math.min(
                  rect.height,
                  24 * PIXELS_PER_HOUR - preview.time * PIXELS_PER_HOUR
                ),
                width: subBlockWidth,
                "--ds-border-selected": "hsl(var(--primary))",
              } as CSSProperties
            }
          >
            <DropIndicator />
          </div>
        )}
    </>
  )
}
