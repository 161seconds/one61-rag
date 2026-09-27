import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@aqua-calendar/ui/components/sonner"
import "@aqua-calendar/ui/globals.css"
import { ThemeProvider } from "@/modules/apps/theme-provider"
import { router } from "./router"
import { queryClient } from "./libs"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
