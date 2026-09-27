import { LoggerService } from "@nestjs/common"
import { type Logger as WinstonLogger } from "winston"

type NestLogLevel = "log" | "error" | "warn" | "debug" | "verbose" | "fatal"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toMessage(payload: unknown): string {
  if (payload instanceof Error) {
    return payload.message
  }

  if (typeof payload === "string") {
    return payload
  }

  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

export class NestWinstonLogger implements LoggerService {
  constructor(private readonly logger: WinstonLogger) {}

  private toMeta(payload: unknown): Record<string, unknown> | undefined {
    if (payload instanceof Error) {
      return {
        errorName: payload.name,
        errorMessage: payload.message,
        errorStack: payload.stack,
      }
    }

    if (isRecord(payload)) {
      return payload
    }

    return undefined
  }

  private write(level: NestLogLevel, message: unknown, ...optionalParams: unknown[]) {
    const [contextOrTrace, maybeContext] = optionalParams

    const context =
      level === "error"
        ? typeof maybeContext === "string"
          ? maybeContext
          : undefined
        : typeof contextOrTrace === "string"
          ? contextOrTrace
          : undefined

    const trace =
      level === "error" && typeof contextOrTrace === "string"
        ? contextOrTrace
        : undefined

    this.logger.log({
      level: level === "log" ? "info" : level === "fatal" ? "error" : level,
      message: toMessage(message),
      context,
      trace,
      meta: this.toMeta(message),
    })
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.write("log", message, ...optionalParams)
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write("error", message, ...optionalParams)
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write("warn", message, ...optionalParams)
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write("debug", message, ...optionalParams)
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write("verbose", message, ...optionalParams)
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.write("fatal", message, ...optionalParams)
  }
}
