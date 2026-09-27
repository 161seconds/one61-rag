import { NotificationService } from "./notification.service"
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Body,
  Param,
} from "@nestjs/common"
import {
  JwtAccessTokenGuard,
  JwtAccessToken,
  CurrentUser,
} from "../../passport"
import { ZodValidationPipe } from "../../shared/pipe"
import { z } from "zod"
import { NotificationChannel } from "@aqua-calendar/constants"
import { NotificationSettingExistPipe } from "./pipe/notification-setting-exist.pipe"

@Controller("notifications")
@UseGuards(JwtAccessTokenGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("/settings")
  async getNotificationSettings(@CurrentUser() user: JwtAccessToken) {
    return this.notificationService.getNotificationSettings(user.userId)
  }

  @Get("/settings/browser/subscribe")
  async checkBrowserSubscription(
    @CurrentUser() user: JwtAccessToken,
    @Query("browser") browser: string,
    @Query("token") token: string
  ) {
    return this.notificationService.checkBrowserSubscription(
      user.userId,
      browser,
      token
    )
  }

  @Post("/settings/browser/subscribe")
  async createBrowserSubscription(
    @CurrentUser() user: JwtAccessToken,
    @Body(
      new ZodValidationPipe(
        z.object({ browser: z.string(), token: z.string() })
      )
    )
    body: { browser: string; token: string }
  ) {
    return this.notificationService.createBrowserSubscription(
      user.userId,
      body.browser,
      body.token
    )
  }

  @Delete("/settings/browser/subscribe")
  async deleteBrowserSubscription(
    @CurrentUser() user: JwtAccessToken,
    @Query("browser") browser: string,
    @Query("token") token: string
  ) {
    return this.notificationService.deleteBrowserSubscription(
      user.userId,
      browser,
      token
    )
  }

  @Patch("/settings/channels/:channel")
  async updateNotificationSetting(
    @CurrentUser() user: JwtAccessToken,
    @Param(
      "channel",
      new ZodValidationPipe(z.nativeEnum(NotificationChannel)),
      NotificationSettingExistPipe
    )
    channel: NotificationChannel,
    @Body("enabled", new ZodValidationPipe(z.boolean())) enabled: boolean
  ): Promise<boolean> {
    return this.notificationService.updateNotificationSetting(
      user.userId,
      channel,
      enabled
    )
  }
}
