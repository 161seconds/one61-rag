import { User } from "@aqua-calendar/database"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma"
import { CreateUserDto } from "./user.type"
import { NotificationService } from "../notification"

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

  public async getUserById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    })

    return user
  }

  public async createUser(data: CreateUserDto): Promise<User> {
    const user = await this.prismaService.user.create({
      data,
    })

    await this.notificationService.seedNotificationSettings(user.id)

    return user
  }
}
