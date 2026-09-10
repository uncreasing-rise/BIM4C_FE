import { env } from "@/lib/config/env";

const FALLBACK_IMAGE = "/images/news-project-coordination.webp";
const RESTRICTED_IMAGE =
  /(?:ricon|ricons|about\.jpg|hero\.jpg|service-consulting\.jpg|project-(?:lumi|matrix|elysian)\.jpg)/iu;

export function getMediaUrl(path: string | null | undefined): string {
  if (!path || RESTRICTED_IMAGE.test(path)) return FALLBACK_IMAGE;
  if (
    /^(https?:)?\/\//.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("/")
  )
    return path;
  return env.cdnUrl ? `${env.cdnUrl}/${path.replace(/^\//, "")}` : path;
}
