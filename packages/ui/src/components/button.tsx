import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "./button-variants"
import { cn } from "@aqua-calendar/ui/lib/utils"
import { Slot } from "radix-ui"
import * as React from "react"
import { LoaderCircle } from "lucide-react"

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button }
