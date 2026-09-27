import dayjs from "dayjs"

import {
  CALENDAR_TOTAL_HEADER_HEIGHT,
  HEIGHT_PER_HOUR,
} from "../constants"
import type { NewCalendarEvent } from "../contexts/calendar-context"
import { isAllDayEvent } from "./calendar-util"

const MIN_EVENT_BLOCK_HEIGHT = 20
export const PIXELS_PER_HOUR = HEIGHT_PER_HOUR * 4
const DEFAULT_OVERLAY_OFFSET = 16
const OVERLAY_PADDING_PER_EVENT = 12
const MIN_OVERLAY_WIDTH_RATIO = 0.55
const SINGLE_EVENT_HORIZONTAL_PADDING = 12

export type CalendarEventRect = {
  top: number
  height: number
  left: number
  width: number
  zIndex?: number
}

export const getEventStartHour = (event: NewCalendarEvent) => {
  const start = dayjs(event.startDate)
  return start.hour() + start.minute() / 60
}

export const getEventDurationHours = (event: NewCalendarEvent) => {
  const start = dayjs(event.startDate)
  const end = dayjs(event.endDate)
  const minutes = end.diff(start, "minute")

  return Math.max(minutes / 60, 0)
}

export const calculateAllDayRect = ({
  dayWidth,
  dayIndex = 0,
}: {
  dayWidth: number
  dayIndex?: number
}): CalendarEventRect => ({
  top: 0,
  height: MIN_EVENT_BLOCK_HEIGHT,
  left: dayIndex * dayWidth,
  width: dayWidth,
})

export const calculateTimedRect = ({
  startHour,
  durationHours,
  dayWidth,
  dayIndex = 0,
}: {
  startHour: number
  durationHours: number
  dayWidth: number
  dayIndex?: number
}): CalendarEventRect => ({
  top: CALENDAR_TOTAL_HEADER_HEIGHT + startHour * PIXELS_PER_HOUR,
  height: Math.max(durationHours * PIXELS_PER_HOUR, MIN_EVENT_BLOCK_HEIGHT),
  left: dayIndex * dayWidth,
  width: dayWidth,
})

export const calculateEventRect = ({
  event,
  dayWidth,
  dayIndex,
}: {
  event: NewCalendarEvent
  dayWidth: number
  dayIndex: number
}): CalendarEventRect => {
  if (isAllDayEvent(event)) {
    return calculateAllDayRect({ dayWidth, dayIndex })
  }

  const startHour = getEventStartHour(event)
  const durationHours = getEventDurationHours(event)

  return calculateTimedRect({
    startHour,
    durationHours,
    dayWidth,
    dayIndex,
  })
}

export const MIN_EVENT_HEIGHT = MIN_EVENT_BLOCK_HEIGHT

const sortByStart = (events: NewCalendarEvent[]) =>
  [...events].sort((a, b) => {
    const startDiff =
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    if (startDiff !== 0) {
      return startDiff
    }

    const durationDiff = dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    if (durationDiff !== 0) {
      return durationDiff
    }

    return a.title.localeCompare(b.title)
  })

export const sortEventsByStart = (events: NewCalendarEvent[]) =>
  sortByStart(events)

type TimedEventLayoutInput = {
  events: NewCalendarEvent[]
  dayWidth: number
  overlayOffset?: number
}

type ClusterEvent = {
  event: NewCalendarEvent
  startHour: number
  endHour: number
}

export type PositionedCalendarEvent = {
  event: NewCalendarEvent
  rect: CalendarEventRect
}

export const layoutTimedEvents = ({
  events,
  dayWidth,
  overlayOffset = DEFAULT_OVERLAY_OFFSET,
}: TimedEventLayoutInput): PositionedCalendarEvent[] => {
  if (!events.length) {
    return []
  }

  const sorted = sortByStart(events).map((event) => {
    const startHour = getEventStartHour(event)
    const durationHours = getEventDurationHours(event)
    return {
      event,
      startHour,
      endHour: startHour + durationHours,
    }
  })

  const clusters: ClusterEvent[][] = []
  let currentCluster: ClusterEvent[] = []
  let clusterEnd = Number.NEGATIVE_INFINITY

  for (const item of sorted) {
    if (!currentCluster.length || item.startHour < clusterEnd) {
      currentCluster.push(item)
      clusterEnd = Math.max(clusterEnd, item.endHour)
      continue
    }

    clusters.push(currentCluster)
    currentCluster = [item]
    clusterEnd = item.endHour
  }

  if (currentCluster.length) {
    clusters.push(currentCluster)
  }

  const positioned: PositionedCalendarEvent[] = []

  for (const cluster of clusters) {
    const columnEndHours: number[] = []
    const columnAssignments: number[] = []

    for (const item of cluster) {
      let columnIndex = columnEndHours.findIndex(
        (endHour) => item.startHour >= endHour
      )

      if (columnIndex === -1) {
        columnIndex = columnEndHours.length
        columnEndHours.push(item.endHour)
      } else {
        columnEndHours[columnIndex] = item.endHour
      }

      columnAssignments.push(columnIndex)
    }

    const columnCount = Math.max(columnEndHours.length, 1)
    const effectiveOffset =
      columnCount > 1 ? Math.min(overlayOffset, dayWidth / columnCount) : 0

    const computeOverlayWidth = () => {
      if (columnCount === 1) {
        return Math.max(
          dayWidth - SINGLE_EVENT_HORIZONTAL_PADDING * 2,
          dayWidth * MIN_OVERLAY_WIDTH_RATIO
        )
      }

      const totalOffset = effectiveOffset * (columnCount - 1)
      const paddedWidth =
        dayWidth - totalOffset - OVERLAY_PADDING_PER_EVENT * columnCount

      return Math.max(paddedWidth, dayWidth * MIN_OVERLAY_WIDTH_RATIO)
    }

    const baseWidth = computeOverlayWidth()

    cluster.forEach((item, index) => {
      const columnIndex = columnAssignments[index] ?? 0
      const baseRect = calculateTimedRect({
        startHour: item.startHour,
        durationHours: item.endHour - item.startHour,
        dayWidth,
        dayIndex: 0,
      })

      const left = columnIndex * effectiveOffset
      const rightAlignedLeft =
        columnCount > 1 ? Math.max(dayWidth - baseWidth, 0) : left
      const adjustedLeft =
        columnIndex === columnCount - 1
          ? Math.max(rightAlignedLeft, left)
          : left

      positioned.push({
        event: item.event,
        rect: {
          ...baseRect,
          width: baseWidth,
          left: adjustedLeft,
          zIndex: 10 + columnIndex,
        },
      })
    })
  }

  return positioned
}
