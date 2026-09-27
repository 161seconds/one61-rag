export function getBrowser(): string {
  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes("chrome") && !ua.includes("edg")) return "chrome"
  if (ua.includes("edg")) return "edge"
  if (ua.includes("firefox")) return "firefox"
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari"

  return "unknown"
}
