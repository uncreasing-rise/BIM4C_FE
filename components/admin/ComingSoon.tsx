import Link from "next/link";
import { AdminShell } from "./AdminShell";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Clock } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AdminShell title={title} description={description}>
      <section className="rounded-3xl border border-border bg-card p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-6">
          <Sparkles className="size-8" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">
          <Clock className="size-3.5" />
          <span>MODULE ĐANG ĐƯỢC CHUẨN BỊ</span>
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          Tính năng đang hoàn thiện
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
          Phân hệ <b>{title}</b> thuộc lộ trình nâng cấp Enterprise và sẽ sớm được cập nhật trên bảng điều khiển quản trị BIM4C.
        </p>
        <Link href="/admin">
          <Button variant="outline" className="gap-2 font-semibold text-xs">
            <ArrowLeft className="size-3.5" />
            <span>Quay lại Tổng quan</span>
          </Button>
        </Link>
      </section>
    </AdminShell>
  );
}
