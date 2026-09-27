import { DEFAULT_REDACTED_KEYS } from "./logger.constants"
import { redactSensitiveData } from "./logger.util"
import { format, transports, createLogger, type Logger } from "winston"
import { type LoggerOptions } from "./logger.type"

export function createWinstonLogger(options: LoggerOptions): Logger {
  const environment = options.environment ?? "development"
  const isProduction = environment === "production"
  const redactedKeys = new Set(
    (options.redactedKeys ?? [...DEFAULT_REDACTED_KEYS]).map((key) =>
      key.toLowerCase()
    )
  )
  const baseFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format((info) => {
      return redactSensitiveData(info, redactedKeys) as typeof info
    })()
  )

  const developmentFormat = format.combine(
    baseFormat,
    format.colorize({ level: true }),
    format.printf((info) => {
      const context = info.context ? ` [${String(info.context)}]` : ""
      const trace = info.trace ? `\n${String(info.trace)}` : ""
      return `${String(info.timestamp)} ${String(info.level)} [${String(info.service)}]${context} ${String(info.message)}${trace}`
    })
  )

  return createLogger({
    level: options.level ?? (isProduction ? "info" : "debug"),
    defaultMeta: {
      service: options.service,
      environment,
    },
    format: isProduction ? format.combine(baseFormat, format.json()) : developmentFormat,
    transports: [new transports.Console()],
  })
}
