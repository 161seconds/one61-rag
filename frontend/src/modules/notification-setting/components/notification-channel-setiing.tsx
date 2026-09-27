import { Button } from "@aqua-calendar/ui/components/button"
import type { LucideIcon } from "lucide-react"
import { Card } from "@aqua-calendar/ui/components/card"
import { X, Check } from "lucide-react"

export interface NotificationChannelSettingProps {
  icon: LucideIcon
  title: string
  description: string
  isEnabled: boolean
  loading: boolean
  onToggle: () => void
}

export const NotificationChannelSetting = ({
  icon: Icon,
  title,
  description,
  isEnabled,
  loading,
  onToggle,
}: NotificationChannelSettingProps) => {
  return (
    <div className="w-full max-w-3xl">
      <Card className="box-shadow-none bg-transparent">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Icon className="mx-1 h-5 w-5 text-slate-600 dark:text-slate-400" />
              {isEnabled ? (
                <span className="absolute top-2.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-slate-900">
                  <Check className="h-2.5 w-2.5 stroke-[2.5] text-white" />
                </span>
              ) : (
                <span className="absolute top-2.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-400 shadow-sm dark:border-slate-900">
                  <X className="h-2.5 w-2.5 stroke-[2.5] text-white" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-normal text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onToggle}
            loading={loading}
            className="h-8 w-[150px] px-4 text-sm font-normal"
          >
            {isEnabled ? "Turn off notifications" : "Enable notifications"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
