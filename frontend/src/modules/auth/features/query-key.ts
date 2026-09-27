import { createQueryKeys } from "@/libs"
import { QUERY_KEY_DOMAIN } from "@/shared/constants"
import type { QueryKey } from "@tanstack/react-query"

export const authQueryKeys = createQueryKeys(QUERY_KEY_DOMAIN.AUTH, {
  all: () => [] as QueryKey,
  session: () => [] as QueryKey,
})
