import type { Metadata } from "next";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";

export const metadata: Metadata = pageMetadata("Nhận tư vấn", "Trao đổi cùng chuyên gia BIM4C về nhu cầu tư vấn, triển khai BIM, đào tạo và chuyển đổi số xây dựng.", ROUTES.contact);

export default function ContactPage() {
  return (
    <main>
      <ConsultationSection />
    </main>
  );
}
