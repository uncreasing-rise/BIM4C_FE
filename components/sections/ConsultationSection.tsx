import { CheckCircle2, Clock3, Mail, Phone } from "lucide-react";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";

const commitments = [
  "Trao đổi trực tiếp cùng chuyên gia BIM",
  "Đề xuất theo đúng quy mô và giai đoạn dự án",
  "Bảo mật thông tin doanh nghiệp",
] as const;

export function ConsultationSection() {
  return (
    <section
      id="contact"
      data-consultation
      className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-brand-ink pb-20 pt-32 text-white lg:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute -left-40 top-1/2 size-96 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -top-48 size-[32rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="site-container relative grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
        <div data-consultation-copy className="lg:sticky lg:top-28">
          <p className="eyebrow">Nhận tư vấn</p>
          <h2 className="max-w-xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            Bắt đầu bằng một cuộc trao đổi rõ ràng.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
            Chia sẻ bài toán của bạn. BIM4C sẽ cùng phân tích nhu cầu, phạm vi
            và lộ trình triển khai phù hợp.
          </p>

          <ul className="mt-9 grid gap-4 border-t border-white/10 pt-7">
            {commitments.map((item) => (
              <li
                className="flex items-center gap-3 text-sm text-white/75"
                key={item}
              >
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <a
              className="flex items-center gap-2 text-white/70 transition hover:text-white"
              href="tel:+842873004068"
            >
              <Phone className="size-4 text-primary" /> +84 28 7300 4068
            </a>
            <a
              className="flex items-center gap-2 text-white/70 transition hover:text-white"
              href={ROUTES.contactEmail}
            >
              <Mail className="size-4 text-primary" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div
          data-consultation-form
          className="rounded-[2rem] border border-white/12 bg-white/[.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <div className="mb-7 flex items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <p className="text-xl font-semibold">Thông tin tư vấn</p>
              <p className="mt-2 text-sm text-white/50">
                Các trường có dấu * là bắt buộc.
              </p>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:flex">
              <Clock3 className="size-3.5" /> Phản hồi sớm
            </span>
          </div>
          <ConsultationForm />
        </div>
      </div>
    </section>
  );
}
