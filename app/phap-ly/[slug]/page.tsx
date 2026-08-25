import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import { getLegalDocument, legalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";

export function generateStaticParams() {
  return legalDocuments.map(({slug}) => ({slug}));
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const document=getLegalDocument((await params).slug);
  return document ? {title:`${document.title} | BIM4C`,description:document.summary} : {};
}

export default async function LegalDetailPage({params}:{params:Promise<{slug:string}>}) {
  const document=getLegalDocument((await params).slug);
  if(!document) notFound();
  return <>
    <PageHero eyebrow="PHÁP LÝ BIM4C" title={document.title} description={document.summary} image="/images/about.jpg"/>
    <article className="legal-document"><div className="page-shell legal-document-layout">
      <aside><p>CẬP NHẬT</p><strong>{document.updatedAt}</strong><nav aria-label="Mục lục">{document.sections.map((section,index)=><a key={section.title} href={`#legal-section-${index+1}`}><span>{String(index+1).padStart(2,"0")}</span>{section.title}</a>)}</nav></aside>
      <main>{document.sections.map((section,index)=><section id={`legal-section-${index+1}`} key={section.title}><span>{String(index+1).padStart(2,"0")}</span><div><h2>{section.title}</h2>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.items&&<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>}</div></section>)}</main>
    </div><div className="page-shell legal-back"><Link href={ROUTES.legal}>← Tất cả thông tin pháp lý</Link></div></article>
  </>;
}
