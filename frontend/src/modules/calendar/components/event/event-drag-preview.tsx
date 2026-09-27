import { cn } from "@aqua-calendar/ui/lib/utils"

type EventDragPreviewProps = {
  title: string
  timeLabel?: string
  colorClass: string
  bodyClass: string
  titleClass: string
  height: number
  width: number
}

export const EventDragPreview = ({
  title,
  timeLabel,
  colorClass,
  bodyClass,
  titleClass,
  height,
  width,
}: EventDragPreviewProps) => {
  return (
    <div
      className={cn(
        "group flex flex-col justify-center rounded-sm border-l-2 font-medium shadow-sm",
        bodyClass,
        colorClass
      )}
      style={{ height, width }}
    >
      <div className="flex items-center justify-between gap-1 truncate font-semibold">
        <span className={cn("truncate", titleClass)}>{title}</span>
      </div>
      {timeLabel ? <div className="text-xs opacity-90">{timeLabel}</div> : null}
    </div>
  )
}
