const normalizeUrl = (value: string | undefined) => value?.trim().replace(/\/+$/, "") || "";

function validateAppUrl(value: string): string {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_APP_URL is required for production SEO metadata.");
    }
    return "http://localhost:3000";
  }
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error("NEXT_PUBLIC_APP_URL must be an absolute http(s) URL."); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_APP_URL must contain only the canonical origin.");
  }
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:" && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  return parsed.origin;
}

export const isMockApiEnabled = (value: string | undefined) => value === "true";

export const env = {
  apiUrl: normalizeUrl(process.env.NEXT_PUBLIC_API_URL),
  appUrl: validateAppUrl(normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)),
  cdnUrl: normalizeUrl(process.env.NEXT_PUBLIC_CDN_URL),
  useMockApi: isMockApiEnabled(process.env.NEXT_PUBLIC_USE_MOCK_API),
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "",
  bingSiteVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "",
} as const;

export function assertApiEnvironment(): void {
  if (!env.useMockApi && !env.apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required when NEXT_PUBLIC_USE_MOCK_API=false.",
    );
  }
}
