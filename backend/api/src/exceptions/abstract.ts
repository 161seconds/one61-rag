export abstract class AppException extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown
  readonly isOperational: boolean

  protected constructor(options: {
    message: string
    code: string
    status: number
    details?: unknown
    isOperational?: boolean
  }) {
    super(options.message)

    this.code = options.code
    this.status = options.status
    this.details = options.details
    this.isOperational = options.isOperational ?? true

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
