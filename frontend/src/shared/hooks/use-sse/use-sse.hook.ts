import { baseUrl } from "@/libs/axios"
import { useEffect, useRef, useState } from "react"

export type SseStatus = "connecting" | "connected" | "disconnected" | "error"

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
  const [status, setStatus] = useState<SseStatus>("disconnected")
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    if (!conversationId) {
      setStatus("disconnected")
      return
    }

    const url = `${baseUrl}/sse/stream?conversationId=${encodeURIComponent(conversationId)}`
    setStatus("connecting")

    const es = new EventSource(url, { withCredentials: true })

    const parseData = (data: string): unknown => {
      try {
        return JSON.parse(data) as unknown
      } catch {
        return data
      }
    }

    const onOpen = () => {
      setStatus("connected")
    }

    const onError = () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus("disconnected")
      } else {
        setStatus("error")
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

    es.addEventListener("open", onOpen)
    es.addEventListener("error", onError)
    es.addEventListener("ai:start", onStart)
    es.addEventListener("ai:token", onToken)
    es.addEventListener("ai:message", onMessage)
    es.addEventListener("ai:done", onDone)
    es.addEventListener("ai:error", onAiError)

    return () => {
      es.removeEventListener("open", onOpen)
      es.removeEventListener("error", onError)
      es.removeEventListener("ai:start", onStart)
      es.removeEventListener("ai:token", onToken)
      es.removeEventListener("ai:message", onMessage)
      es.removeEventListener("ai:done", onDone)
      es.removeEventListener("ai:error", onAiError)
      es.close()
      setStatus("disconnected")
    }
  }, [conversationId])

  return { status }
}
