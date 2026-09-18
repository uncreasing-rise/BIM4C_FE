import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { getServicesPage } from "@/features/services/api/queries";
import { ServicesPageView } from "@/components/services/ServicesPageView";

const description =
  "BIM consulting, design, training and construction advisory solutions from BIM4C.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return await listingMetadata(
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
    <ServicesPageView
      services={servicesPage.items}
      meta={servicesPage.meta}
    />
  );
}
