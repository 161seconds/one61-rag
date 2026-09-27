import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  path?: string
  durationMs?: number
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    const isSse = Reflect.getMetadata("__sse__", handler)

    if (isSse) {
      return next.handle()
    }

    const startedAt = Date.now()

    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest()
        const path = request.path
        const durationMs = Date.now() - startedAt

        if (data && typeof data === "object" && "success" in data) {
          return {
            ...data,
            path: data.path ?? path,
            durationMs: `${durationMs}ms`,
          }
        }

        return {
          success: true,
          path,
          durationMs: `${durationMs}ms`,
          data: data,
        }
      })
    )
  }
}
