import { createContext, useContext } from "react"

import type { CalendarContextValue } from "../contexts/calendar-context"

export const CalendarContext = createContext<CalendarContextValue | undefined>(
  undefined
)

export const useCalendarContext = () => {
  const context = useContext(CalendarContext)

  if (!context) {
    throw new Error(
      "useCalendarContext must be used within NewCalendarProvider"
    )
  }

  return context
}
