import type { Metadata } from "next";
import type { ContentEntry } from "@/types/content";

export function getContentMetadata(entry: ContentEntry, pathname: string): Metadata {
  const title = entry.seoTitle || entry.title;
  const description = entry.seoDescription || entry.description;
  const image = entry.seoImage || entry.image;
  const canonical = pathname;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, images: [{ url: image, alt: entry.title }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}
