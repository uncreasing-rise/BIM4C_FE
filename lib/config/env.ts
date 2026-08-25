const normalizeUrl = (value: string | undefined) => value?.replace(/\/$/, "") || "";

export const env = {
  apiUrl: normalizeUrl(process.env.NEXT_PUBLIC_API_URL),
  appUrl: normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
  cdnUrl: normalizeUrl(process.env.NEXT_PUBLIC_CDN_URL),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== "false",
} as const;

export function assertApiEnvironment(): void {
  if (!env.useMockApi && !env.apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required when NEXT_PUBLIC_USE_MOCK_API=false.");
  }
}

