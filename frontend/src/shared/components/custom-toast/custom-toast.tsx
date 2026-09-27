import { CheckCircle, XCircle, X, AlertTriangle, Info } from "lucide-react"
import { Button } from "@aqua-calendar/ui/components/button"
import CopyLinkButton from "./copy-link"
import type React from "react"

export type ToastVariant = "success" | "error" | "warning" | "info"
export type ToastLayout = "card" | "banner"
export interface ToastAction {
  label: string
  onClick?: () => void
  href?: string
  icon?: React.ReactNode
  type?: "view" | "copy-link" | "custom"
}

interface CustomToastProps {
  variant: ToastVariant
  layout?: ToastLayout
  showIcon?: boolean
  title: string
  description: string
  actions?: ToastAction[]
  toastId?: string | number
  onClose?: (id?: string | number) => void
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    borderColor: "border-success",
    iconColor: "text-success",
    bgColor: "bg-linear-to-r from-success-50/50 to-background",
  },
  error: {
    icon: XCircle,
    borderColor: "border-destructive",
    iconColor: "text-destructive",
    bgColor: "bg-linear-to-r from-destructive-50/50 to-background",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-warning",
    iconColor: "text-warning",
    bgColor: "bg-linear-to-r from-warning-50 to-background",
  },
  info: {
    icon: Info,
    borderColor: "border-info",
    iconColor: "text-info",
    bgColor: "bg-linear-to-r from-info-50 to-background",
  },
}

export function CustomToast({
  variant,
  layout = "card",
  title,
  showIcon = true,
  description,
  actions,
  toastId,
  onClose,
}: CustomToastProps) {
  const config = variantConfig[variant]
  const IconComponent = config.icon
  if (layout === "banner") {
    return (
      <div
        className={`flex w-fit items-center gap-3 rounded-md px-4 py-3 shadow-lg ${
          variant === "success"
            ? "bg-success"
            : variant === "error"
              ? "bg-destructive"
              : variant === "warning"
                ? "bg-warning"
                : "bg-info"
        }`}
      >
        {showIcon && (
          <IconComponent className="size-5 shrink-0 text-primary-foreground" />
        )}

        <p className="text-sm whitespace-nowrap text-primary-foreground">
          {description || title}
        </p>

        {actions?.map((action, i) =>
          action.onClick ? (
            <Button
              variant={"outline"}
              key={i}
              onClick={action.onClick}
              className="bg-transparent text-primary-foreground dark:bg-transparent"
            >
              {action.icon && action.icon}
              {action.label}
            </Button>
          ) : (
            <span key={i}>{action.icon}</span>
          )
        )}

        <Button
          size={"icon"}
          onClick={() => onClose?.(toastId)}
          className="bg-transparent"
        >
          <X className="size-4 text-primary-foreground hover:opacity-100" />
        </Button>
      </div>
    )
  }
  return (
    <div
      className={`relative flex w-full max-w-sm items-start border-l-4 p-4 shadow-lg ${config.borderColor} ${config.bgColor}`}
    >
      <div className="shrink-0">
        <IconComponent className={`size-6 ${config.iconColor}`} />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {actions && actions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const ActionIcon = action.icon
              if (action.type === "view" && action.href) {
                return (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                    >
                      {ActionIcon && ActionIcon}
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </a>
                )
              } else if (action.type === "copy-link" && action.href) {
                return <CopyLinkButton key={index} url={action.href} />
              } else {
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.onClick}
                  >
                    {ActionIcon && ActionIcon}
                    <span className="text-xs">{action.label}</span>
                  </Button>
                )
              }
            })}
          </div>
        )}
      </div>
      <div className="ml-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => onClose?.(toastId)}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
