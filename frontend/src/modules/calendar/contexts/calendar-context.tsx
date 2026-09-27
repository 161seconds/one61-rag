import dayjs from "dayjs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PropsWithChildren } from "react"

import { CalendarContext } from "../hooks/use-calendar-context"
import {
  createDateFromHours,
  isAllDayEvent,
  roundToNearest15Min,
} from "../utils/calendar-util"

export type EventType = "task" | "event" | "reminder"
export type EventStatus = "todo" | "in_progress" | "done" | "cancelled"

export type NewCalendarEvent = {
  id: string
  userId: string
  title: string
  description?: string | null
  eventType: EventType
  status?: EventStatus | null
  startDate: string
  endDate: string
  reminderAt?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

const MINUTES_PER_DAY = 24 * 60

export type SelectionMode = "timed" | "all-day"

export type SelectionPoint = {
  dayIndex: number
  date: string
  minutes: number
}

export type CalendarSelectionState =
  | { status: "idle" }
  | {
      status: "selecting" | "selected"
      mode: SelectionMode
      anchor: SelectionPoint
      current: SelectionPoint
    }

export type CalendarContextValue = {
  events: NewCalendarEvent[]
  updateEvent: (eventId: string, updates: Partial<NewCalendarEvent>) => void
  moveEvent: (
    eventId: string,
    newDate: string,
    newTime?: number,
    forceAllDay?: boolean
  ) => void
  getEventById: (eventId: string) => NewCalendarEvent | undefined
  selection: CalendarSelectionState
  startSelection: (payload: {
    mode: SelectionMode
    point: SelectionPoint
  }) => void
  updateSelection: (point: SelectionPoint) => void
  endSelection: (point?: SelectionPoint) => void
  clearSelection: () => void
}

type CalendarProviderProps = PropsWithChildren<{
  initialEvents?: NewCalendarEvent[]
  onEventsChange?: (events: NewCalendarEvent[]) => void
  onEventUpdate?: (event: NewCalendarEvent) => void
}>

export const NewCalendarProvider = ({
  children,
  initialEvents = [],
  onEventsChange,
  onEventUpdate,
}: CalendarProviderProps) => {
  const [events, setEvents] = useState<NewCalendarEvent[]>(initialEvents)
  const [selection, setSelection] = useState<CalendarSelectionState>({
    status: "idle",
  })
  const eventsRef = useRef(events)

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  useEffect(() => {
    onEventsChange?.(events)
  }, [events, onEventsChange])

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<NewCalendarEvent>) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event
          const nextEvent: NewCalendarEvent = {
            ...event,
            ...updates,
            startDate: updates.startDate ?? event.startDate,
            endDate: updates.endDate ?? event.endDate,
          }
          onEventUpdate?.(nextEvent)
          return nextEvent
        })
      )
    },
    [onEventUpdate]
  )

  const moveEvent = useCallback(
    (
      eventId: string,
      newDate: string,
      newTime?: number,
      forceAllDay?: boolean
    ) => {
      const event = eventsRef.current.find((item) => item.id === eventId)
      if (!event) return

      const originalStart = dayjs(event.startDate)
      const originalEnd = dayjs(event.endDate)
      const rawDuration = originalEnd.diff(originalStart, "minute")
      const duration = Math.max(rawDuration, 15)

      let newStart: string
      let newEnd: string

      if (forceAllDay || newTime === undefined) {
        newStart = dayjs(newDate).startOf("day").toISOString()
        newEnd = dayjs(newDate).endOf("day").toISOString()
      } else {
        const roundedTime = roundToNearest15Min(newTime)
        const start = createDateFromHours(newDate, roundedTime)
        const fallbackDuration = isAllDayEvent(event) ? 60 : duration
        const end = start.add(fallbackDuration, "minute")
        newStart = start.toISOString()
        newEnd = end.toISOString()
      }

      updateEvent(eventId, {
        startDate: newStart,
        endDate: newEnd,
      })
    },
    [updateEvent]
  )

  const getEventById = useCallback((eventId: string) => {
    return eventsRef.current.find((event) => event.id === eventId)
  }, [])

  const startSelection = useCallback(
    (payload: { mode: SelectionMode; point: SelectionPoint }) => {
      const { mode, point } = payload
      setSelection({
        status: "selecting",
        mode,
        anchor: {
          ...point,
          minutes: mode === "timed" ? point.minutes : 0,
        },
        current: {
          ...point,
          minutes: mode === "timed" ? point.minutes : 0,
        },
      })
    },
    []
  )

  const updateSelection = useCallback((point: SelectionPoint) => {
    setSelection((prev) => {
      if (prev.status !== "selecting") {
        return prev
      }

      if (prev.mode === "all-day") {
        return {
          ...prev,
          current: {
            dayIndex: point.dayIndex,
            date: point.date,
            minutes: 0,
          },
        }
      }

      return {
        ...prev,
        current: {
          dayIndex: point.dayIndex,
          date: point.date,
          minutes: Math.max(0, Math.min(point.minutes, MINUTES_PER_DAY)),
        },
      }
    })
  }, [])

  const endSelection = useCallback((point?: SelectionPoint) => {
    setSelection((prev) => {
      if (prev.status !== "selecting") {
        return prev
      }

      const finalPoint = point ?? prev.current

      if (prev.mode === "all-day") {
        return {
          ...prev,
          status: "selected",
          current: {
            dayIndex: finalPoint.dayIndex,
            date: finalPoint.date,
            minutes: 0,
          },
        }
      }

      return {
        ...prev,
        status: "selected",
        current: {
          dayIndex: finalPoint.dayIndex,
          date: finalPoint.date,
          minutes: Math.max(0, Math.min(finalPoint.minutes, MINUTES_PER_DAY)),
        },
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ status: "idle" })
  }, [])

  useEffect(() => {
    if (selection.status !== "selecting") {
      return
    }

    const handleMouseUp = () => {
      setSelection((prev) => {
        if (prev.status !== "selecting") {
          return prev
        }
        return {
          ...prev,
          status: "selected",
        }
      })
    }

    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [selection.status])

  useEffect(() => {
    if (selection.status !== "selected") {
      return
    }

    const handleMouseDown = () => {
      setSelection({ status: "idle" })
    }

    window.addEventListener("mousedown", handleMouseDown)
    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [selection.status])

  const value = useMemo<CalendarContextValue>(
    () => ({
      events,
      updateEvent,
      moveEvent,
      getEventById,
      selection,
      startSelection,
      updateSelection,
      endSelection,
      clearSelection,
    }),
    [
      events,
      updateEvent,
      moveEvent,
      getEventById,
      selection,
      startSelection,
      updateSelection,
      endSelection,
      clearSelection,
    ]
  )

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}
