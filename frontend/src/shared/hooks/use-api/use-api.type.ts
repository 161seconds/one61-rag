import { AxiosError } from "axios"

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  path: string
  durationMs: string
  data: T
  message?: string
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * API Error response structure
 */
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
  code?: string
}

/**
 * Extended Axios Error with API error response
 */
export type ApiError = AxiosError<ApiErrorResponse>

/**
 * Query key factory for consistent query key structure
 */
export const queryKeys = {
  all: ["api"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...queryKeys.details(), id] as const,
}
