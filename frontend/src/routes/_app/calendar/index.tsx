import { createFileRoute } from "@tanstack/react-router"
import dayjs from "dayjs"
import { useMemo } from "react"

import {
  CALENDAR_TOTAL_HEADER_HEIGHT,
  CalendarCurrentTimeMarker,
  NewCalendarProvider,
  CalendarScrollContainer,
  CalendarTimelineProvider,
  PIXELS_PER_HOUR,
  useNewCalendarDrop,
  type NewCalendarEvent,
} from "@/modules/calendar"
import CalendarChartView from "@/modules/calendar/components/grid/chart-view"

export const Route = createFileRoute("/_app/calendar/")({
  component: RouteComponent,
})

const CalendarDropBinding = () => {
  useNewCalendarDrop()
  return null
}

function RouteComponent() {
  const calendarTotalHeight =
    CALENDAR_TOTAL_HEADER_HEIGHT + 24 * PIXELS_PER_HOUR

  const initialEvents = useMemo<NewCalendarEvent[]>(
    () => [
      {
        id: "event-1",
        userId: "demo-user",
        title: "Daily Standup",
        description: "Engineering sync",
        eventType: "event",
        status: "in_progress",
        startDate: dayjs()
          .hour(9)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toISOString(),
        endDate: dayjs()
          .hour(9)
          .minute(30)
          .second(0)
          .millisecond(0)
          .toISOString(),
        reminderAt: null,
        metadata: null,
      },
      {
        id: "event-2",
        userId: "demo-user",
        title: "Product Planning",
        description: "Roadmap review",
        eventType: "task",
        status: "todo",
        startDate: dayjs()
          .hour(11)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toISOString(),
        endDate: dayjs()
          .hour(12)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toISOString(),
        reminderAt: null,
        metadata: { source: "route-seed" },
      },
      {
        id: "event-3",
        userId: "demo-user",
        title: "All-day Focus",
        description: "Deep work",
        eventType: "reminder",
        status: "todo",
        startDate: dayjs().startOf("day").toISOString(),
        endDate: dayjs().endOf("day").toISOString(),
        reminderAt: dayjs().startOf("day").add(8, "hour").toISOString(),
        metadata: null,
      },
    ],
    []
  )

  return (
    <div className="h-[calc(100vh-3.4rem)] w-full max-w-full min-w-0 overflow-hidden">
      <div className="h-full w-full min-w-0 overflow-hidden rounded-lg bg-background">
        <NewCalendarProvider initialEvents={initialEvents}>
          <CalendarDropBinding />
          <CalendarTimelineProvider>
            <CalendarScrollContainer>
              <CalendarChartView totalHeight={calendarTotalHeight}>
                <CalendarCurrentTimeMarker />
              </CalendarChartView>
            </CalendarScrollContainer>
          </CalendarTimelineProvider>
        </NewCalendarProvider>
      </div>
    </div>
  )
}
