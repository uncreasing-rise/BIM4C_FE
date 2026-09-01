import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

export function Company({ services }: { services: ContentEntry[] }) {
  return (
    <>
      {/* Services */}
      <section className="home-section bg-white" id="services">
        <div className="home-container">
          <div className="mx-auto mb-14 max-w-[680px] text-center">
            <p className="mb-3 text-sm font-semibold text-[#09a7a5]">
              Giải pháp cho khách hàng
            </p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-semibold tracking-[-0.035em] text-slate-900">
              Năng lực BIM toàn diện
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-slate-600">
              Từ chiến lược triển khai đến phối hợp mô hình và bàn giao dữ liệu,
              mỗi dịch vụ được thiết kế theo mục tiêu thực tế của dự án.
            </p>
          </div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((item, index) => (
              <article key={item.slug} className="group bg-white">
                <Link href={ROUTES.serviceDetail(item.slug)}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/5" />
                  </div>
                  <div className="min-h-[210px] p-6">
                    <span className="text-sm font-medium text-[#09a7a5]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                    <span className="mt-5 inline-block text-sm font-semibold text-[#09a7a5] transition-transform group-hover:translate-x-0.5">
                      Tìm hiểu thêm ↗
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={ROUTES.services}
              className="btn-enterprise-outline !rounded-none"
            >
              Xem tất cả dịch vụ
            </Link>
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="home-section bg-slate-950 text-white" id="about">
        <div className="home-container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/news-project-coordination.webp"
              alt="Đội ngũ BIM4C phối hợp mô hình tại công trường"
              fill
              sizes="(max-width:1023px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-[#09a7a5]">
              Về chúng tôi
            </p>
            <h2 className="text-[clamp(32px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.035em]">
              Đồng hành cùng dự án bằng dữ liệu và quy trình
            </h2>
            <p className="mt-6 text-[16px] leading-8 text-slate-300">
              BIM4C kết nối con người, mô hình và dữ liệu để hỗ trợ các bên ra
              quyết định chính xác hơn trong suốt vòng đời công trình.
            </p>

            <div className="mt-10 grid grid-cols-3 border-y border-slate-700/80 py-7">
              <div>
                <strong className="text-2xl font-medium text-[#09a7a5]">
                  3D–7D
                </strong>
                <span className="mt-1 block text-xs text-slate-400">
                  Phạm vi BIM
                </span>
              </div>
              <div>
                <strong className="text-2xl font-medium text-[#09a7a5]">
                  CDE
                </strong>
                <span className="mt-1 block text-xs text-slate-400">
                  Dữ liệu tập trung
                </span>
              </div>
              <div>
                <strong className="text-2xl font-medium text-[#09a7a5]">
                  ISO 19650
                </strong>
                <span className="mt-1 block text-xs text-slate-400">
                  Định hướng quy trình
                </span>
              </div>
            </div>

            <Link
              href={ROUTES.about}
              className="mt-8 inline-flex border-b border-[#09a7a5] pb-1 text-sm font-semibold text-[#09a7a5] transition-colors hover:text-white"
            >
              Tìm hiểu về BIM4C →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}