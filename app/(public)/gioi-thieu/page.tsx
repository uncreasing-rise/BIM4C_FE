import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  Layers3,
  Users,
  Leaf,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { ExpertiseStrip } from "@/components/sections/ExpertiseStrip";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { pageMetadata } from "@/lib/seo/listing";

export const metadata: Metadata = pageMetadata(
  "About",
  "Meet BIM4C: connecting construction expertise, BIM workflows and project information.",
  ROUTES.about,
);
const values = [
  {
    icon: Compass,
    title: "Integrity",
    text: "Clear responsibilities, transparent information and accountable decisions.",
  },
  {
    icon: Layers3,
    title: "Innovation",
    text: "Practical tools and better workflows that address real project needs.",
  },
  {
    icon: Users,
    title: "Collaboration",
    text: "Connected disciplines working from a shared understanding of the project.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    text: "Thoughtful use of resources and information that remains useful over time.",
  },
];
const team = [
  ["Nguyễn Minh Anh", "BIM Director"],
  ["Trần Quốc Bảo", "Project Manager"],
  ["Lê Hoàng Nam", "Lead BIM Engineer"],
  ["Phạm Khánh Linh", "BIM Coordinator"],
] as const;

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About BIM4C"
        title="Construction expertise. Connected by BIM."
        description="We bring people, processes and project information together to support better design, construction and operations."
        image="/images/news-project-coordination.webp"
        variant="about"
      />
      <ExpertiseStrip />
      <section className="py-12 lg:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="section-title">
              A practical partner for digital construction.
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              BIM4C combines construction knowledge with Building Information
              Modelling, coordination and information management. We help
              project owners, consultants and contractors make BIM useful in
              their everyday work.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Our work spans consulting, multidisciplinary design, model
              coordination, training and digital handover. Every engagement
              starts with the project goal and the people responsible for
              delivering it.
            </p>
            <ul className="mt-5 grid gap-3 border-t pt-5">
              {[
                "A scope matched to your project stage",
                "Workflows your team can use and maintain",
                "Information prepared for its next purpose",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 rounded-lg">
              <Link href={ROUTES.services}>
                Explore our expertise <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <figure className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/news-project-coordination.webp"
              alt="Construction professionals reviewing project information together"
              width={900}
              height={680}
              sizes="(max-width:1023px) 100vw, 50vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink to-transparent px-6 pb-5 pt-12 text-sm text-white">
              Better coordination starts with a shared understanding.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="technical-grid bg-brand-ink py-12 text-white lg:py-16">
        <div className="site-container">
          <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">What guides us</p>
              <h2 className="section-title">
                Principles you can see in the work.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              Technology serves the project when responsibilities, information
              and decisions are clear.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-xl border border-white/15 bg-white/[.04] p-5"
              >
                <Icon className="size-6 text-teal-300" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-12">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/news-bim-training.webp"
              alt="A team learning through a project review"
              width={800}
              height={600}
              sizes="(max-width:1023px) 100vw, 40vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">People &amp; knowledge</p>
            <h2 className="section-title">Better tools need capable teams.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Lasting improvement comes from people who understand the workflow
              and can keep developing it. We connect project delivery with
              practical learning, feedback and knowledge transfer.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {team.map(([name, role]) => (
                <article
                  key={name}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground"
                  >
                    {name
                      .split(" ")
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <DeliveryProcess />
      <Partners compact />
      <section className="py-12 lg:py-16">
        <div className="site-container flex flex-col items-start justify-between gap-5 rounded-xl md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Work with BIM4C</p>
            <h2 className="section-title">
              A clearer path for your next project.
            </h2>
          </div>
          <Button asChild size="lg" className="rounded-lg">
            <Link href={ROUTES.contact}>
              Discuss your project <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
