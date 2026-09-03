const LOCAL_HTTP_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getSafeVideoUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const candidate = value.trim();
  if (!candidate) return undefined;
  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol === "https:") return url.toString();
    if (url.protocol === "http:" && LOCAL_HTTP_HOSTS.has(url.hostname)) {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}
