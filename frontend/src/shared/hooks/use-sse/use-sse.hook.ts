import { baseUrl } from "@/libs/axios"
import { useEffect, useRef } from "react"

export type UseSseOptions = {
  onToken?: (payload: unknown) => void
  onMessage?: (payload: unknown) => void
  onDone?: () => void
  onStart?: (payload: unknown) => void
  onError?: (payload: unknown) => void
}

export function useSse(
  conversationId: string | null,
  options?: UseSseOptions
) {
  const optsRef = useRef(options)

  useEffect(() => {
    optsRef.current = options
  }, [options])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const url = `${baseUrl}/sse/stream?conversationId=${encodeURIComponent(conversationId)}`

    const es = new EventSource(url, { withCredentials: true })

    const parseData = (data: string): unknown => {
      try {
        return JSON.parse(data) as unknown
      } catch {
        return data
      }
    }

    const onStart = (e: MessageEvent) => {
      optsRef.current?.onStart?.(parseData(e.data))
    }

    const onToken = (e: MessageEvent) => {
      optsRef.current?.onToken?.(parseData(e.data))
    }

    const onMessage = (e: MessageEvent) => {
      optsRef.current?.onMessage?.(parseData(e.data))
    }

    const onDone = () => {
      optsRef.current?.onDone?.()
    }

    const onAiError = (e: MessageEvent) => {
      optsRef.current?.onError?.(parseData(e.data))
    }

    es.addEventListener("ai:start", onStart)
    es.addEventListener("ai:token", onToken)
    es.addEventListener("ai:message", onMessage)
    es.addEventListener("ai:done", onDone)
    es.addEventListener("ai:error", onAiError)

    return () => {
      es.removeEventListener("ai:start", onStart)
      es.removeEventListener("ai:token", onToken)
      es.removeEventListener("ai:message", onMessage)
      es.removeEventListener("ai:done", onDone)
      es.removeEventListener("ai:error", onAiError)
      es.close()
    }
  }, [conversationId])

}
