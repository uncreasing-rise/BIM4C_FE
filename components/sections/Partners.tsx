import Image from "next/image";
import type { StrategicPartner } from "@/features/homepage/types";

function PartnerSet({ partners,duplicate = false }: { partners:StrategicPartner[];duplicate?: boolean }) {
  return <div className="partner-set" aria-hidden={duplicate || undefined}>
    {partners.map((partner) => <div className="partner-card" key={partner.id??partner.name}>
      <Image src={partner.logo} alt={duplicate ? "" : partner.name} width={180} height={72}/>
    </div>)}
  </div>;
}

export function Partners({partners}:{partners:StrategicPartner[]}) {
  return <section className="partners section" id="partners">
    <div className="container partner-heading"><p className="partner-eyebrow">ĐỒNG HÀNH CÙNG BIM4C</p><h2>ĐỐI TÁC CHIẾN LƯỢC</h2><span className="partner-rule"/><p className="partner-description">Sự tin tưởng của khách hàng và đối tác là nền tảng cho mọi thành công của BIM4C.</p></div>
    <div className="partner-marquee" aria-label="Danh sách đối tác chiến lược">
      <div className="partner-track"><PartnerSet partners={partners}/><PartnerSet partners={partners} duplicate/></div>
    </div>
  </section>;
}
