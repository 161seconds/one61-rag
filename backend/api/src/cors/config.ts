import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface"
import { INestApplication } from "@nestjs/common"
import { envConfig } from "@aqua-calendar/env"

export const createCorsOptions = (): CorsOptions => ({
  origin: envConfig().cors.origins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
})

export const enableCors = (app: INestApplication) => {
  app.enableCors(createCorsOptions())
}
