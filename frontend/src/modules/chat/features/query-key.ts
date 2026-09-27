import { createQueryKeys } from "@/libs"
import { QUERY_KEY_DOMAIN } from "@/shared/constants"
import type { QueryKey } from "@tanstack/react-query"

export const conversationQueryKeys = createQueryKeys(QUERY_KEY_DOMAIN.CHAT, {
  all: () => [] as QueryKey,
  list: (filters?: { limit?: number }) =>
    (filters ? [filters] : []) as QueryKey,
  detail: (conversationId: string) => [conversationId] as QueryKey,
})
