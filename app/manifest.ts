import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BIM4C Construction",
    short_name: "BIM4C",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#09a7a5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
