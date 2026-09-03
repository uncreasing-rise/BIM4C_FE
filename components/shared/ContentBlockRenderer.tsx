import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSafeVideoUrl } from "@/lib/utils/safe-url";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="space-y-12">{blocks.map((block) => {
    switch (block.type) {
      case "rich-text":
        return <section className="scroll-mt-28" id={`block-${block.id}`} key={block.id}>{block.heading && <h2 className="mb-5 text-3xl font-semibold tracking-[-.035em]">{block.heading}</h2>}<div className="space-y-4 text-base leading-8 text-muted-foreground">{block.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>;
      case "image":
        return <figure className="overflow-hidden rounded-2xl" key={block.id}><Image className="h-auto w-full object-cover" src={block.image.url} alt={block.image.alt} width={block.image.width ?? 1400} height={block.image.height ?? 900} sizes="(max-width:1023px) 100vw, 70vw" />{block.image.caption && <figcaption className="bg-muted px-4 py-3 text-center text-xs text-muted-foreground">{block.image.caption}</figcaption>}</figure>;
      case "gallery":
        return <section className="grid gap-4 sm:grid-cols-2" aria-label="Thư viện hình ảnh" key={block.id}>{block.images.map((image, index) => <figure className={`relative overflow-hidden rounded-2xl bg-muted ${index === 0 && block.images.length % 2 ? "sm:col-span-2" : ""}`} key={`${image.url}-${index}`}><Image className="aspect-[4/3] h-full w-full object-cover" src={image.url} alt={image.alt} width={image.width ?? 900} height={image.height ?? 675} sizes="(max-width:639px) 100vw, 35vw" />{image.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 p-3 text-xs text-white">{image.caption}</figcaption>}</figure>)}</section>;
      case "quote":
        return <blockquote className="border-l-4 border-primary bg-muted/50 px-6 py-7 text-2xl font-medium leading-relaxed" key={block.id}><p>“{block.quote}”</p>{block.author && <footer className="mt-4 text-sm font-normal text-muted-foreground">— {block.author}</footer>}</blockquote>;
      case "feature-list": {
        const List = block.ordered ? "ol" : "ul";
        return <section key={block.id}>{block.heading && <h2 className="mb-5 text-2xl font-semibold">{block.heading}</h2>}<List className={`grid gap-3 ${block.ordered ? "list-decimal pl-6" : "list-disc pl-6"}`}>{block.items.map((item) => <li className="pl-2 leading-7 text-muted-foreground" key={item}>{item}</li>)}</List></section>;
      }
      case "video": {
        const safeUrl = getSafeVideoUrl(block.url);
        if (!safeUrl) return null;
        return <section className="rounded-2xl border bg-muted/35 p-6" key={block.id}>{block.title && <h2 className="mb-4 text-xl font-semibold">{block.title}</h2>}<Button asChild variant="outline"><a href={safeUrl} target="_blank" rel="noopener noreferrer">Xem video <ExternalLink /></a></Button></section>;
      }
      case "divider":
        return <hr className="border-border" key={block.id} />;
    }
  })}</div>;
}
