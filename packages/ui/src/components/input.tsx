import * as React from "react"
import { cn } from "@aqua-calendar/ui/lib/utils"

const inputBase =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      data-slot="input"
      type={type}
      className={cn(inputBase, className)}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
