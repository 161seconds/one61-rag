import { cn } from "@aqua-calendar/ui/lib/utils"
import type { Dayjs } from "dayjs"

type DayHeaderProps = {
  block: {
    date: Dayjs
    day: string
    title: string
    isToday: boolean
  }
  width: number
  gapClassName?: string
}

export const DayHeader = ({
  block,
  width,
  gapClassName = "gap-1",
}: DayHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center border-b pb-px text-center",
        gapClassName,
        { "border-primary": block.isToday }
      )}
      style={{ width }}
    >
      <span
        className={cn("font-normal text-muted-foreground", {
          "text-primary": block.isToday,
        })}
      >
        {block.day}
      </span>
      <span
        className={cn("text-s px-[2px]", {
          "text-primary": block.isToday,
        })}
      >
        {block.title}
      </span>
    </div>
  )
}
