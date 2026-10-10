import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  filterParam,
  normalizedPageRedirect,
  parsePage,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { pageMeta } from "@/lib/seo/page-meta";
import { getRequestLocale } from "@/lib/i18n/request";
import { ROUTES } from "@/constants/routes";
import { getServicesPage } from "@/features/services/api/queries";
import { ServicesPageView } from "@/components/services/ServicesPageView";
import { PAGE_SIZE } from "@/lib/seo/page-param";
import { localizedPath } from "@/lib/seo/site";


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  const { title, description } = pageMeta("services", await getRequestLocale());
  return await listingMetadata(
    title,
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
    page: parsePage(params.page),
    limit: PAGE_SIZE.services,
    search: filterParam(params.q),
    category:
      filterParam(params.category),
  });

  const destination = normalizedPageRedirect(
    localizedPath(ROUTES.services, await getRequestLocale()),
    params,
    servicesPage.meta.total,
    PAGE_SIZE.services,
  );
  if (destination) redirect(destination);

  return (
    <ServicesPageView
      services={servicesPage.items}
      meta={servicesPage.meta}
    />
  );
}
