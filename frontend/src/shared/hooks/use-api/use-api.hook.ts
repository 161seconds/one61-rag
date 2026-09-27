import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query"
import { httpRequest, type AxiosRequestConfig } from "@/libs"
import { queryKeys, type ApiError, type ApiResponse } from "./use-api.type"

/**
 * Generic API hook for GET requests (useQuery)
 */
export const useApi = <TData = unknown, TError = ApiError>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const response = (await httpRequest.get<ApiResponse<TData>>(
        url,
        config
      )) as unknown as ApiResponse<TData>
      return response.data
    },
    ...options,
  })
}

/**
 * Hook for POST requests (useMutation)
 */
export const useApiPost = <
  TData = unknown,
  TVariables = unknown,
  TError = ApiError,
>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) => {
  const queryClient = useQueryClient()

  const userOnSuccess = options?.onSuccess

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = (await httpRequest.post<ApiResponse<TData>>(
        url,
        variables
      )) as unknown as ApiResponse<TData>
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.all })
      // Call user's onSuccess if provided
      if (userOnSuccess) {
        ;(
          userOnSuccess as (
            data: TData,
            variables: TVariables,
            context: unknown
          ) => void
        )(data, variables, context)
      }
    },
  })
}

/**
 * Hook for PUT requests (useMutation)
 */
export const useApiPut = <
  TData = unknown,
  TVariables = unknown,
  TError = ApiError,
>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) => {
  const queryClient = useQueryClient()

  const userOnSuccess = options?.onSuccess

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = (await httpRequest.put<ApiResponse<TData>>(
        url,
        variables
      )) as unknown as ApiResponse<TData>
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all })
      // Call user's onSuccess if provided
      if (userOnSuccess) {
        ;(
          userOnSuccess as (
            data: TData,
            variables: TVariables,
            context: unknown
          ) => void
        )(data, variables, context)
      }
    },
  })
}

/**
 * Hook for PATCH requests (useMutation)
 */
export const useApiPatch = <
  TData = unknown,
  TVariables = unknown,
  TError = ApiError,
>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) => {
  const queryClient = useQueryClient()

  const userOnSuccess = options?.onSuccess

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = (await httpRequest.patch<ApiResponse<TData>>(
        url,
        variables
      )) as unknown as ApiResponse<TData>
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all })
      // Call user's onSuccess if provided
      if (userOnSuccess) {
        ;(
          userOnSuccess as (
            data: TData,
            variables: TVariables,
            context: unknown
          ) => void
        )(data, variables, context)
      }
    },
  })
}

/**
 * Hook for DELETE requests (useMutation)
 */
export const useApiDelete = <TData = unknown, TError = ApiError>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, void>, "mutationFn">
) => {
  const queryClient = useQueryClient()

  const userOnSuccess = options?.onSuccess

  return useMutation<TData, TError, void>({
    mutationFn: async () => {
      const response = (await httpRequest.delete<ApiResponse<TData>>(
        url
      )) as unknown as ApiResponse<TData>
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all })
      // Call user's onSuccess if provided
      if (userOnSuccess) {
        ;(
          userOnSuccess as (
            data: TData,
            variables: void,
            context: unknown
          ) => void
        )(data, variables, context)
      }
    },
  })
}

/**
 * Helper function to extract error message from API error
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiError
    const errorData = apiError.response?.data

    if (errorData?.message) {
      return errorData.message
    }

    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        const errorMessage = firstError[0]
        if (errorMessage) {
          return errorMessage
        }
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

export const getApiErrorCode = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiError
    const errorData = apiError.response?.data
    return errorData?.code || ""
  }
  return ""
}
