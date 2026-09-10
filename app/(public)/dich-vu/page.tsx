import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";
import { getServicesPage } from "@/features/services/api/queries";
import { ServiceExplorer } from "@/components/services/ServiceExplorer";
import { ServiceGuide } from "@/components/services/ServiceGuide";
import { ServiceFaq } from "@/components/services/ServiceFaq";

const description =
  "BIM consulting, design, training and construction advisory solutions from BIM4C.";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return listingMetadata(
    "Solutions",
    description,
    ROUTES.services,
    await searchParams,
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const servicesPage = await getServicesPage({
    page: Number(params.page ?? 1),
    limit: 6,
    search: typeof params.q === "string" ? params.q : undefined,
    category:
      typeof params.category === "string" && params.category !== "All"
        ? params.category
        : undefined,
  });
  const destination = normalizedPageRedirect(
    ROUTES.services,
    params,
    servicesPage.meta.total,
    6,
  );
  if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C capabilities"
        title="Solutions for the full project lifecycle"
        description="From strategy and design coordination to digital handover, every solution is built around a measurable outcome."
        image="/images/news-digital-twin.webp"
      />
      <ServiceGuide
        services={servicesPage.items.map(({ slug, title }) => ({
          slug,
          title,
        }))}
      />
      <ServiceExplorer services={servicesPage.items} meta={servicesPage.meta} />
      <ServiceFaq />
      <section className="bg-brand-ink py-20 text-white">
        <div className="site-container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Start with BIM4C</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-.04em]">
              Turn project challenges into a clear delivery roadmap.
            </h2>
          </div>
          <Button asChild size="lg" className="w-fit rounded-full">
            <Link href={ROUTES.contact}>
              Talk to an expert <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
