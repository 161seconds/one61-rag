export const cacheKey = {
  notification: {
    preference: (userId: string) => `notification:preference:${userId}`,
  },
} as const
