import dayjs, { type Dayjs } from "dayjs"

import type { NewCalendarEvent } from "../contexts/calendar-context"

export const roundToNearest15Min = (hours: number): number => {
  return Math.round(hours / 0.25) * 0.25
}

export const formatCalendarDate = (date: string | Date | Dayjs): string => {
  return dayjs(date).format("YYYY-MM-DD")
}

export const getHoursFromDate = (date: string | Date | Dayjs): number => {
  const d = dayjs(date)
  return d.hour() + d.minute() / 60
}

export const createDateFromHours = (
  date: string | Date | Dayjs,
  hours: number
): Dayjs => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return dayjs(date).startOf("day").hour(h).minute(m).second(0).millisecond(0)
}

export const isSameDay = (
  date1: string | Date | Dayjs,
  date2: string | Date | Dayjs
): boolean => {
  return dayjs(date1).isSame(dayjs(date2), "day")
}

export const isAllDayEvent = (
  event: Pick<NewCalendarEvent, "startDate" | "endDate">
): boolean => {
  const start = dayjs(event.startDate)
  const end = dayjs(event.endDate)
  return start.isSame(start.startOf("day")) && end.isSame(end.endOf("day"))
}
