import Image from "next/image";
import type { StrategicPartner } from "@/features/homepage/types";

export function Partners({ partners }: { partners: StrategicPartner[] }) {
  if (!partners.length) return null;
  return <section className="apple-partner-section" id="partners"><header><p className="apple-kicker">Khách hàng &amp; đối tác</p><h2>Cùng xây dựng những công trình lớn.</h2><p>Niềm tin được tạo nên qua từng dự án.</p></header><div className="apple-partner-marquee"><div className="apple-partner-track">{[...partners, ...partners].map((partner, index) => <figure aria-hidden={index >= partners.length} key={`${partner.id ?? partner.name}-${index}`}><Image src={partner.logo} alt={index < partners.length ? partner.name : ""} width={180} height={72} /></figure>)}</div></div></section>;
}
