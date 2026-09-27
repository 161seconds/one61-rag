const REDACTED_VALUE = "[REDACTED]"

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function shouldRedactKey(key: string, redactedKeys: Set<string>): boolean {
  return redactedKeys.has(key.toLowerCase())
}

export function redactSensitiveData(
  value: unknown,
  redactedKeys: Set<string>
): unknown {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = redactSensitiveData(value[index], redactedKeys)
    }
    return value
  }

  if (!isPlainObject(value)) {
    return value
  }

  Object.entries(value).forEach(([key, entry]) => {
    if (shouldRedactKey(key, redactedKeys)) {
      value[key] = REDACTED_VALUE
      return
    }

    value[key] = redactSensitiveData(entry, redactedKeys)
  })

  return value
}
