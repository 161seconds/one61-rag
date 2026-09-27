import { type CreateEventSchema } from "@aqua-calendar/constants"
import { useApiPost } from "@/shared/hooks/use-api/use-api.hook"
import { ENDPOINT_PATH } from "@/shared/constants"

export const useCreateEvent = () => {
  const { mutate, isPending } = useApiPost<void, CreateEventSchema>(
    `/${ENDPOINT_PATH.EVENT}`
  )

  const handleCreateEvent = (event: CreateEventSchema) => {
    mutate(event)
  }

  return { handleCreateEvent, isPending }
}
