import type ms from "ms"

export const envConfig = () => {
  return {
    app: {
      apis: {
        port: process.env.APIS_PORT ?? 3002,
      },
      notificationWorker: {
        port: process.env.NOTIFICATION_WORKER_PORT ?? 3003,
      },
      notificationDelivery: {
        port: process.env.NOTIFICATION_DELIVERY_PORT ?? 3004,
      },
      environment: process.env.NODE_ENV ?? "development",
    },
    jwt: {
      accessToken: {
        expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ??
          process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ??
          "1h") as ms.StringValue,
        secret: process.env.JWT_ACCESS_TOKEN_SECRET ?? "secret",
      },
      refreshToken: {
        expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ??
          process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ??
          "7d") as ms.StringValue,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET ?? "secret",
      },
    },
    database: {
      postgres: {
        url:
          process.env.DATABASE_URL ??
          "postgresql://aqua_may:aqua_may@localhost:5979/aqua_may_db",
      },
    },
    cors: {
      origins: Array.from(
        { length: 10 },
        (_, i) => process.env[`CORS_ORIGIN_${i + 1}`] || ""
      ).filter((url) => url !== ""),
    },
    redis: {
      bullmq: {
        host:
          process.env.REDIS_BULLMQ_HOST ?? process.env.REDIS_HOST ?? "localhost",
        port: Number.parseInt(process.env.REDIS_BULLMQ_PORT ?? "6380"),
        password: process.env.REDIS_BULLMQ_PASS,
        attempts: Number.parseInt(process.env.REDIS_BULLMQ_ATTEMPTS ?? "3"),
        delay: Number.parseInt(process.env.REDIS_BULLMQ_DELAY ?? "1000"),
      },
      cache: {
        host:
          process.env.REDIS_CACHE_HOST ?? process.env.REDIS_HOST ?? "localhost",
        port: Number.parseInt(process.env.REDIS_CACHE_PORT ?? "6381"),
        password: process.env.REDIS_CACHE_PASS,
      },
      pubsub: {
        host:
          process.env.REDIS_PUB_SUB_HOST ?? process.env.REDIS_HOST ?? "localhost",
        port: Number.parseInt(process.env.REDIS_PUB_SUB_PORT ?? "6382"),
        password: process.env.REDIS_PUB_SUB_PASS,
        notificationDelivery:
          process.env.NOTIFICATION_DELIVERY_PUBSUB ?? "notification",
      },
    },
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "",
      successRedirectURL:
        process.env.GOOGLE_SUCCESS_REDIRECT_URL ??
        `${process.env.CORS_ORIGIN_1 ?? "http://localhost:5173"}/`,
    },
    fcm: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT ?? "",
      serviceAccountPath: process.env.FCM_SERVICE_ACCOUNT_PATH ?? "",
    },
    r2: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      endpoint: process.env.R2_ENDPOINT ?? "",
      bucket: process.env.R2_BUCKET ?? "",
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    },
  }
}
