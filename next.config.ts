import type { NextConfig } from "next";

const mediaOrigin = process.env.NEXT_PUBLIC_CDN_URL;

function mediaPatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  if (!mediaOrigin) return [];

  const origin = new URL(mediaOrigin);
  const base = {
    protocol: origin.protocol.replace(":", "") as "http" | "https",
    hostname: origin.hostname,
    port: origin.port,
  };

  return [
    { ...base, pathname: "/storage/v1/object/public/**" },
    { ...base, pathname: "/images/**" },
  ];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep metadata blocking so redirects/notFound raised during metadata generation
  // preserve their HTTP semantics for crawlers as well as browsers.
  htmlLimitedBots: /.*/,
  allowedDevOrigins: ["192.168.1.12"],
  images: {
    remotePatterns: mediaPatterns(),
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
