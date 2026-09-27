"use client";

import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import type { MutationResult } from "../types/mutations";

export function SubmissionReceipt({
  title,
  description,
  email,
  notification,
  next,
  onReset,
}: {
  title: string;
  description?: string;
  email: string;
  notification?: MutationResult["notification"];
  next: string;
  onReset: () => void;
}) {
  const { locale } = useLanguage();
  const vi = locale === "vi";
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-950/70 to-slate-950 p-6 sm:p-8"
    >
      <div className="mb-5 inline-flex rounded-2xl bg-teal-400/10 p-3">
        <CheckCircle2 className="size-8 text-teal-300" aria-hidden="true" />
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-300">
        {vi ? "Đã tiếp nhận" : "Request received"}
      </p>
      <h3 className="text-2xl font-semibold leading-tight text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-200">{description}</p>
      )}
      <div className="my-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <Mail className="mt-1 size-5 shrink-0 text-teal-300" />
        <p className="break-words text-sm leading-6 text-slate-200">
          {notification?.customer === "sent"
            ? vi
              ? `Email thông báo đã được gửi tới ${email}. Vui lòng kiểm tra cả thư mục spam.`
              : `Your notification is on its way to ${email}. Please check your spam folder too.`
            : vi
              ? "Yêu cầu đã được lưu. Email thông báo hiện chưa được xác nhận gửi; bạn không cần gửi lại yêu cầu."
              : "Your request is saved. Email delivery has not been confirmed; there is no need to submit again."}
        </p>
      </div>
      <p className="text-sm leading-7 text-slate-300">{next}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="mt-6 border-teal-400/30 bg-transparent text-teal-200 hover:bg-teal-950 hover:text-white"
      >
        {vi ? "Gửi yêu cầu khác" : "Send another request"}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
