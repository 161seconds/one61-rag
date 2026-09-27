import dayjs, { type Dayjs } from "dayjs"
import { range } from "lodash"

import {
  CALENDAR_ALL_DAY_HEIGHT,
  CALENDAR_DAY_HEADER_HEIGHT,
  CALENDAR_HEADER_HEIGHT,
  CALENDAR_TOTAL_HEADER_HEIGHT,
} from "../../constants"
import { useCalendarContext } from "../../hooks/use-calendar-context"
import { AllDayRow } from "./all-day-row"
import { DayColumn } from "./day-column"
import { DayHeader } from "./day-header"

type BlockProps = {
  interval: {
    start: number
    size: number
  }
  blockDate: Dayjs
}

const generateSubBlocks = (blockDate: Dayjs) => [
  {
    date: blockDate,
    day: blockDate.format("dddd"),
    title: blockDate.format("D"),
    isToday: blockDate.isSame(dayjs(), "day"),
    isNonWorkingDay: false,
  },
]

export const DayBlock = ({ interval, blockDate }: BlockProps) => {
  const subBlocks = generateSubBlocks(blockDate)
  const subBlockWidth = interval.size
  const hours = range(0, 24)
  const title = blockDate.format("MMMM YYYY")
  const { events } = useCalendarContext()

  return (
    <>
      <div
        className="pointer-events-none absolute z-20 h-full"
        style={{ width: interval.size, transform: `translateX(${interval.start}px)` }}
      >
        <div
          className="sticky top-0 z-20 flex flex-col border-b border-border bg-background"
          style={{ height: CALENDAR_TOTAL_HEADER_HEIGHT }}
        >
          <div
            className="flex h-full w-full items-center gap-2 border-r px-2 text-sm font-medium text-muted-foreground"
            style={{ height: CALENDAR_HEADER_HEIGHT }}
          >
            <div className="h-3 w-0 border-l" />
            {title}
          </div>
          <div className="flex" style={{ height: CALENDAR_DAY_HEADER_HEIGHT }}>
            {subBlocks.map((block) => (
              <DayHeader key={`dh-${block.title}`} block={block} width={subBlockWidth} gapClassName="gap-2" />
            ))}
          </div>
          <div
            className="pointer-events-auto flex h-full border-l border-border"
            style={{ height: CALENDAR_ALL_DAY_HEIGHT }}
          >
            {subBlocks.map((block) => (
              <AllDayRow key={`all-day-${block.title}`} block={block} width={subBlockWidth} events={events} />
            ))}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-auto absolute flex h-full border-l border-border"
        style={{ transform: `translateX(${interval.start}px)` }}
      >
        {subBlocks.map((block) => (
          <DayColumn key={block.title} b={block} subBlockWidth={subBlockWidth} hours={hours} />
        ))}
      </div>
    </>
  )
}
