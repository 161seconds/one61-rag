import { z } from "zod"
import { EventType } from "../../types"

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventType: z.nativeEnum(EventType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reminderAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type CreateEventSchema = z.infer<typeof createEventSchema>
