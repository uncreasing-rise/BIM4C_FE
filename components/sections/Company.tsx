import Image from "next/image";
import Link from "next/link";
import { companyStats } from "@/constants/site-content";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

export function Company({ services }: { services: ContentEntry[] }) {
  return <section className="company" id="about"><div className="company-overview">
    <div className="company-intro container">
      <p className="eyebrow">CÔNG TY CỔ PHẦN BIM4C</p>
      <h2>NHÀ THẦU XÂY DỰNG UY TÍN<br/>HÀNG ĐẦU VIỆT NAM</h2>
      <p className="description">Với nền tảng kỹ thuật vững chắc và đội ngũ chuyên gia giàu kinh nghiệm, BIM4C mang đến những giải pháp xây dựng tối ưu, bảo đảm an toàn, chất lượng và tiến độ cho mọi công trình.</p>
      <Link href={ROUTES.about}>XEM THÊM <span>→</span></Link>
      <div className="company-stats">{companyStats.map((item) => <div key={item.label}><Icon name={item.icon}/><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
    </div>
    <div className="business company-business container" id="services">
      <p className="eyebrow">NĂNG LỰC BIM4C</p>
      <div className="business-grid">{services.map((item) => <article key={item.title}><Link className="card-link" href={ROUTES.serviceDetail(item.slug)} aria-label={`Xem ${item.title}`}/><Image src={item.image} alt="" fill sizes="(max-width: 767px) 50vw, 20vw"/><div/><h3>{item.title}</h3></article>)}<article><Image src="/images/about.jpg" alt="" fill sizes="(max-width: 767px) 50vw, 20vw"/><div/><h3>Đầu tư</h3></article></div>
    </div>
  </div></section>;
}
