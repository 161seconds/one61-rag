import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma"
import {
  GetNotificationSettings,
  NotificationChannel,
  NotificationSetting,
} from "@aqua-calendar/constants"
import { BrowserSubscriptionNotFoundException } from "../../exceptions"
@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  public async seedNotificationSettings(userId: string): Promise<void> {
    await this.prismaService.notificationSetting.createMany({
      data: [
        {
          userId,
          channel: NotificationChannel.IN_APP,
          enabled: true,
        },

        {
          userId,
          channel: NotificationChannel.EMAIL,
          enabled: true,
        },
        {
          userId,
          channel: NotificationChannel.BROWSER,
          enabled: false,
        },
      ],
    })
  }

  async getNotificationSettings(
    userId: string
  ): Promise<GetNotificationSettings> {
    const settings = await this.prismaService.notificationSetting.findMany({
      where: {
        userId,
      },
      select: {
        channel: true,
        enabled: true,
      },
    })

    return settings as GetNotificationSettings
  }

  async checkBrowserSubscription(
    userId: string,
    browser: string,
    token: string
  ): Promise<boolean> {
    const subscription =
      await this.prismaService.browserSubscription.findUnique({
        where: {
          unique_browser_subscription: {
            userId,
            browser,
            token,
          },
        },
      })

    if (!subscription) {
      throw new BrowserSubscriptionNotFoundException(
        "Browser subscription not found"
      )
    }

    return true
  }

  async createBrowserSubscription(
    userId: string,
    browser: string,
    token: string
  ): Promise<void> {
    await this.prismaService.browserSubscription.upsert({
      where: {
        unique_browser_subscription: {
          userId,
          browser,
          token,
        },
      },
      update: {
        token,
      },
      create: {
        userId,
        browser,
        token,
      },
    })

    await this.updateNotificationSetting(
      userId,
      NotificationChannel.BROWSER,
      true
    )
  }

  async deleteBrowserSubscription(
    userId: string,
    browser: string,
    token: string
  ): Promise<void> {
    await this.prismaService.browserSubscription.delete({
      where: {
        unique_browser_subscription: {
          userId,
          browser,
          token,
        },
      },
    })
  }

  async updateNotificationSetting(
    userId: string,
    channel: NotificationChannel,
    enabled: boolean
  ): Promise<boolean> {
    await this.prismaService.notificationSetting.update({
      where: {
        unique_notification_setting: {
          userId,
          channel,
        },
      },
      data: {
        enabled,
      },
    })

    return true
  }
}
