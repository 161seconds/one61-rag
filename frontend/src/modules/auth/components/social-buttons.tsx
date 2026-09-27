import { Button } from "@aqua-calendar/ui/components/button"
import { cn } from "@aqua-calendar/ui/lib/utils"
import { type ComponentType, type SVGProps } from "react"

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>

type SocialProvider = {
  name: string
  icon: SocialIcon
  iconClassName?: string
  onClick?: () => void
}

type SocialButtonsProps = {
  providers: SocialProvider[]
  className?: string
}

export function SocialButtons({ providers, className }: SocialButtonsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {providers.map(({ name, icon: Icon, iconClassName, onClick }) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          size="default"
          className="h-18 w-full flex-col items-center justify-center gap-2"
          onClick={onClick}
        >
          <Icon className={cn("size-5", iconClassName)} aria-hidden />
          <span className="text-center text-sm leading-none text-foreground">
            {name}
          </span>
        </Button>
      ))}
    </div>
  )
}
