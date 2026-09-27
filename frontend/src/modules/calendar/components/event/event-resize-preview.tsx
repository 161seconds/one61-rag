/* eslint-disable react-refresh/only-export-components */
import { cn } from "@aqua-calendar/ui/lib/utils"
import { dayjs } from "@/libs/date"

type ResizePreviewBlock = {
  key: string
  top: number
  height: number
  left: number
  width: number
  title: string
  showTime: boolean
  timeLabel: string
}

type EventResizePreviewProps = {
  blocks: ResizePreviewBlock[]
  colorClass: string
  title?: string
}

export const EventResizePreview = ({
  blocks,
  colorClass,
  title,
}: EventResizePreviewProps) => {
  return (
    <>
      {blocks.map((block) => (
        <div
          key={block.key}
          className={cn(
            "pointer-events-none absolute z-50 rounded-sm border-l-2 font-medium opacity-50 shadow-sm",
            "group flex flex-col justify-center px-2 py-1 text-sm",
            colorClass
          )}
          style={{
            top: block.top,
            height: block.height,
            left: block.left,
            width: block.width,
          }}
          title={title}
        >
          <div className="truncate font-semibold">{block.title}</div>
          {block.showTime && (
            <div className="text-xs opacity-90">{block.timeLabel}</div>
          )}
        </div>
      ))}
    </>
  )
}

export const formatPreviewDateKey = (value: string) =>
  dayjs(value).format("YYYY-MM-DD")
