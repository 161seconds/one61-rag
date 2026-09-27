import { toast } from "@aqua-calendar/ui/components/toast"
import {
  CustomToast,
  type ToastAction,
  type ToastLayout,
  type ToastVariant,
} from "@/shared/components"

interface ShowToastOptions {
  title: string
  description: string
  actions?: ToastAction[]
  showIcon?: boolean
  duration?: number
  autoClose?: boolean
  layout?: ToastLayout
}

export function useCustomToast() {
  const showToast = (variant: ToastVariant, options: ShowToastOptions) => {
    const {
      title,
      description,
      actions,
      duration,
      autoClose = true,
      layout,
      showIcon,
    } = options
    return toast.custom(
      (id) => (
        <CustomToast
          variant={variant}
          title={title}
          description={description}
          actions={actions}
          toastId={id}
          onClose={toast.dismiss}
          layout={layout}
          showIcon={showIcon}
        />
      ),
      {
        position: layout === "banner" ? "top-center" : "bottom-left",
        duration: autoClose ? duration || 5000 : Infinity,
      }
    )
  }

  return {
    showSuccessToast: (options: ShowToastOptions) =>
      showToast("success", options),
    showErrorToast: (options: ShowToastOptions) => showToast("error", options),
    showWarningToast: (options: ShowToastOptions) =>
      showToast("warning", options),
    showInfoToast: (options: ShowToastOptions) => showToast("info", options),
  }
}
