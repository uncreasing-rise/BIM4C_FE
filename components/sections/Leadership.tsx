import Image from "next/image";
import { governanceMembers } from "@/constants/site-content";

export function Leadership() {
  return <section className="people-showcase"><div className="page-shell">
    <header className="people-showcase-head"><div><p className="eyebrow">CON NGƯỜI BIM4C</p><h2>Hệ thống quản trị</h2></div><p>Một đội ngũ. Một định hướng.<br/>Một chuẩn mực chất lượng.</p></header>
    <div className="governance-gallery">{governanceMembers.map((item, index) => <article className="governance-card" key={item.title}><Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, 33vw"/><div className="governance-shade"/><span>0{index + 1}</span><div><p>{item.label}</p><h3>{item.title}</h3></div></article>)}</div>
  </div></section>;
}
