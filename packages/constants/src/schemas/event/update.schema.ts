import { z } from "zod"
import { EventStatus, EventType } from "../../types"

export const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  reminderAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type UpdateEventSchema = z.infer<typeof updateEventSchema>
