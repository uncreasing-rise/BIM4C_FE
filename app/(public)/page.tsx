import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Layers3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, CONTACT_EMAIL } from "@/constants/routes";
import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { Partners } from "@/components/sections/Partners";
import { ExpertiseStrip } from "@/components/sections/ExpertiseStrip";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";

export default async function Home() {
  const [projects, services, posts, courses] = await Promise.all([
    getProjects(),
    getServices(),
    getPosts({ limit: 3 }),
    getCourses(),
  ]);
  const featured =
    projects.find((project) => project.category === "High-rise") ?? projects[0];
  return (
    <main>
      <section
        data-home-section="hero"
        className="technical-grid relative overflow-hidden bg-brand-ink text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 size-[40rem] rounded-full bg-teal-500/10 blur-[100px]"
        />
        <div className="site-container relative grid items-center gap-10 pb-10 pt-28 md:pb-14 md:pt-32 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-teal-200">
              <span className="size-2 rounded-full bg-teal-300" />
              BIM consulting &amp; digital delivery
            </p>
            <h1 className="max-w-xl text-balance text-[clamp(2.6rem,4.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-.045em]">
              Build better.
              <br />
              <span className="text-teal-300">Together, through BIM.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              We help owners, designers and contractors coordinate models,
              resolve complexity and turn project information into confident
              decisions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-lg">
                <Link href={ROUTES.contact}>
                  Discuss your project <ArrowUpRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={ROUTES.projects}>Explore our work</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-slate-300">
              {[
                "BIM strategy",
                "Multidisciplinary coordination",
                "Digital handover",
              ].map((label) => (
                <span key={label} className="flex items-center gap-2">
                  <Check className="size-3.5 text-teal-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-w-0">
            <div
              className="absolute -left-4 -top-4 hidden h-20 w-20 border-l border-t border-teal-300/40 lg:block"
              aria-hidden="true"
            />
            <article className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <div className="relative aspect-[16/10] sm:aspect-[16/11]">
                <Image
                  src={featured?.image ?? "/images/news-digital-twin.webp"}
                  alt={
                    featured
                      ? featured.title
                      : "Coordinating construction models"
                  }
                  fill
                  priority
                  sizes="(max-width:1023px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md border border-white/25 bg-brand-ink/80 px-3 py-2 text-xs font-medium text-white backdrop-blur">
                  <Layers3 className="size-4 text-teal-300" />
                  Project experience
                </span>
                <span className="absolute bottom-4 left-4 font-mono text-[11px] tracking-wider text-white/85">
                  MODEL. COORDINATE. DELIVER.
                </span>
              </div>
              <div className="flex items-center justify-between gap-5 p-5">
                <div className="min-w-0">
                  <p className="text-xs text-teal-200">
                    {featured?.category ?? "BIM4C expertise"}
                    {featured?.location ? " · " + featured.location : ""}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug">
                    {featured?.title ?? "Connected project delivery"}
                  </h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
              <Link
                href={
                  featured
                    ? ROUTES.projectDetail(featured.slug)
                    : ROUTES.projects
                }
                className="absolute inset-0"
                aria-label={
                  featured ? "Explore " + featured.title : "Explore projects"
                }
              />
            </article>
            <p className="mt-3 text-right text-xs text-slate-400">
              From project information to practical decisions.
            </p>
          </div>
        </div>
      </section>

      <ExpertiseStrip />

      <section
        id="services"
        data-home-section="services"
        className="py-14 lg:py-16"
      >
        <div className="site-container">
          <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Our expertise</p>
              <h2 className="section-title">
                The right support.
                <br />
                At every project stage.
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-sm leading-7 text-muted-foreground">
                Define your BIM strategy, connect your disciplines and equip
                your team with information they can use.
              </p>
              <Link
                href={ROUTES.services}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                All solutions <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </header>
          <div className="grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((service, index) => (
              <article
                key={service.slug}
                className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-muted">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(max-width:767px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-brand-ink/85 px-3 py-1.5 font-mono text-xs text-white">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    <Link
                      className="after:absolute after:inset-0"
                      href={ROUTES.serviceDetail(service.slug)}
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground md:line-clamp-none">
                    {service.description}
                  </p>
                  <ul className="mt-4 hidden space-y-2 border-t pt-4 md:block">
                    {service.highlights.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 flex items-center justify-between text-sm font-semibold text-primary">
                    Explore solution <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
          {services.length > 3 && (
            <div className="mt-5 grid divide-y rounded-xl border bg-muted/50 md:grid-cols-3 md:divide-x md:divide-y-0">
              {services.slice(3, 6).map((service) => (
                <Link
                  href={ROUTES.serviceDetail(service.slug)}
                  key={service.slug}
                  className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  {service.title}
                  <ArrowRight className="size-4 shrink-0 text-primary" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="projects"
        data-home-section="projects"
        className="bg-brand-ink py-14 text-white lg:py-16"
      >
        <div className="site-container">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Selected experience</p>
              <h2 className="section-title">
                Real projects. Connected expertise.
              </h2>
            </div>
            <Link
              href={ROUTES.projects}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-teal-200"
            >
              All projects <ArrowUpRight className="size-4" />
            </Link>
          </header>
          <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            {projects.slice(0, 3).map((project, index) => (
              <article
                key={project.slug}
                className={
                  index === 0
                    ? "group relative overflow-hidden rounded-xl border border-white/15 lg:row-span-2"
                    : "group relative grid overflow-hidden rounded-xl border border-white/15 bg-white/5 sm:grid-cols-[.85fr_1.15fr]"
                }
              >
                <div
                  className={
                    index === 0
                      ? "relative aspect-[16/10] min-h-64 lg:absolute lg:inset-0 lg:aspect-auto"
                      : "relative aspect-[16/9] sm:aspect-auto sm:min-h-52"
                  }
                >
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes={
                      index === 0
                        ? "(max-width:1023px) 100vw, 55vw"
                        : "(max-width:639px) 100vw, 25vw"
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                {index === 0 && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/10 to-transparent" />
                )}
                <div
                  className={
                    index === 0
                      ? "relative p-6 lg:flex lg:min-h-[29rem] lg:flex-col lg:justify-end lg:p-8"
                      : "p-5"
                  }
                >
                  <p className="text-xs font-medium text-teal-200">
                    {project.category} · {project.year}
                  </p>
                  <h3
                    className={
                      index === 0
                        ? "mt-2 max-w-lg text-3xl font-semibold leading-tight tracking-tight"
                        : "mt-2 text-xl font-semibold leading-snug"
                    }
                  >
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {index === 0 ? project.description : project.location}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/20 pt-4 text-xs">
                    <span className="text-slate-300">{project.status}</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-teal-200">
                      View project <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>
                <Link
                  className="absolute inset-0"
                  href={ROUTES.projectDetail(project.slug)}
                  aria-label={"Explore " + project.title}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <DeliveryProcess />

      <section data-home-section="academy" className="py-14 lg:py-16">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[.85fr_1.15fr]">
            <div className="relative min-h-64 lg:min-h-96">
              <Image
                src="/images/news-bim-training.webp"
                alt="A team reviewing BIM project work together"
                fill
                sizes="(max-width:1023px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-6 text-sm font-medium text-white">
                Learn with project data. Apply it at work.
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <p className="eyebrow">BIM4C Academy</p>
              <h2 className="section-title">
                Build your team’s next capability.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Practical programmes for engineers, coordinators and managers,
                with guided exercises and feedback.
              </p>
              <div className="mt-5 divide-y border-y">
                {courses.slice(0, 3).map((course) => (
                  <Link
                    key={course.slug}
                    href={ROUTES.courseDetail(course.slug)}
                    className="flex min-h-16 items-center justify-between gap-3 py-3 text-sm font-semibold hover:text-primary"
                  >
                    <span>
                      {course.title}
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {course.duration || course.eyebrow}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0" />
                  </Link>
                ))}
              </div>
              <Link
                href={ROUTES.courses}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                Browse all programmes <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Partners compact />

      <section data-home-section="news" className="py-14 lg:py-16">
        <div className="site-container">
          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">From our journal</p>
              <h2 className="section-title">
                Ideas for better project delivery.
              </h2>
            </div>
            <Link
              href={ROUTES.blog}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              All insights <ArrowUpRight className="size-4" />
            </Link>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <article className="group relative min-w-0" key={post.slug}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width:767px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-xs font-medium text-primary">
                  {post.eyebrow}
                  <span className="text-muted-foreground"> · {post.meta}</span>
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
                  <Link
                    className="after:absolute after:inset-0"
                    href={ROUTES.blogDetail(post.slug)}
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {post.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read article <ArrowUpRight className="size-4" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-home-section="cta" className="pb-14 lg:pb-16">
        <div className="site-container">
          <div className="relative grid gap-7 overflow-hidden rounded-2xl bg-primary p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/80">
                Your project. Our next conversation.
              </p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Let’s make your next step clearer.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">
                Tell us what you are planning. We will help you define the right
                scope and support.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-lg bg-white text-brand-ink shadow-none hover:bg-white/90"
              >
                <Link href={ROUTES.contact}>
                  Discuss your project <ArrowUpRight />
                </Link>
              </Button>
              <a
                href={ROUTES.contactEmail}
                className="inline-flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline"
              >
                <Mail className="size-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
