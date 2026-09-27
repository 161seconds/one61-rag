import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common"
import { Response } from "express"
import { AppException } from "../../exceptions/abstract"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception instanceof AppException) {
      const status = exception.status
      // this.logger.warn(
      //   `AppException: ${exception.code}`,
      //   `${request.method} ${request.url}`,
      //   `${status} - ${exception.message}`
      // );

      const responseBody: {
        success: boolean
        message: string
        code: string
        details?: unknown
      } = {
        success: false,
        message: exception.message,
        code: exception.code,
      }

      if (exception.details !== undefined) {
        responseBody.details = exception.details
      }

      return response.status(status).json(responseBody)
    }

    // Handle HttpException (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      if (exception instanceof InternalServerErrorException) {
        this.logger.error(
          "Internal Server Error:",
          `${request.method} ${request.url}`,
          `${status} - ${exception.message}`,
          exception.stack
        )
      }

      const exceptionResponse = exception.getResponse()

      return response.status(status).json({
        success: false,
        message: exception.message,
        ...(typeof exceptionResponse === "object" && exceptionResponse),
      })
    }

    // Handle unexpected errors
    const errorMessage =
      exception instanceof Error ? exception.message : "Unknown error"
    const errorStack = exception instanceof Error ? exception.stack : undefined
    this.logger.error(
      "Unexpected error:",
      `${request.method} ${request.url}`,
      errorMessage,
      errorStack
    )

    return response.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
