import { Link } from "@tanstack/react-router"

export function DefaultNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">404 – Page not found</h1>
      <p className="text-center text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Go home
      </Link>
    </div>
  )
}
