import { serializeJsonLd } from "@/lib/seo/json-ld";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  const json = serializeJsonLd(data);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
