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
  allowedDevOrigins: ["192.168.1.12"],
  images: {
    remotePatterns: mediaPatterns(),
  },
};

export default nextConfig;
