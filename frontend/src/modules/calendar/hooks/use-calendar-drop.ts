import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import dayjs from "dayjs"
import { useEffect } from "react"

import {
  getHoursFromDate,
  isAllDayEvent,
  roundToNearest15Min,
} from "../utils/calendar-util"
import { useCalendarContext } from "./use-calendar-context"

type DropData = {
  dayIndex: number
  date: string
  time: number
  allDay: boolean
}

type DragData = {
  type: "calendar_event"
  event: {
    id: string
    title: string
    startDate: string
    endDate: string
  }
  dayIndex: number
  offsetTime?: number
}

export const useNewCalendarDrop = () => {
  const { moveEvent, getEventById } = useCalendarContext()

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "calendar_event",
      onDrop({ source, location }) {
        try {
          const dragData = source.data as DragData
          const dropData = location.current.dropTargets[0]?.data as DropData

          if (!dragData || !dropData) return

          const originalEvent =
            getEventById(dragData.event.id) ?? dragData.event
          if (originalEvent) {
            const originalDate = dayjs(originalEvent.startDate).format(
              "YYYY-MM-DD"
            )
            const originalAllDay = isAllDayEvent(originalEvent)
            const originalTime = originalAllDay
              ? 0
              : getHoursFromDate(originalEvent.startDate)

            const offsetTime = dragData.offsetTime || 0
            const roundedDropTime = roundToNearest15Min(
              Math.max(0, dropData.time - offsetTime)
            )
            if (
              originalDate === dropData.date &&
              originalTime === roundedDropTime &&
              originalAllDay === dropData.allDay
            ) {
              return
            }
          }

          const offsetTime = dragData.offsetTime || 0
          const roundedTime = roundToNearest15Min(
            Math.max(0, dropData.time - offsetTime)
          )

          moveEvent(
            dragData.event.id,
            dropData.date,
            dropData.allDay ? undefined : roundedTime,
            dropData.allDay
          )
        } catch (error) {
          console.error("Error during drop:", error)
        }
      },
    })
  }, [getEventById, moveEvent])
}
