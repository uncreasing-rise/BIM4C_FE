import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle2,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { Partners } from "@/components/sections/Partners";

const capabilities = [
  {
    icon: ScanLine,
    title: "Precise coordination",
    text: "Find conflicts early and bring every discipline into one reliable source of truth.",
  },
  {
    icon: Boxes,
    title: "Connected delivery",
    text: "Connect design, construction and operations through one consistent BIM workflow.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Decisions from data",
    text: "Track progress, cost and quality with information your team can act on.",
  },
] as const;

export default async function Home() {
  const [projects, services, posts] = await Promise.all([
    getProjects(),
    getServices(),
    getPosts({ limit: 3 }),
  ]);
  return (
    <main>
      <section
        data-home-section="hero"
        className="relative isolate min-h-svh overflow-hidden bg-brand-ink text-white"
      >
        <Image
          data-motion="parallax"
          src="/images/news-project-coordination.webp"
          alt="BIM4C team coordinating a construction project"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,24,31,.98)_0%,rgba(4,24,31,.84)_53%,rgba(4,24,31,.3)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="site-container grid min-w-0 min-h-svh items-end gap-12 py-16 pt-28 md:items-center md:py-24 md:pt-28 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 max-w-4xl" data-motion="hero">
            <Badge className="mb-6 rounded-full border-white/15 bg-white/10 px-4 py-1.5 text-white backdrop-blur-md">
              BIM · VDC · DIGITAL TWIN
            </Badge>
            <h1 className="text-balance text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-7xl lg:text-[5.5rem]">
              Build with clarity{" "}
              <span className="text-primary">through better data.</span>
            </h1>
            <p className="mt-7 max-w-2xl break-words border-l border-primary pl-5 text-base leading-7 text-zinc-300 sm:text-lg">
              BIM4C connects people, processes and digital models so every
              project can be delivered with greater certainty and efficiency.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href={ROUTES.contact}>
                  Start a conversation <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white"
              >
                <Link href={ROUTES.projects}>Explore our work</Link>
              </Button>
            </div>
          </div>
          <div
            className="hidden self-end rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl lg:block"
            data-motion="hero"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 />
              </span>
              <div>
                <p className="text-xs text-zinc-400">Project in delivery</p>
                <p className="font-semibold">LUMIÈRE Riverside</p>
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-primary" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-zinc-400">
              <span>Coordination progress</span>
              <strong className="text-white">82%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card" aria-label="BIM4C at a glance">
        <div className="site-container grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {[
            ["25+", "Clients"],
            ["180+", "Projects"],
            ["120+", "Partners"],
            ["96%", "On-time delivery"],
          ].map(([value, label]) => (
            <div className="px-4 py-7 text-center sm:px-6 sm:py-9" key={label}>
              <strong className="block text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{value}</strong>
              <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        data-home-section="capabilities"
        className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 md:w-[calc(100%_-_3rem)] lg:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div data-motion="reveal">
            <p className="eyebrow">Core capabilities</p>
            <h2 className="display-title">From models to measurable value.</h2>
          </div>
          <p
            className="max-w-2xl text-lg leading-8 text-muted-foreground"
            data-motion="reveal"
          >
            We design BIM workflows around your business goals, team and level
            of digital readiness.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, text }, index) => (
            <Card
              key={title}
              className="group border-0 bg-white p-2 shadow-[0_16px_50px_-30px_rgba(15,23,42,.3)] ring-1 ring-black/5 transition-transform hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <CardTitle className="mt-6 text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent className="leading-7 text-muted-foreground">
                {text}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        data-home-section="services"
        className="bg-brand-ink py-16 text-white lg:flex lg:min-h-svh lg:items-center lg:py-12"
      >
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl md:w-[calc(100%_-_3rem)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="mb-4 bg-white/10 text-white">Solutions</Badge>
              <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
                Support across the full project lifecycle.
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-fit border-zinc-700 bg-transparent text-white"
            >
              <Link href={ROUTES.services}>
                View all solutions <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10 lg:mt-9">
            {services.slice(0, 3).map((item, index) => (
              <article
                className="group relative grid gap-4 py-6 md:grid-cols-[3rem_.55fr_1fr_2rem] md:items-start md:gap-7 lg:py-6"
                key={item.slug}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="1px"
                  className="hidden"
                />
                <span className="text-xs font-semibold tracking-[.16em] text-primary">
                  0{index + 1}
                </span>
                <h3 className="text-2xl font-semibold tracking-[-.025em] md:text-3xl">
                  {item.title}
                </h3>
                <div>
                  <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    {item.sections[0]?.body || item.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                    {item.highlights.slice(0, 3).map((highlight) => (
                      <li
                        className="flex items-center gap-2 text-xs font-medium text-zinc-300 before:size-1 before:rounded-full before:bg-primary"
                        key={highlight}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="grid size-9 place-items-center rounded-full border border-white/15 transition-all group-hover:border-primary group-hover:bg-primary">
                  <ArrowRight className="size-4" />
                </span>
                <Link
                  className="absolute inset-0"
                  href={ROUTES.serviceDetail(item.slug)}
                  aria-label={`View ${item.title}`}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-home-section="projects"
        className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 md:w-[calc(100%_-_3rem)] lg:py-28"
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <Badge variant="outline" className="mb-4">
              Projects
            </Badge>
            <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
              Capability, proven in the field.
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={ROUTES.projects}>
              View all projects <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          {projects.slice(0, 3).map((item, index) => (
            <article
              key={item.slug}
              className={
                index === 0
                  ? "group relative min-h-[38rem] overflow-hidden rounded-3xl lg:row-span-2"
                  : "group grid overflow-hidden rounded-3xl border bg-card sm:grid-cols-[.9fr_1.1fr] lg:min-h-[18.5rem]"
              }
            >
              <div
                className={
                  index === 0
                    ? "absolute inset-0"
                    : "relative min-h-56 overflow-hidden sm:min-h-0"
                }
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={
                    index === 0
                      ? "(max-width:1023px) 100vw, 60vw"
                      : "(max-width:1023px) 100vw, 30vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {index === 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
              )}
              <div
                className={
                  index === 0
                    ? "absolute inset-x-0 bottom-0 p-7 text-white md:p-10"
                    : "relative flex flex-col p-6"
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    className={
                      index === 0
                        ? "border-white/15 bg-white/10 text-white"
                        : "w-fit"
                    }
                  >
                    {item.category}
                  </Badge>
                  <span
                    className={
                      index === 0
                        ? "text-xs text-white/60"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {item.year}
                  </span>
                </div>
                <h3
                  className={
                    index === 0
                      ? "mt-5 max-w-2xl text-4xl font-semibold tracking-[-.04em] md:text-5xl"
                      : "mt-4 text-xl font-semibold leading-snug"
                  }
                >
                  {item.title}
                </h3>
                <p
                  className={
                    index === 0
                      ? "mt-4 max-w-xl leading-7 text-zinc-300"
                      : "mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground"
                  }
                >
                  {item.description}
                </p>
                <div
                  className={
                    index === 0 ? "mt-7 flex flex-wrap gap-2" : "mt-auto pt-5"
                  }
                >
                  {index === 0 ? (
                    item.highlights.slice(0, 3).map((highlight) => (
                      <span
                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs"
                        key={highlight}
                      >
                        {highlight}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      View case study{" "}
                      <ArrowRight className="ml-1 inline size-4" />
                    </span>
                  )}
                </div>
                <Link
                  className="absolute inset-0"
                  href={ROUTES.projectDetail(item.slug)}
                  aria-label={`Explore ${item.title}`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <Partners />

      <section
        data-home-section="news"
        className="border-y bg-muted/40 py-16 lg:py-20"
      >
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl md:w-[calc(100%_-_3rem)]">
          <Badge variant="outline" className="mb-4">
            BIM Insights
          </Badge>
          <h2 className="text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
            Latest insights.
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {posts.map((item, index) => (
              <article
                key={item.slug}
                className={
                  index === 0
                    ? "group relative grid gap-8 border-y py-8 md:col-span-2 lg:grid-cols-[.8fr_1.2fr] lg:items-center"
                    : "group relative border-b py-7"
                }
              >
                <div
                  className={
                    index === 0
                      ? "relative order-2 min-h-64 overflow-hidden rounded-2xl lg:min-h-[22rem]"
                      : "hidden"
                  }
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes={
                      index === 0
                        ? "(max-width:1023px) 100vw, 58vw"
                        : "(max-width:767px) 100vw, 50vw"
                    }
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {index === 0 && (
                    <Badge className="absolute left-5 top-5 border-white/20 bg-black/35 text-white backdrop-blur">
                      Featured story
                    </Badge>
                  )}
                </div>
                <div
                  className={
                    index === 0
                      ? "relative order-1 flex min-w-0 flex-col justify-center"
                      : "relative flex min-w-0 flex-col"
                  }
                >
                  <div className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
                    {item.eyebrow}{" "}
                    <span className="text-muted-foreground">· {item.meta}</span>
                  </div>
                  <h3
                    className={
                      index === 0
                        ? "mt-4 text-3xl font-semibold leading-[1.12] tracking-[-.045em] transition-colors group-hover:text-primary lg:text-4xl"
                        : "mt-3 text-xl font-semibold leading-snug tracking-[-.025em] transition-colors group-hover:text-primary md:text-2xl"
                    }
                  >
                    {item.title}
                  </h3>
                  <p
                    className={
                      index === 0
                        ? "mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-muted-foreground"
                        : "mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground"
                    }
                  >
                    {item.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      Read article
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                  <Link
                    className="absolute inset-0"
                    href={ROUTES.blogDetail(item.slug)}
                    aria-label={`Read ${item.title}`}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-home-section="cta"
        className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 md:w-[calc(100%_-_3rem)] lg:py-28"
      >
        <div className="overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.14em] opacity-75">
              Ready to move forward?
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-.04em]">
              Turn project data into a competitive advantage.
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
