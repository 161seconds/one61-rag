import { Global, Module } from "@nestjs/common"
import { NotificationService } from "./notification.service"
import { NotificationController } from "./notification.controller"
import { NotificationSettingExistPipe } from "./pipe/notification-setting-exist.pipe"

@Global()
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationSettingExistPipe],
  exports: [NotificationService],
})
export class NotificationModule {}
