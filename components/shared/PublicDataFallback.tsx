"use client";

import { useLanguage } from "@/lib/i18n/context";

interface PublicDataFallbackProps {
  title: string;
  description: string;
}

export function PublicDataFallback({
  title,
  description,
}: PublicDataFallbackProps) {
  const { locale } = useLanguage();
  const englishTitles: Record<string, string> = {
    "Dự án BIM & công nghệ xây dựng": "BIM Project & Digital Construction",
    "Dịch vụ BIM & công nghệ xây dựng": "BIM Services & Digital Construction",
    "Khóa học BIM": "BIM Training Programme",
    "Bài viết BIM & công nghệ xây dựng": "BIM & Digital Construction Article",
  };
  const englishDescriptions: Record<string, string> = {
    "Nội dung dự án đang được cập nhật. Vui lòng thử lại sau.":
      "This project is being updated. Please try again later.",
    "Nội dung dịch vụ đang được cập nhật. Vui lòng thử lại sau.":
      "This service is being updated. Please try again later.",
    "Nội dung khóa học đang được cập nhật. Vui lòng thử lại sau.":
      "This training programme is being updated. Please try again later.",
    "Nội dung bài viết đang được cập nhật. Vui lòng thử lại sau.":
      "This article is being updated. Please try again later.",
  };
  const visibleTitle = locale === "en" ? englishTitles[title] ?? title : title;
  const visibleDescription = locale === "en" ? englishDescriptions[description] ?? description : description;

  return (
    <main className="site-container py-24">
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="eyebrow">BIM4C</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{visibleTitle}</h1>
        <p className="mt-4 text-muted-foreground">{visibleDescription}</p>
      </section>
    </main>
  );
}
