import {
  createEventSchema,
  CreateEventSchema,
  updateEventSchema,
  UpdateEventSchema,
} from "@aqua-calendar/constants"
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
} from "@nestjs/common"
import { ZodValidationPipe } from "../../shared/pipe/"
import { Event } from "@aqua-calendar/database"
import { EventService } from "./event.service"
import {
  CurrentUser,
  JwtAccessToken,
  JwtAccessTokenGuard,
} from "../../passport"

@Controller("events")
@UseGuards(JwtAccessTokenGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(
    @CurrentUser() user: JwtAccessToken,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventSchema
  ): Promise<Event> {
    return this.eventService.createEvent(user.userId, body)
  }

  @Patch(":id")
  async updateEvent(
    @CurrentUser() user: JwtAccessToken,
    @Param("id") eventId: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventSchema
  ): Promise<boolean> {
    return this.eventService.updateEvent(user.userId, eventId, body)
  }

  @Delete(":id")
  async deleteEvent(
    @CurrentUser() user: JwtAccessToken,
    @Param("id") eventId: string
  ): Promise<boolean> {
    return this.eventService.deleteEvent(user.userId, eventId)
  }
}
