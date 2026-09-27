import { createQueryKeys } from "@/libs"
import { QUERY_KEY_DOMAIN } from "@/shared/constants"
import type { QueryKey } from "@tanstack/react-query"

export const notificationSettingQueryKeys = createQueryKeys(
  QUERY_KEY_DOMAIN.NOTIFICATION_SETTING,
  {
    all: () => [] as QueryKey,
    list: () => [] as QueryKey,
    subscription: () => [] as QueryKey,
  }
)
