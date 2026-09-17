"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, CONTACT_EMAIL } from "@/constants/routes";
import { Partners, DEFAULT_PARTNERS } from "@/components/sections/Partners";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { BimInteractiveHeroVisual } from "@/components/sections/BimInteractiveHeroVisual";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContentList } from "@/lib/i18n/localize";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { ContentEntry } from "@/types/content";
import type { Project } from "@/features/projects/types/project";
import type { StrategicPartner } from "@/features/homepage/types";

interface HomeViewProps {
  rawProjects: Project[];
  rawServices: ContentEntry[];
  rawPosts: ContentEntry[];
  rawCourses: ContentEntry[];
  rawPartners?: StrategicPartner[];
}

export function HomeView({
  rawProjects,
  rawServices,
  rawPosts,
  rawCourses,
  rawPartners,
}: HomeViewProps) {
  usePublicMotion();
  const { t, locale } = useLanguage();

  const isVi = locale === "vi";
  const projects = localizeContentList(rawProjects, locale);
  const services = localizeContentList(rawServices, locale);
  const posts = localizeContentList(rawPosts, locale);
  const courses = localizeContentList(rawCourses, locale);

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
        className="home-hero relative overflow-hidden bg-brand-ink text-white pt-24 pb-16 lg:pt-32 lg:pb-24"
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-40 top-1/4 size-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 size-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="site-container relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1.15fr] lg:gap-14">
            {/* Left Hero Content */}
            <div
              className="home-hero-copy flex flex-col justify-center"
              data-motion="hero"
            >
              {/* Tech Kicker Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300 backdrop-blur-md w-fit mb-6">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
                </span>
                <span>
                  {isVi
                    ? "Công nghệ số hóa công trình BIM"
                    : "BIM Construction Technology"}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem] leading-[1.08] text-white">
                {isVi ? "Kết nối dữ liệu." : "Connected data."}
                <br />
                <span className="bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  {isVi ? "Kiến tạo công trình." : "Better buildings."}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {isVi
                  ? "Tư vấn chiến lược BIM, điều phối mô hình đa bộ môn và quản lý dữ liệu số CDE — đồng hành tin cậy từ thiết kế, thi công đến vận hành."
                  : "BIM consulting, multidisciplinary model coordination and CDE information governance — from concept through operations."}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl px-6 font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-teal-900/40 hover:shadow-teal-900/60 transition-all hover:scale-[1.02]"
                >
                  <Link href={ROUTES.contact}>
                    {t.hero.ctaPrimary}
                    <ArrowUpRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-white/20 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <Link href={ROUTES.bimViewer}>
                    {isVi ? "Trải nghiệm BIM 3D" : "Explore BIM in 3D"}
                  </Link>
                </Button>
              </div>

              {/* Metrics Strip */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
                {t.aboutPage.trackRecord.metrics.map((metric) => (
                  <div key={metric.value}>
                    <strong className="text-xl text-teal-300">
                      {metric.value}
                    </strong>
                    <p className="text-xs text-slate-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Interactive 3D BIM Stage */}
            <div className="min-w-0" data-motion="slide-in">
              <BimInteractiveHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-hero Partner Trust Strip */}
      <section className="border-b border-white/10 bg-[#061e27] py-6 text-slate-300">
        <div className="site-container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-400 shrink-0">
            {isVi ? "Đối tác chiến lược" : "Strategic Partners"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {DEFAULT_PARTNERS.slice(0, 7).map((p) => (
              <div key={p.name} className="relative h-8 w-20 sm:w-24 opacity-75 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105" title={p.name}>
                <Image src={p.src} alt={p.name} fill className="object-contain brightness-110" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        data-home-section="services"
        className="services-section py-16 lg:py-20"
      >
        {!services.length && (
          <p className="site-container py-4 text-sm text-muted-foreground">
            {isVi
              ? "Nội dung đang được cập nhật. Vui lòng xem hồ sơ năng lực hoặc liên hệ BIM4C."
              : "Content is being updated. Please view our company profile or contact BIM4C."}{" "}
            <a href={ROUTES.profile} className="underline">
              {t.common.downloadProfile}
            </a>
          </p>
        )}
        <div className="site-container">
          <header
            className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
            data-motion="reveal"
          >
            <div>
              <p className="eyebrow">
                {isVi ? "Năng lực chuyên môn" : "Our expertise"}
              </p>
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
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                {t.common.exploreExpertise} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {orderedServices.slice(0, 3).map((service, index) => {
              return (
                <article
                  key={service.slug}
                  className="service-card group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5"
                  data-motion="tile"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(max-width:767px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="service-index" aria-hidden="true">
                      0{index + 1}
                      <span> / BIM4C</span>
                    </span>
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
                        <li
                          key={item}
                          className="flex gap-2 text-xs leading-5 text-foreground/85"
                        >
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
            <div
              className="mt-6 grid divide-y rounded-2xl border border-border/80 bg-muted/40 md:grid-cols-3 md:divide-x md:divide-y-0 shadow-xs"
              data-motion="reveal"
            >
              {orderedServices.slice(3, 6).map((service) => (
                <Link
                  href={ROUTES.serviceDetail(service.slug)}
                  key={service.slug}
                  className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 text-sm font-semibold transition-colors hover:bg-muted/80 hover:text-primary"
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
        {!projects.length && (
          <p className="site-container py-4 text-sm text-muted-foreground">
            {isVi
              ? "Nội dung đang được cập nhật. Vui lòng xem hồ sơ năng lực hoặc liên hệ BIM4C."
              : "Content is being updated. Please view our company profile or contact BIM4C."}{" "}
            <a href={ROUTES.profile} className="underline">
              {t.common.downloadProfile}
            </a>
          </p>
        )}
        <div className="site-container relative">
          <header
            className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
            data-motion="reveal"
          >
            <div>
              <p className="eyebrow text-teal-300">
                {isVi ? "Kinh nghiệm thực chiến" : "Selected experience"}
              </p>
              <h2 className="section-title text-white">
                {isVi
                  ? "Dự án thực tế. Năng lực kết nối."
                  : "Real projects. Connected expertise."}
              </h2>
            </div>
            <Link
              href={ROUTES.projects}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              {isVi ? "Tất cả dự án" : "All projects"}{" "}
              <ArrowUpRight className="size-4" />
            </Link>
          </header>
          <div data-motion="reveal">
            <ProjectCarousel projects={projects.slice(0, 3)} />
          </div>
        </div>
      </section>

      <DeliveryProcess />

      <section data-home-section="academy" className="py-16 lg:py-20">
        {!courses.length && (
          <p className="site-container py-4 text-sm text-muted-foreground">
            {isVi
              ? "Nội dung đang được cập nhật. Vui lòng xem hồ sơ năng lực hoặc liên hệ BIM4C."
              : "Content is being updated. Please view our company profile or contact BIM4C."}{" "}
            <a href={ROUTES.profile} className="underline">
              {t.common.downloadProfile}
            </a>
          </p>
        )}
        <div className="site-container">
          <div
            className="academy-panel grid overflow-hidden rounded-3xl border border-border/80 bg-card lg:grid-cols-[.9fr_1.1fr] shadow-lg"
            data-motion="reveal"
          >
            <div className="relative min-h-72 lg:min-h-full">
              <Image
                src="/images/news-bim-training.webp"
                alt="A team reviewing BIM project work together"
                fill
                sizes="(max-width:1023px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/40 to-transparent" />

              <p className="absolute bottom-6 left-6 right-6 text-sm font-medium text-white/90">
                {isVi
                  ? "Đào tạo và chuyển giao công nghệ BIM cho doanh nghiệp và sinh viên."
                  : "BIM training and technology transfer for businesses and students."}
              </p>
            </div>
            <div className="p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <p className="eyebrow">BIM4C ACADEMY</p>
                <h2 className="section-title">
                  {isVi
                    ? "Nâng cao năng lực chuyên môn đội ngũ."
                    : "Build your team’s next BIM capability."}
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
                        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                          {toLocalizedLabel(
                            course.duration || course.eyebrow,
                            locale,
                          )}
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
                {isVi
                  ? "Khám phá tất cả chương trình đào tạo"
                  : "Browse all programmes"}{" "}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Partners compact customPartners={rawPartners} />

      <section data-home-section="news" className="py-16 lg:py-24">
        {!posts.length && (
          <p className="site-container py-4 text-sm text-muted-foreground">
            {isVi
              ? "Nội dung đang được cập nhật. Vui lòng xem hồ sơ năng lực hoặc liên hệ BIM4C."
              : "Content is being updated. Please view our company profile or contact BIM4C."}{" "}
            <a href={ROUTES.profile} className="underline">
              {t.common.downloadProfile}
            </a>
          </p>
        )}
        <div className="site-container">
          <header
            className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
            data-motion="reveal"
          >
            <div>
              <p className="eyebrow">
                {isVi
                  ? "Góc nhìn & Bài viết chuyên môn"
                  : "Engineering Insights"}
              </p>
              <h2 className="section-title">
                {isVi
                  ? "Xu hướng công nghệ & Giải pháp thực chiến."
                  : "Latest ideas for digital project delivery."}
              </h2>
            </div>
            <Link
              href={ROUTES.blog}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
            >
              {isVi ? "Xem tất cả bài viết" : "Browse all insights"}{" "}
              <ArrowUpRight className="size-4" />
            </Link>
          </header>
          <div className="grid gap-8 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <article
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-2 cursor-pointer"
                key={post.slug}
                data-motion="tile"
              >
                {/* Full-card link for reliable click */}
                <Link
                  className="absolute inset-0 z-20 rounded-3xl focus:outline-none"
                  href={ROUTES.blogDetail(post.slug)}
                  aria-label={post.title}
                />

                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width:767px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-white border border-white/10 uppercase tracking-wider">
                        {toLocalizedLabel(post.eyebrow, locale)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <time>{post.meta}</time>
                  </div>
                  <h3 className="mt-2.5 text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs font-bold uppercase tracking-wider text-primary">
                  <span>{t.common.readMore}</span>
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-home-section="cta"
        className="py-16 lg:py-24 relative overflow-hidden"
      >
        <div className="site-container">
          <div
            className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-950 via-[#082631] to-slate-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center"
            data-motion="reveal"
          >
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 size-80 rounded-full bg-teal-500/10 blur-3xl" />

            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
                <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
                {isVi
                  ? "Bắt đầu từ câu hỏi đúng"
                  : "Start with the right question"}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight text-white max-w-2xl">
                {isVi
                  ? "Cùng làm rõ bước tiếp theo cho dự án của bạn."
                  : "Make the next step clear for your project."}
              </h2>
              <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
                {isVi
                  ? "Chia sẻ bối cảnh, mục tiêu hoặc vấn đề đang cần giải quyết. Đội ngũ chuyên gia BIM4C sẽ cùng bạn xác định phạm vi phù hợp nhất."
                  : "Share the context, goal or issue you are working through. We will help define the right scope together."}
              </p>
            </div>

            {/* Right Action */}
            <div className="relative z-10 flex flex-col items-start lg:items-end justify-center lg:border-l lg:border-white/15 lg:pl-12 space-y-4">
              <Link
                href={ROUTES.contact}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-teal-400 px-8 py-4 text-base font-bold text-slate-950 shadow-xl shadow-teal-400/25 hover:bg-teal-300 hover:shadow-teal-400/40 hover:-translate-y-1 transition-all duration-300"
              >
                <span>{t.common.discussProject}</span>
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <a
                href={ROUTES.contactEmail}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-teal-300 transition-colors"
              >
                <Mail className="size-4 text-teal-400" />
                {CONTACT_EMAIL}
              </a>

              <p className="text-xs text-slate-400">
                {isVi ? "Liên hệ đội ngũ BIM4C" : "Contact the BIM4C team"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
