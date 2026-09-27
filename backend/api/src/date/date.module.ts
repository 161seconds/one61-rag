import { Global, Module } from "@nestjs/common"
import { DayjsService } from "./dayjs.service"
import { MsService } from "./ms.service"

@Global()
@Module({
  providers: [DayjsService, MsService],
  exports: [DayjsService, MsService],
})
export class DateModule {}
