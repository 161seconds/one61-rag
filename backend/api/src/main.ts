import { createWinstonLogger, NestWinstonLogger } from "@aqua-calendar/logger"
import { ResponseInterceptor } from "./shared/interceptors"
import { HttpExceptionFilter } from "./shared/filters"
import { envConfig } from "@aqua-calendar/env"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import cookieParser from "cookie-parser"
import { enableCors } from "./cors"

async function bootstrap() {
  const environment = envConfig().app.environment
  const logger = new NestWinstonLogger(
    createWinstonLogger({
      service: "apis",
      environment,
    })
  )
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  })
  app.useLogger(logger)

  app.use(cookieParser())

  enableCors(app)

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  await app.listen(envConfig().app.apis.port)
  if (environment !== "production") {
    logger.debug(
      `🚀 Application is running on: http://localhost:${envConfig().app.apis.port}`
    )
  }
}
void bootstrap()
