import dayjs from "@/libs/date"

export type CalendarViewUnit = "calendar-week" | "calendar-day"

export type CalendarTimeline = {
  startDate: string
  endDate: string
}

export type CalendarChartViewData = {
  title: string
  key: CalendarViewUnit
  timeline: CalendarTimeline
  dayWidth: number
  unit: CalendarViewUnit
}

export const CALENDAR_HEADER_HEIGHT = 32
export const CALENDAR_DAY_HEADER_HEIGHT = 32
export const CALENDAR_ALL_DAY_HEIGHT = 32
export const CALENDAR_TOTAL_HEADER_HEIGHT =
  CALENDAR_HEADER_HEIGHT + CALENDAR_DAY_HEADER_HEIGHT + CALENDAR_ALL_DAY_HEIGHT
export const HEIGHT_PER_HOUR = 16
export const PIXELS_PER_HOUR = HEIGHT_PER_HOUR * 4
export const MIN_EVENT_BLOCK_HEIGHT = 20

export const CALENDAR_VIEW_LIST: CalendarChartViewData[] = [
  {
    title: "Week",
    key: "calendar-week",
    timeline: {
      startDate: dayjs().startOf("isoWeek").format("YYYY-MM-DD"),
      endDate: dayjs().startOf("isoWeek").add(4, "week").format("YYYY-MM-DD"),
    },
    dayWidth: 210,
    unit: "calendar-week",
  },
  {
    title: "Day",
    key: "calendar-day",
    timeline: {
      startDate: dayjs().startOf("day").format("YYYY-MM-DD"),
      endDate: dayjs().startOf("day").add(30, "day").format("YYYY-MM-DD"),
    },
    dayWidth: 210,
    unit: "calendar-day",
  },
]
