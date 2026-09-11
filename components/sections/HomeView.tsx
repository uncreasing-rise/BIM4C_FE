"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Layers3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, CONTACT_EMAIL } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { ExpertiseStrip } from "@/components/sections/ExpertiseStrip";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { BimInteractiveHeroVisual } from "@/components/sections/BimInteractiveHeroVisual";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContentList } from "@/lib/i18n/localize";
import type { ContentEntry } from "@/types/content";
import type { Project } from "@/features/projects/types/project";

interface HomeViewProps {
  rawProjects: Project[];
  rawServices: ContentEntry[];
  rawPosts: ContentEntry[];
  rawCourses: ContentEntry[];
}

export function HomeView({
  rawProjects,
  rawServices,
  rawPosts,
  rawCourses,
}: HomeViewProps) {
  const { t, locale } = useLanguage();

  const isVi = locale === "vi";
  const projects = localizeContentList(rawProjects, locale);
  const services = localizeContentList(rawServices, locale);
  const posts = localizeContentList(rawPosts, locale);
  const courses = localizeContentList(rawCourses, locale);

  const featured =
    projects.find((project) => project.category === (isVi ? "Nhà cao tầng" : "High-rise")) ??
    projects[0];

  const servicePriority = ["tu-van-bim", "bim-coordination", "thiet-ke"];
  const orderedServices = [...services].sort((a, b) => {
    const rank = (slug: string) => {
      const index = servicePriority.indexOf(slug);
      return index < 0 ? servicePriority.length : index;
    };
    return rank(a.slug) - rank(b.slug);
  });

  return (
    <main>
      <section
        data-home-section="hero"
        className="page-hero home-hero technical-grid relative overflow-hidden bg-brand-ink text-white"
      >
        <Image
          src={featured?.image ?? "/images/news-digital-twin.webp"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-15 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 size-[40rem] rounded-full bg-teal-500/10 blur-[100px]"
        />
        <div
          className="site-container relative grid items-center gap-7 py-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12"
          data-motion="hero"
        >
          <div className="min-w-0">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-teal-200">
              <span className="size-2 rounded-full bg-teal-300" />
              {t.hero.badge}
            </p>
            <h1 className="max-w-xl text-balance text-[clamp(2.4rem,4vw,3.65rem)] font-semibold leading-[1.08] tracking-[-.045em]">
              {t.hero.titleMain}
              <br />
              <span className="text-teal-300">{t.hero.titleHighlight}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              {t.hero.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-lg px-4"
                data-motion="magnetic"
              >
                <Link href={ROUTES.contact}>
                  {t.hero.ctaPrimary} <ArrowUpRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg border-white/25 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white"
                data-motion="magnetic"
              >
                <Link href={ROUTES.projects}>{t.hero.ctaSecondary}</Link>
              </Button>
            </div>
            <div className="mt-7 hidden flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-slate-300 md:flex">
              {[
                t.hero.featureBimStrategy,
                t.hero.featureCoordination,
                t.hero.featureDigitalHandover,
              ].map((label) => (
                <span key={label} className="flex items-center gap-2">
                  <Check className="size-3.5 text-teal-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden min-w-0 lg:block" data-motion="tile">
            <BimInteractiveHeroVisual featuredProject={featured} />
          </div>
        </div>
      </section>

      <ExpertiseStrip />

      <section
        id="services"
        data-home-section="services"
        className="services-section py-12 lg:py-14"
      >
        <div className="site-container">
          <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">{isVi ? "Năng lực chuyên môn" : "Our expertise"}</p>
              <h2 className="section-title">
                {isVi ? (
                  <>
                    Giải pháp phù hợp.
                    <br />
                    Mọi giai đoạn dự án.
                  </>
                ) : (
                  <>
                    The right support.
                    <br />
                    At every project stage.
                  </>
                )}
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-sm leading-7 text-muted-foreground">
                {isVi
                  ? "Xây dựng chiến lược BIM, kết nối đa bộ môn và trang bị cho đội ngũ nguồn dữ liệu số hữu ích."
                  : "Define your BIM strategy, connect your disciplines and equip your team with information they can use."}
              </p>
              <Link
                href={ROUTES.services}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                {t.common.exploreExpertise} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </header>
          <div className="grid gap-5 md:grid-cols-3" data-motion="reveal">
            {orderedServices.slice(0, 3).map((service, index) => {
              const bimDim = index === 0 ? "3D & 4D BIM" : index === 1 ? "COORDINATION / CDE" : "5D & 7D ASSET";
              return (
                <article
                  key={service.slug}
                  className="service-card glow-card-teal group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-primary/50"
                  data-motion="tile"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(max-width:767px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <span className="absolute left-3 top-3 rounded-md bg-brand-ink/90 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-bold text-teal-300 border border-teal-500/30">
                      {bimDim}
                    </span>
                    <span className="absolute right-3 top-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 font-mono text-[11px] text-white/90">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      <Link
                        className="after:absolute after:inset-0"
                        href={ROUTES.serviceDetail(service.slug)}
                      >
                        {service.title}
                      </Link>
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="mb-5 mt-5 space-y-2 border-t border-border/60 pt-4">
                      {service.highlights.slice(0, 2).map((item) => (
                        <li key={item} className="flex gap-2 text-xs leading-5 text-foreground/85">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto flex items-center justify-between pt-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <span>{t.common.viewDetails}</span>
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          {services.length > 3 && (
            <div className="mt-5 grid divide-y rounded-xl border border-border/80 bg-muted/40 md:grid-cols-3 md:divide-x md:divide-y-0">
              {orderedServices.slice(3, 6).map((service) => (
                <Link
                  href={ROUTES.serviceDetail(service.slug)}
                  key={service.slug}
                  className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 text-sm font-semibold transition-colors hover:bg-muted/80 hover:text-primary"
                >
                  <span className="truncate">{service.title}</span>
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
        className="bg-brand-ink py-16 text-white lg:py-20 relative overflow-hidden"
      >
        {/* Background mesh grid */}
        <div className="pointer-events-none absolute inset-0 tech-grid-pattern opacity-40" aria-hidden="true" />
        <div className="site-container relative">
          <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-teal-300">{isVi ? "Kinh nghiệm thực chiến" : "Selected experience"}</p>
              <h2 className="section-title text-white">
                {isVi ? "Dự án thực tế. Năng lực kết nối." : "Real projects. Connected expertise."}
              </h2>
            </div>
            <Link
              href={ROUTES.projects}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              {isVi ? "Tất cả dự án" : "All projects"} <ArrowUpRight className="size-4" />
            </Link>
          </header>
          <ProjectCarousel projects={projects.slice(0, 3)} />
        </div>
      </section>

      <DeliveryProcess />

      <section data-home-section="academy" className="py-16 lg:py-20">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative min-h-72 lg:min-h-full">
              <Image
                src="/images/news-bim-training.webp"
                alt="A team reviewing BIM project work together"
                fill
                sizes="(max-width:1023px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/40 to-transparent" />
              
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] font-semibold text-teal-300 backdrop-blur-md">
                  ISO 19650 CERTIFIED
                </span>
                <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-md">
                  REVIT • NAVISWORKS • DYNAMO
                </span>
              </div>

              <p className="absolute bottom-6 left-6 right-6 text-sm font-medium text-white/90">
                {isVi
                  ? "Học trên dữ liệu dự án thực tế. Cấp chứng chỉ định danh chuẩn hóa quốc tế."
                  : "Learn with live project datasets. Receive verifiable industry certificates."}
              </p>
            </div>
            <div className="p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <p className="eyebrow">BIM4C ACADEMY</p>
                <h2 className="section-title">
                  {isVi ? "Nâng cao năng lực chuyên môn đội ngũ." : "Build your team’s next BIM capability."}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {isVi
                    ? "Chương trình thực chiến cho Kỹ sư Mô hình (Modeler), Điều phối viên (Coordinator) và Giám đốc BIM (Manager) với case study thực tế."
                    : "Practical programmes for Modelers, Coordinators and BIM Managers with guided hands-on exercises."}
                </p>
                <div className="mt-6 divide-y divide-border/60 border-y border-border/60">
                  {courses.slice(0, 3).map((course) => (
                    <Link
                      key={course.slug}
                      href={ROUTES.courseDetail(course.slug)}
                      className="group flex min-h-16 items-center justify-between gap-3 py-3.5 text-sm font-semibold hover:text-primary transition-colors"
                    >
                      <div>
                        <span className="block text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                          {course.duration || course.eyebrow}
                        </span>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href={ROUTES.courses}
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
              >
                {isVi ? "Khám phá tất cả chương trình đào tạo" : "Browse all programmes"} <ArrowRight className="size-4" />
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
              <p className="eyebrow">{isVi ? "Góc nhìn & Bài viết" : "From our journal"}</p>
              <h2 className="section-title">
                {isVi ? "Giải pháp chuyển đổi số hiệu quả." : "Ideas for better project delivery."}
              </h2>
            </div>
            <Link
              href={ROUTES.blog}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              {isVi ? "Tất cả bài viết" : "All insights"} <ArrowUpRight className="size-4" />
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
                  {t.common.readMore} <ArrowUpRight className="size-4" />
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
                {isVi ? "Dự án của bạn. Hợp tác cùng chúng tôi." : "Your project. Our next conversation."}
              </p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {isVi ? "Lộ trình rõ ràng hơn cho bước tiến tiếp theo." : "Let’s make your next step clearer."}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">
                {isVi
                  ? "Chia sẻ kế hoạch của bạn. Chúng tôi sẽ giúp xác định đúng phạm vi và giải pháp hỗ trợ."
                  : "Tell us what you are planning. We will help you define the right scope and support."}
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-lg bg-white text-brand-ink shadow-none hover:bg-white/90"
              >
                <Link href={ROUTES.contact}>
                  {t.common.discussProject} <ArrowUpRight />
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
