type LogContext = Record<string, unknown>;

function sanitize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;

  const redacted = new Set([
    "authorization",
    "cookie",
    "password",
    "token",
    "accesstoken",
    "refreshtoken",
    "secret",
  ]);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      redacted.has(key) || redacted.has(key.toLowerCase())
        ? "[REDACTED]"
        : sanitize(entry),
    ]),
  );
}

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}): void {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(sanitize(context) as LogContext),
  });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

export const appLogger = {
  info: (event: string, context?: LogContext) => write("info", event, context ?? {}),
  warn: (event: string, context?: LogContext) => write("warn", event, context ?? {}),
  error: (event: string, error?: unknown, context: LogContext = {}) =>
    write("error", event, { ...context, error }),
};
