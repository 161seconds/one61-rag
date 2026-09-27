import {
  Injectable,
  NotFoundException,
  Scope,
  PipeTransform,
  ArgumentMetadata,
  Inject,
  UnauthorizedException,
} from "@nestjs/common"
import type { NotificationChannel } from "@aqua-calendar/constants"
import { PrismaService } from "../../../prisma"
import { REQUEST } from "@nestjs/core"
import { Request } from "express"

@Injectable({ scope: Scope.REQUEST })
export class NotificationSettingExistPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly prisma: PrismaService
  ) {}

  async transform(
    value: NotificationChannel,
    _metadata: ArgumentMetadata
  ): Promise<NotificationChannel> {
    const userId = (this.request.user as { userId?: string } | undefined)
      ?.userId
    const channel = value

    if (!userId) {
      throw new UnauthorizedException("User is not authenticated")
    }

    const notificationSetting =
      await this.prisma.notificationSetting.findUnique({
        where: {
          unique_notification_setting: {
            userId,
            channel,
          },
        },
      })

    if (!notificationSetting) {
      throw new NotFoundException(
        `Admin notification channel not found for channel: ${channel}`
      )
    }

    return value
  }
}
