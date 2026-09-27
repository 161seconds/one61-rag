import * as React from "react"
import { cn } from "@aqua-calendar/ui/lib/utils"

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs leading-none font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

function FormControl({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) =>
  children ? (
    <p
      ref={ref}
      role="alert"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  ) : null
)
FormMessage.displayName = "FormMessage"

type FormFieldProps = {
  label: string
  name: string
  error?: string
  children: React.ReactElement
  className?: string
}

function FormField({
  label,
  name,
  error,
  children,
  className,
}: FormFieldProps) {
  const child = React.Children.only(children) as React.ReactElement<
    React.InputHTMLAttributes<HTMLInputElement>
  >
  const id = child.props.id ?? name

  return (
    <FormItem className={className}>
      <div className="flex flex-col gap-2">
        <FormLabel htmlFor={id}>{label}</FormLabel>
        <FormControl>
          {React.cloneElement(child, {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? `${name}-error` : undefined,
          })}
        </FormControl>
      </div>
      {error ? <FormMessage id={`${name}-error`}>{error}</FormMessage> : null}
    </FormItem>
  )
}

export { FormItem, FormLabel, FormControl, FormMessage, FormField }
