import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { pageMetadata } from "@/lib/seo/listing";

export const metadata: Metadata = pageMetadata("About", "BIM4C advances digital construction through BIM, data and collaboration.", ROUTES.about);

const values = [
  [
    "01",
    "Integrity",
    "Be transparent with data and accountable in every decision.",
  ],
  [
    "02",
    "Innovation",
    "Keep testing better technology and more effective ways of working.",
  ],
  [
    "03",
    "Collaboration",
    "Put people and multidisciplinary coordination at the centre.",
  ],
  [
    "04",
    "Sustainability",
    "Use today’s resources wisely to create long-term value.",
  ],
] as const;
const team = [
  ["Nguyễn Minh Anh", "BIM Director", "/images/news-bim-training.webp"],
  ["Trần Quốc Bảo", "Project Manager", "/images/news-site-safety.webp"],
  ["Lê Hoàng Nam", "Lead BIM Engineer", "/images/service-consulting.jpg"],
  ["Phạm Khánh Linh", "BIM Coordinator", "/images/service-design.jpg"],
] as const;

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="BIM4C"
        title="Technology that serves people"
        description="Advancing digital construction through BIM, data and a collaborative mindset."
        image="/images/service-consulting.jpg"
        variant="about"
      />

      <section className="border-y border-border bg-muted/45 py-8 lg:py-10">
        <div className="mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl grid-cols-2 gap-3 rounded-[2rem] border border-border/70 bg-card p-3 shadow-[0_24px_70px_-50px_rgba(7,31,39,.38)] md:w-[calc(100%_-_3rem)] md:grid-cols-4">
          {[
            ["25+", "Clients"],
            ["180+", "Projects"],
            ["120+", "Partners"],
            ["96%", "On-time delivery"],
          ].map(([value, label]) => (
            <article
              className="group flex min-h-36 flex-col items-center justify-center rounded-2xl px-4 py-6 text-center transition-colors duration-300 hover:bg-primary/8 md:min-h-40"
              key={label}
            >
              <strong className="whitespace-nowrap text-4xl font-semibold leading-none tracking-[-.06em] text-primary sm:text-5xl lg:text-6xl">
                {value}
              </strong>
              <span className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-foreground/70">
                {label}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl gap-12 py-20 md:w-[calc(100%_-_3rem)] lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <Badge variant="outline" className="mb-4">
            About BIM4C
          </Badge>
          <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
            Turn complexity into a clearer process.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We combine Building Information Modelling with AI, IoT and Digital
            Twin capabilities to improve design, construction and operations.
            Every solution starts with a real project goal.
          </p>
          <Button asChild className="mt-8 rounded-full">
            <Link href={ROUTES.services}>
              Explore our solutions <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/news-project-coordination.webp"
            alt="BIM4C team coordinating a construction project"
            fill
            sizes="(max-width:1023px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-muted/45 py-20 lg:py-28">
        <div className="site-container grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div
            className="relative aspect-[4/5] max-h-[620px] overflow-hidden rounded-3xl"
            data-motion="reveal"
          >
            <Image
              src="/images/news-bim-training.webp"
              alt="Ban lãnh đạo BIM4C chia sẻ định hướng phát triển"
              fill
              sizes="(max-width:1023px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="font-semibold">BIM4C leadership</p>
              <p className="mt-1 text-sm text-white/65">
                Creating value through knowledge and data
              </p>
            </div>
          </div>
          <div data-motion="reveal">
            <p className="eyebrow">A note from our director</p>
            <blockquote className="text-balance text-3xl font-semibold leading-[1.2] tracking-[-.04em] sm:text-4xl">
              “Digital transformation does not start with software. It starts
              with clearer ways of working and people who believe in the value
              of data.”
            </blockquote>
            <div className="mt-7 space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                BIM4C was founded to make BIM a practical capability for every
                construction organization — accessible, measurable and useful.
              </p>
              <p>
                We bring expertise, integrity and a continuous learning mindset
                so every project becomes a stronger foundation for tomorrow’s
                built environment.
              </p>
            </div>
            <div className="mt-8 border-t pt-6">
              <strong className="block text-lg">BIM4C Director</strong>
              <span className="text-sm text-muted-foreground">With respect</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-ink py-20 text-white lg:py-28">
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="site-container relative">
          <p className="eyebrow">Core values</p>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl">
            Four principles behind every decision.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-2">
            {values.map(([number, title, text]) => (
              <article
                className="group bg-brand-ink/90 p-7 transition-colors hover:bg-white/[.06] md:p-10"
                key={number}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    {number}
                  </span>
                  <span className="size-2 rounded-full bg-primary opacity-50 transition-transform group-hover:scale-150" />
                </div>
                <h3 className="mt-10 text-2xl font-semibold">{title}</h3>
                <p className="mt-3 max-w-md leading-7 text-zinc-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 md:w-[calc(100%_-_3rem)] lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-4">
              Mission & vision
            </Badge>
            <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
              A more transparent and sustainable built environment.
            </h2>
          </div>
          <div className="space-y-5">
            {[
              "Standardize data across the project lifecycle",
              "Equip teams with the right tools and skills",
              "Reduce waste, risk and environmental impact",
              "Build long-term partnerships around results",
            ].map((item) => (
              <p
                className="flex gap-3 border-b pb-5 text-base leading-7 text-muted-foreground"
                key={item}
              >
                <Check className="mt-1 size-5 shrink-0 text-primary" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section data-about-section="team" className="bg-muted/40 py-20 lg:py-28">
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl md:w-[calc(100%_-_3rem)]">
          <Badge variant="outline" className="mb-4">
            Our team
          </Badge>
          <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
            Specialists working toward one outcome.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(([name, role, image], index) => (
              <Card
                data-team-card
                className="group overflow-hidden rounded-3xl border-0 bg-brand-ink p-0 text-white shadow-xl shadow-brand-ink/10"
                key={name}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width:767px) 50vw, 25vw"
                    className="object-cover saturate-[.75] transition duration-700 group-hover:scale-105 group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-transparent" />
                  <span className="absolute right-5 top-5 text-xs font-semibold tracking-[.18em] text-white/60">
                    0{index + 1}
                  </span>
                </div>
                <CardHeader className="relative -mt-12 p-6 pt-0">
                  <CardTitle className="text-xl text-white">{name}</CardTitle>
                  <CardContent className="mt-2 border-t border-white/15 p-0 pt-3 text-sm text-primary">
                    {role}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Partners compact />

      <section className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 md:w-[calc(100%_-_3rem)] lg:py-28">
        <div className="rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.14em] opacity-75">
              Work with BIM4C
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-.04em]">
              Create measurable value on your next project.
            </h2>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 rounded-full lg:mt-0"
          >
            <Link href={ROUTES.contact}>
              Talk to an expert <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
