import { Card } from "@aqua-calendar/ui/components/card"
import { Skeleton } from "@aqua-calendar/ui/components/skeleton"

const SKELETON_ROWS = 3

export const NotificationSettingSkeleton = () => {
  return (
    <div className="m-auto max-w-4xl px-12">
      <div className="pt-2 pb-8">
        <Skeleton className="mb-3 h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <div
            className="w-full max-w-3xl"
            key={`notification-skeleton-${index}`}
          >
            <Card className="box-shadow-none bg-transparent">
              <div className="flex min-h-[72px] items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64 max-w-[60vw]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-[150px]" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
