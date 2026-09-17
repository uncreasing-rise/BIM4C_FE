"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";
import { PageHero } from "@/components/shared/PageHero";
import { TableOfContents } from "@/components/shared/TableOfContents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { CourseRegistrationForm } from "@/features/contact/components/CourseRegistrationForm";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { ContentEntry } from "@/types/content";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Cpu,
  GraduationCap,
  HelpCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCurriculumItem {
  id?: string;
  title: string;
  description?: string;
}

export type CourseDetailEntry = ContentEntry & {
  curriculum?: CourseCurriculumItem[];
  learningOutcomes?: string[];
  instructor?: string;
  price?: string;
  duration?: string;
  level?: string;
};

interface CourseDetailViewProps {
  entry: CourseDetailEntry;
  related?: ContentEntry[];
  backHref?: string;
}

export function CourseDetailView({
  entry: rawEntry,
  related: rawRelated = [],
  backHref = ROUTES.courses,
}: CourseDetailViewProps) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const entry = localizeContent(rawEntry, locale) as CourseDetailEntry;
  const related = localizeContentList(rawRelated, locale);

  const isVi = locale === "vi";
  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [
    { name: t.navigation.home, path: "/" },
    { name: t.detailPage.backCourses, path: backHref },
    { name: entry.title, path: detailPath },
  ];

  const durationVal =
    entry.duration ||
    entry.eyebrow.split("·")[1]?.trim() ||
    (isVi ? "8 tuần" : "8 weeks");
  const levelVal =
    entry.level ||
    entry.eyebrow.split("·")[0]?.trim() ||
    (isVi ? "Chuyên sâu" : "Advanced");
  const priceVal =
    entry.price ||
    (isVi ? "Liên hệ ưu đãi khóa học" : "Contact for corporate/cohort pricing");
  const instructorVal =
    entry.instructor ||
    (isVi
      ? "BIM Manager & Giảng viên BIM4C"
      : "BIM Manager & Senior Specialist");

  const courseFacts = [
    {
      label: t.detailPage.fields.duration,
      value: toLocalizedLabel(durationVal, locale),
    },
    {
      label: t.detailPage.fields.level,
      value: toLocalizedLabel(levelVal, locale),
    },
    { label: t.detailPage.fields.price, value: priceVal },
    {
      label: isVi ? "Hình thức học" : "Format",
      value: isVi ? "Online tương tác / Lab" : "Live Interactive / Lab",
    },
    {
      label: isVi ? "Lịch khai giảng" : "Schedule",
      value: isVi ? "Định kỳ hàng tháng" : "Monthly Intakes",
    },
    { label: t.detailPage.fields.instructor, value: instructorVal },
  ];

  const blocks = entry.contentBlocks ?? legacyBlocks(entry);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          contentSchema("course", entry, detailPath),
        ]}
      />
      <PageHero
        eyebrow={
          entry.meta
            ? `${toLocalizedLabel(entry.eyebrow, locale)} · ${entry.meta}`
            : toLocalizedLabel(entry.eyebrow, locale)
        }
        title={entry.title}
        description={entry.description}
        image={entry.image}
        breadcrumbs={breadcrumbItems.map((item, index) => ({
          label: item.name,
          href: index < breadcrumbItems.length - 1 ? item.path : undefined,
        }))}
      />
      <article
        className="bg-background py-8 lg:py-12 pb-24 lg:pb-16"
        data-motion="detail"
      >
        <div className="site-container">
          {/* Top Back Navigation */}
          <div
            className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b pb-5"
            data-motion="reveal"
          >
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {t.detailPage.backCourses}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {toLocalizedLabel(levelVal, locale)}
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {toLocalizedLabel(durationVal, locale)}
              </span>
            </div>
          </div>

          {/* Course Quick Facts Strip */}
          <dl
            className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3 lg:grid-cols-6 shadow-xs"
            data-motion="tile"
          >
            {courseFacts.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-extrabold leading-snug text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Table of Contents & Quick Action */}
          <TableOfContents
            blocks={blocks}
            cta={{
              label: isVi ? "Đăng ký khóa học" : "Register for course",
              href: "#course-registration",
            }}
          />

          {/* Main 2-Column: Course Content + Registration Form */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div className="min-w-0" data-motion="reveal">
              <ContentBlockRenderer blocks={blocks} />

              {/* Learning Outcomes */}
              {entry.learningOutcomes && entry.learningOutcomes.length > 0 && (
                <div className="mt-10 rounded-2xl border bg-card p-6 shadow-2xs">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="size-5 text-primary" />
                    <span>
                      {isVi ? "Chuẩn đầu ra khóa học" : "Key Learning Outcomes"}
                    </span>
                  </h3>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {entry.learningOutcomes.map((item, i) => (
                      <li
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        key={`${entry.id}-outcomes-${i}`}
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum Modules */}
              {entry.curriculum && entry.curriculum.length > 0 && (
                <section className="mt-12" aria-label="Course curriculum">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
                    {t.detailPage.curriculumTitle}
                  </h2>
                  <ol className="divide-y rounded-2xl border bg-card shadow-2xs">
                    {entry.curriculum.map((module, index) => (
                      <li
                        className="grid gap-3 p-6 sm:grid-cols-[3.5rem_1fr]"
                        data-motion="tile"
                        key={module.id ?? `${module.title}-${index}`}
                      >
                        <span className="font-mono text-base font-bold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Software & Tools Stack */}
              <div className="mt-10 rounded-2xl border bg-muted/30 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t.detailPage.softwareStack}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {[
                    "Autodesk Revit (BIM Modeling)",
                    "Navisworks Manage (Clash Detective)",
                    "Autodesk Construction Cloud (ACC CDE)",
                    "OpenBIM IFC4 & BCF Standards",
                    "Solibri Model Checker",
                    "Dynamo & Python Automation",
                  ].map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs"
                    >
                      <Cpu className="size-3.5 text-teal-600 dark:text-teal-400" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* B2B Cohort Training Banner */}
              <div className="mt-10 relative overflow-hidden rounded-2xl bg-brand-ink p-6 text-white sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="rounded bg-teal-500/20 px-2.5 py-1 text-xs font-bold text-teal-300 border border-teal-500/30">
                      B2B CORPORATE TRAINING
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-white">
                      {t.detailPage.b2bTrainingTitle}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                      {t.detailPage.b2bTrainingDesc}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="shrink-0 bg-teal-500 hover:bg-teal-400 text-brand-ink font-bold"
                  >
                    <a href="#course-registration">
                      {t.detailPage.b2bTrainingAction}{" "}
                      <ArrowUpRight className="size-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar: Course Registration + Training Trust Signals (NOT Project NDA!) */}
            <Card
              id="course-registration"
              className="scroll-mt-28 gap-0 overflow-hidden rounded-2xl bg-brand-ink p-0 text-white ring-0 border border-white/10 shadow-2xl"
              data-motion="tile"
            >
              <CardHeader className="border-b border-white/10 p-6 bg-white/[0.02]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-teal-500/20 px-2.5 py-1 text-xs font-bold text-teal-300 border border-teal-500/30">
                    {t.detailPage.courseProfile}
                  </span>
                </div>
                <CardTitle className="text-xl text-white mt-2">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CourseRegistrationForm
                  courseId={entry.id ?? entry.slug}
                  courseTitle={entry.title}
                />

                {/* Academic & Training Trust Signals */}
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <GraduationCap className="size-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white/95">
                        {isVi ? "Nội dung đào tạo:" : "Training content:"}{" "}
                      </span>
                      <span>
                        {isVi
                          ? "Học trên dự án thực tế, tài liệu song ngữ chuyên ngành."
                          : "Hands-on projects with bilingual technical standards."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Users className="size-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white/95">
                        {isVi
                          ? "Chuyên gia trực tiếp giảng dạy:"
                          : "Instructor Mentorship:"}{" "}
                      </span>
                      <span>
                        {isVi
                          ? "BIM Manager có kinh nghiệm thực chiến trên các dự án quy mô lớn."
                          : "Seasoned BIM Managers leading real mega projects."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Award className="size-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white/95">
                        {isVi
                          ? "Chứng chỉ hoàn thành BIM4C:"
                          : "BIM4C Certificate:"}{" "}
                      </span>
                      <span>
                        {isVi
                          ? "Chứng nhận kỹ năng có mã QR xác thực hồ sơ năng lực."
                          : "Verified credential with QR authentication."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <HelpCircle className="size-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white/95">
                        {isVi
                          ? "Hỗ trợ sau khóa học:"
                          : "Post-course Support:"}{" "}
                      </span>
                      <span>
                        {isVi
                          ? "Hỗ trợ giải đáp thắc mắc và kết nối cơ hội việc làm BIM."
                          : "Community support and industry job connections."}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Courses Section */}
        {related.length > 0 && (
          <section
            className="site-container mt-16 border-t pt-12"
            aria-label="Related courses"
          >
            <div>
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {isVi ? "Khóa học liên quan" : "Related programmes"}
                  </h2>
                </div>
                <Button asChild variant="outline">
                  <Link href={backHref}>
                    {t.detailPage.viewAll}{" "}
                    <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </header>
              <div className="grid gap-6 md:grid-cols-3">
                {related.slice(0, 3).map((item) => (
                  <article
                    className="group relative"
                    key={item.slug}
                    data-motion="tile"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width:767px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                      {toLocalizedLabel(item.eyebrow, locale)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug text-foreground">
                      {item.title}
                    </h3>
                    <Link
                      className="absolute inset-0"
                      href={`${backHref}/${item.slug}`}
                      aria-label={`View ${item.title}`}
                    />
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
