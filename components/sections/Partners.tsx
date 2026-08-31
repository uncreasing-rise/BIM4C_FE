import Image from "next/image";
import type { StrategicPartner } from "@/features/homepage/types";
import { HomepageSectionHeader } from "./HomepageSectionHeader";

function PartnerSet({ partners, duplicate = false }: { partners: StrategicPartner[]; duplicate?: boolean }) {
  return <div className="flex shrink-0 gap-4 pr-4" aria-hidden={duplicate || undefined}>
    {partners.map((partner) => <div className="group flex h-24 w-[clamp(180px,70vw,260px)] shrink-0 items-center justify-center border border-[#dbe7e5] bg-white p-5 shadow-[0_6px_20px_rgb(6_63_70_/_5%)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#09a7a5]/60 hover:shadow-[0_12px_28px_rgb(6_63_70_/_10%)] sm:w-[calc((100cqw-16px)/2)] lg:w-[calc((100cqw-48px)/4)]" key={partner.id ?? partner.name}>
      <Image className="max-h-12 w-auto max-w-full object-contain opacity-85 transition-opacity duration-300 group-hover:opacity-100" src={partner.logo} alt={duplicate ? "" : partner.name} width={190} height={72}/>
    </div>)}
  </div>;
}

export function Partners({ partners }: { partners: StrategicPartner[] }) {
  if (partners.length === 0) return null;

  return <section className="home-section relative overflow-hidden bg-white" id="partners">
    <div className="pointer-events-none absolute -right-20 top-8 size-64 rotate-45 border border-[#09a7a5]/15" aria-hidden="true"/>
    <div className="pointer-events-none absolute -left-24 bottom-0 h-28 w-[38%] -skew-x-[24deg] bg-[#eaf8f7]/80" aria-hidden="true"/>
    <div className="home-container relative z-10">
      <HomepageSectionHeader title="ĐỐI TÁC CHIẾN LƯỢC"/>
      <div className="@container overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]" aria-label="Danh sách đối tác chiến lược">
        <div className="flex w-max motion-safe:animate-[partner-marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
          <PartnerSet partners={partners}/>
          <PartnerSet partners={partners} duplicate/>
        </div>
      </div>
    </div>
  </section>;
}
