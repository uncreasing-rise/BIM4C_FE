import { env } from "@/lib/config/env";

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "/images/image.png";
  if (
    /^(https?:)?\/\//.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("/")
  )
    return path;
  return env.cdnUrl ? `${env.cdnUrl}/${path.replace(/^\//, "")}` : path;
}
