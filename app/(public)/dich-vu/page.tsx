import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listingMetadata, normalizedPageRedirect, type ListingSearchParams } from "@/lib/seo/listing";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";
import { getServices } from "@/features/services/api/queries";
import { ServiceExplorer } from "@/components/services/ServiceExplorer";

const description = "Các dịch vụ tư vấn BIM, thiết kế, đào tạo và giám sát của BIM4C.";
export async function generateMetadata({ searchParams }: { searchParams: Promise<ListingSearchParams> }): Promise<Metadata> { return listingMetadata("Dịch vụ", description, ROUTES.services, await searchParams); }

export default async function ServicesPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  const services = await getServices();
  const destination = normalizedPageRedirect(ROUTES.services, await searchParams, services.length, 4); if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="Năng lực BIM4C"
        title="Giải pháp cho toàn bộ vòng đời công trình"
        description="Từ chiến lược, thiết kế và phối hợp đến bàn giao dữ liệu — mỗi giải pháp được thiết kế quanh kết quả thực tế."
        image="/images/service-design.jpg"
      />
      <ServiceExplorer services={services} />
      <section className="bg-brand-ink py-20 text-white">
        <div className="site-container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Bắt đầu cùng BIM4C</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-.04em]">
              Biến thách thức dự án thành một lộ trình rõ ràng.
            </h2>
          </div>
          <Button asChild size="lg" className="w-fit rounded-full">
            <Link href={ROUTES.contact}>
              Trao đổi với chuyên gia <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
