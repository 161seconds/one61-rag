import { PrismaClient } from "@aqua-calendar/database"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common"
import { envConfig } from "@aqua-calendar/env"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envConfig().database.postgres.url,
    })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug("Prisma connected")
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
