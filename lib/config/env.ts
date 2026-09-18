const normalizeUrl = (value: string | undefined) =>
  value?.trim().replace(/\/+$/, "") || "";

const productionSiteUrl = "https://www.bim4c.vn";

function validateAppUrl(value: string): string {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_APP_URL is required for production SEO metadata.",
      );
    }
    return "http://localhost:3000";
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be an absolute http(s) URL.");
  }
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must contain only the canonical origin.",
    );
  }
  const isKnownProductionHost =
    parsed.hostname.endsWith(".vercel.app") ||
    parsed.hostname === "bim4c.vn" ||
    parsed.hostname === "www.bim4c.vn";
  if (
    process.env.NODE_ENV === "production" &&
    parsed.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(parsed.hostname) &&
    !isKnownProductionHost
  ) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    isKnownProductionHost
  ) {
    return productionSiteUrl;
  }
  return parsed.origin;
}

export const env = {
  apiUrl: normalizeUrl(process.env.NEXT_PUBLIC_API_URL),
  appUrl: validateAppUrl(normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)),
  cdnUrl: normalizeUrl(process.env.NEXT_PUBLIC_CDN_URL),
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "",
  bingSiteVerification:
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "",
} as const;

export function assertApiEnvironment(): void {
  if (!env.apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required.");
  }
}
