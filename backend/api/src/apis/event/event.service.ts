import { CreateEventSchema, UpdateEventSchema } from "@aqua-calendar/constants"
import { getReminderDelay, getReminderJobId } from "./event.util"
import { BullQueueName } from "@aqua-calendar/infra-redis"
import { Event } from "@aqua-calendar/database"
import { PrismaService } from "../../prisma"
import { InjectQueue } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Queue } from "bullmq"

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(BullQueueName.REMINDER_QUEUE)
    private readonly reminderQueue: Queue
  ) {}

  async createEvent(userId: string, body: CreateEventSchema): Promise<Event> {
    const event = await this.prismaService.event.create({
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        reminderAt: body.reminderAt,
        metadata: body.metadata,
        eventType: body.eventType,
        userId,
      },
    })

    const reminderDelay = getReminderDelay(body.startDate)

    console.log(reminderDelay)

    await this.reminderQueue.add(
      BullQueueName.REMINDER_QUEUE,
      {
        reminderId: event.id,
        event: {
          id: event.id,
          content: {
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
          },
        },
        target: {
          id: event.userId,
          content: { displayName: event.title, email: event.userId },
        },
      },
      {
        delay: reminderDelay,
        jobId: getReminderJobId(event.id),
      }
    )

    return event
  }

  async updateEvent(
    userId: string,
    eventId: string,
    body: UpdateEventSchema
  ): Promise<boolean> {
    await this.prismaService.event.update({
      where: { id: eventId, userId },
      data: body,
    })

    if (body.startDate) {
      const reminderJobId = getReminderJobId(eventId)

      await this.reminderQueue.remove(reminderJobId)
      await this.reminderQueue.add(
        BullQueueName.REMINDER_QUEUE,
        { eventId, userId },
        {
          delay: getReminderDelay(body.startDate),
          jobId: reminderJobId,
        }
      )
    }

    return true
  }

  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    await this.prismaService.event.delete({
      where: { id: eventId, userId },
    })
    await this.reminderQueue.remove(getReminderJobId(eventId))

    return true
  }
}
