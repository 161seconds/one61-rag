import axios, { AxiosError } from "axios"
import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

export const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"

const httpRequest = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

const refreshTokenRequest = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
})

const AUTH_ROUTES_TO_SKIP_REFRESH = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/refresh",
]

const shouldSkipRefresh = (url?: string) => {
  if (!url) {
    return false
  }

  return AUTH_ROUTES_TO_SKIP_REFRESH.some((route) => url.includes(route))
}

httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.VITE_DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      )
    }

    return config
  },
  (error: AxiosError) => {
    if (import.meta.env.VITE_DEV) {
      console.error("[API Request Error]", error)
    }
    return Promise.reject(error)
  }
)

httpRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.request.responseType === "blob") {
      return response
    }

    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const requestUrl = originalRequest?.url

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !shouldSkipRefresh(requestUrl)
    ) {
      originalRequest._retry = true

      try {
        await refreshTokenRequest.post(
          `${baseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        return httpRequest(originalRequest)
      } catch {
        return Promise.reject(error)
      }
    }

    if (import.meta.env.VITE_DEV) {
      console.error("[API Response Error]", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      })
    }

    return Promise.reject(error)
  }
)

export { httpRequest }
export type { AxiosRequestConfig, AxiosResponse, AxiosError }
