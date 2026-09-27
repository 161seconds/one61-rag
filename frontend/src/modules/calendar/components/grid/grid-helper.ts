import type { Position } from "@atlaskit/pragmatic-drag-and-drop/types"
import dayjs from "dayjs"

import {
  CALENDAR_VIEW_LIST,
  type CalendarChartViewData,
  type CalendarTimeline,
  type CalendarViewUnit,
} from "../../constants"

type DragLocationLike = {
  current: {
    input: {
      clientX: number
      clientY: number
    }
  }
}

const DATE_FORMAT = "YYYY-MM-DD"

export const formatDate = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format(DATE_FORMAT)
}

export const addDays = (
  date: string | Date | dayjs.Dayjs,
  amount: number
): string => {
  return dayjs(date).add(amount, "day").format(DATE_FORMAT)
}

export const duration = (
  timeline: CalendarTimeline,
  unit: "day" | "week" = "day"
): number => {
  const start = dayjs(timeline.startDate)
  const end = dayjs(timeline.endDate)
  const diffDays = end.diff(start, "day") + 1
  if (unit === "week") return Math.max(Math.ceil(diffDays / 7), 1)
  return Math.max(diffDays, 1)
}

export const getCalendarChartView = (
  chartUnit: CalendarViewUnit
): CalendarChartViewData => {
  const chartView = CALENDAR_VIEW_LIST.find((view) => view.key === chartUnit)
  const baseView = chartView ?? CALENDAR_VIEW_LIST[0]
  const now = dayjs()

  const timeline: CalendarTimeline =
    baseView.key === "calendar-week"
      ? {
          startDate: now.subtract(4, "week").startOf("isoWeek").format(DATE_FORMAT),
          endDate: now.startOf("isoWeek").add(8, "week").format(DATE_FORMAT),
        }
      : {
          startDate: now.subtract(14, "day").startOf("day").format(DATE_FORMAT),
          endDate: now.startOf("day").add(45, "day").format(DATE_FORMAT),
        }

  return {
    ...baseView,
    timeline,
  }
}

export const calculateDateByPosition = (
  position: Position,
  view: Pick<CalendarChartViewData, "dayWidth" | "timeline">
) => {
  const dayOffset = Math.floor(position.x / view.dayWidth)
  return addDays(view.timeline.startDate, dayOffset)
}

export const calculateTimelinePosition = (
  timeline: CalendarTimeline,
  view: Pick<CalendarChartViewData, "dayWidth" | "timeline">
) => {
  const timelineDuration = duration(timeline, "day")
  const dayOffset = dayjs(timeline.startDate).diff(dayjs(view.timeline.startDate), "day")
  return {
    x: dayOffset * view.dayWidth,
    width: timelineDuration * view.dayWidth,
  }
}

export const calculateAbsolutePosition = (
  location: DragLocationLike,
  container: HTMLElement
): Position => {
  const latest = location.current.input
  const rect = container.getBoundingClientRect()
  return {
    x: latest.clientX - rect.left + container.scrollLeft,
    y: latest.clientY - rect.top + container.scrollTop,
  }
}

export const calculateAbsolutePositionFromMouseEvent = (
  event: MouseEvent | { clientX: number; clientY: number },
  container: HTMLElement
): Position => {
  const rect = container.getBoundingClientRect()
  return {
    x: event.clientX - rect.left + container.scrollLeft,
    y: event.clientY - rect.top + container.scrollTop,
  }
}
