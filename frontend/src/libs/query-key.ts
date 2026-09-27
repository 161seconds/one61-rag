import type { QueryOptions } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"

type QueryKeyFn<TArgs extends unknown[]> = ((...args: TArgs) => QueryKey) & {
  _def: readonly [string, string]
}

type TransformQueryKeys<T extends string, K extends Record<string, unknown>> = {
  [P in keyof K]: P extends "all"
    ? K[P] extends unknown[]
      ? readonly [T]
      : readonly [T]
    : K[P] extends (...args: infer TArgs) => QueryKey
      ? QueryKeyFn<TArgs>
      : K[P]
}

/**
 * Utility function to create structured query keys for React Query, allowing for consistent and maintainable cache management across the application.
 *
 * @param mainKey - The primary key representing the resource or domain (e.g., 'assets', 'departments').
 * @param keys - An object defining specific query keys and their corresponding functions or static values.
 * @returns An object with structured query key functions that automatically include the main key as a prefix.
 */
export const createQueryKeys = <
  T extends string,
  K extends Record<string, unknown>,
>(
  mainKey: T,
  keys: K
): TransformQueryKeys<T, K> => {
  const result: Record<string, unknown> = { all: [mainKey] }

  for (const key in keys) {
    if (key === "all") continue

    const value = keys[key]
    if (typeof value === "function") {
      const wrappedFn = (...args: unknown[]) => {
        const queryKey = value(...args)
        return Array.isArray(queryKey) ? [mainKey, key, ...queryKey] : queryKey
      }
      result[key] = Object.assign(wrappedFn, {
        _def: [mainKey, key] as const,
      })
    } else if (value && typeof value === "object" && "queryKey" in value) {
      const fn = (...args: unknown[]) => {
        const originalQueryKey =
          typeof value.queryKey === "function"
            ? value.queryKey(...args)
            : value.queryKey
        return {
          queryKey: [mainKey, key, ...originalQueryKey],
          queryFn: (value as QueryOptions).queryFn,
        }
      }
      result[key] = Object.assign(fn, {
        _def: [mainKey, key] as const,
      })
    } else {
      // For non-function values (like arrays), directly assign with mainKey
      result[key] = Array.isArray(value) ? [mainKey, key, ...value] : value
    }
  }

  return result as TransformQueryKeys<T, K>
}
