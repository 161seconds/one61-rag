import { ErrorComponent, useRouter } from "@tanstack/react-router"

type DefaultCatchBoundaryProps = {
  error: Error
}

export function DefaultCatchBoundary({ error }: DefaultCatchBoundaryProps) {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <ErrorComponent error={error} />
      <button
        type="button"
        onClick={() => router.invalidate()}
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Try again
      </button>
    </div>
  )
}
