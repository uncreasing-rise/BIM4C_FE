"use client";

import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  CalendarClock,
  Clock3,
  Globe2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PRIVACY_POLICY_VERSION } from "@/constants/legal-content";
import { useLanguage } from "@/lib/i18n/context";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmissionReceipt } from "./SubmissionReceipt";
import type { MutationResult } from "../types/mutations";

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const subscribeTimezone = () => () => {};
const readTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const serverTimezone = () => "";

export function AppointmentBooking({ projectSlug }: { projectSlug?: string }) {
  const { locale } = useLanguage();
  const vi = locale === "vi";
  const id = useId();
  const submitting = useRef(false);
  const [openedAt] = useState(() => Date.now());
  const timezone = useSyncExternalStore(
    subscribeTimezone,
    readTimezone,
    serverTimezone,
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    email: string;
    when: string;
    notification?: MutationResult["notification"];
  } | null>(null);
  const bounds = timezone
    ? {
        min: localDate(new Date(openedAt)),
        max: localDate(new Date(openedAt + 120 * 86400000)),
      }
    : { min: "", max: "" };
  const start = new Date(`${date}T${time}`);
  const summary =
    date && time && Number.isFinite(start.getTime())
      ? new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(start)
      : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (
      !Number.isFinite(start.getTime()) ||
      start.getTime() <= Date.now() ||
      start.getTime() > Date.now() + 120 * 86400000
    ) {
      setError(
        vi
          ? "Vui lòng chọn thời gian trong tương lai, trong vòng 120 ngày tới."
          : "Please choose a future time within the next 120 days.",
      );
      return;
    }
    if (
      localDate(start) !== date ||
      `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}` !==
        time
    ) {
      setError(
        vi
          ? "Thời gian này không tồn tại trong múi giờ của bạn. Vui lòng chọn giờ khác."
          : "This time does not exist in your time zone due to a clock change. Please choose another time.",
      );
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    submitting.current = true;
    setSending(true);
    setError("");
    try {
      const result = await apiClient.post<MutationResult>(
        API_ENDPOINTS.appointments.create,
        {
          name: String(form.get("name") ?? ""),
          email,
          phone: String(form.get("phone") ?? ""),
          company: String(form.get("company") ?? ""),
          topic: String(form.get("topic") ?? ""),
          message: String(form.get("message") ?? ""),
          projectSlug,
          startAt: start.toISOString(),
          endAt: new Date(start.getTime() + duration * 60000).toISOString(),
          timezone,
          locale,
          consent: form.get("consent") === "on",
          privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        },
        { cache: "no-store", timeoutMs: 30000 },
      );
      setReceipt({ email, when: summary, notification: result.notification });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? vi
            ? "Thời gian này vừa có lịch hẹn khác. Vui lòng chọn giờ khác; thông tin bạn nhập vẫn được giữ lại."
            : "This time overlaps another appointment. Please choose another time; your details have been kept."
          : vi
            ? "Chưa thể xác nhận yêu cầu. Vui lòng thử lại hoặc liên hệ BIM4C nếu bạn đã nhận email."
            : "We could not confirm your request. Please try again, or contact BIM4C if you have already received an email.",
      );
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  const field =
    "h-12 w-full min-w-0 rounded-xl border-slate-700 bg-slate-900 text-white [color-scheme:dark] focus-visible:ring-teal-400";
  const label = "grid min-w-0 gap-2 text-sm font-medium text-slate-200";
  if (receipt)
    return (
      <div id="dat-lich" className="mt-8 scroll-mt-28">
        <SubmissionReceipt
          title={
            vi
              ? "Đã nhận thời gian bạn đề xuất"
              : "Your preferred time is with us"
          }
          email={receipt.email}
          notification={receipt.notification}
          description={`${receipt.when} · ${duration} ${vi ? "phút" : "minutes"} · ${timezone}`}
          next={
            vi
              ? "Lịch hẹn đang chờ BIM4C xác nhận. Thông tin tham gia sẽ có trong email xác nhận sau đó."
              : "Your appointment is pending review. Joining details will follow in a separate confirmation email."
          }
          onReset={() => {
            setReceipt(null);
            setDate("");
          }}
        />
      </div>
    );

  return (
    <section
      id="dat-lich"
      className="mt-8 scroll-mt-28 border-t border-white/10 pt-8"
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-teal-400/10 p-3 text-teal-300">
          <CalendarClock className="size-6" />
        </div>
        <div>
          <h3 id={`${id}-title`} className="text-xl font-semibold text-white">
            {vi
              ? "Một cuộc trao đổi, bước khởi đầu rõ ràng"
              : "A conversation. A clear next step."}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {vi
              ? "Chọn thời gian thuận tiện cho bạn. BIM4C sẽ xem xét và xác nhận qua email."
              : "Choose a time that works for you. BIM4C will review your request and confirm by email."}
          </p>
        </div>
      </div>
      <form className="grid gap-6" onSubmit={submit} aria-busy={sending}>
        <fieldset
          disabled={sending}
          className="grid min-w-0 gap-5 rounded-2xl border border-white/10 bg-white/[.03] p-5"
        >
          <legend className="px-2 text-xs font-bold uppercase tracking-widest text-teal-300">
            {vi ? "01 · Thời gian của bạn" : "01 · Your preferred time"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {vi ? "Ngày mong muốn *" : "Preferred date *"}
              <Input
                type="date"
                required
                value={date}
                min={bounds.min}
                max={bounds.max}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className={field}
              />
            </label>
            <label className={label}>
              {vi ? "Giờ bắt đầu *" : "Start time *"}
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setError("");
                }}
                className={field}
              />
            </label>
          </div>
          <div>
            <p
              className="mb-2 text-sm font-medium text-slate-200"
              id={`${id}-duration`}
            >
              {vi ? "Thời lượng" : "Duration"}
            </p>
            <div
              role="group"
              aria-labelledby={`${id}-duration`}
              className="flex flex-wrap gap-2"
            >
              {[30, 45, 60, 90, 120].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={duration === minutes}
                  onClick={() => setDuration(minutes)}
                  className={`min-h-10 rounded-lg border px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-teal-300 ${duration === minutes ? "border-teal-400 bg-teal-400/15 font-semibold text-teal-200" : "border-slate-700 text-slate-300 hover:border-slate-500"}`}
                >
                  {minutes} {vi ? "phút" : "min"}
                </button>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Globe2 className="size-4 shrink-0" />
            {vi ? "Múi giờ thiết bị:" : "Your device time zone:"}{" "}
            {timezone || "…"}
          </p>
        </fieldset>
        <fieldset disabled={sending} className="grid min-w-0 gap-4">
          <legend className="mb-4 text-xs font-bold uppercase tracking-widest text-teal-300">
            {vi ? "02 · Kết nối với bạn" : "02 · Let’s get acquainted"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {vi ? "Họ và tên *" : "Full name *"}
              <Input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={160}
                required
                className={field}
              />
            </label>
            <label className={label}>
              Email *
              <Input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={320}
                required
                className={field}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {vi ? "Điện thoại" : "Phone"}
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={32}
                className={field}
              />
            </label>
            <label className={label}>
              {vi ? "Công ty" : "Company"}
              <Input
                name="company"
                autoComplete="organization"
                maxLength={200}
                className={field}
              />
            </label>
          </div>
          <label className={label}>
            {vi
              ? "Bạn muốn trao đổi về điều gì? *"
              : "What would you like to discuss? *"}
            <Input
              name="topic"
              required
              minLength={2}
              maxLength={120}
              placeholder={
                vi
                  ? "Ví dụ: Triển khai BIM cho dự án"
                  : "e.g. BIM implementation for your project"
              }
              className={field}
            />
          </label>
          <label className={label}>
            {vi ? "Thông tin giúp chúng tôi chuẩn bị" : "Help us prepare"}
            <Textarea
              name="message"
              maxLength={5000}
              placeholder={
                vi
                  ? "Mục tiêu, bối cảnh dự án hoặc câu hỏi của bạn…"
                  : "Your goals, project context or questions…"
              }
              className="min-h-28 rounded-xl border-slate-700 bg-slate-900 text-white"
            />
          </label>
          <label className="flex items-start gap-3 text-xs leading-6 text-slate-300">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-1.5 size-4 shrink-0 accent-teal-400"
            />
            <span>
              {vi ? "Tôi đồng ý với " : "I agree to the "}
              <Link
                href="/phap-ly/chinh-sach-bao-mat"
                target="_blank"
                className="text-teal-300 underline"
              >
                {vi ? "Chính sách bảo mật" : "Privacy Policy"}
              </Link>
              {vi
                ? " và việc xử lý dữ liệu để hỗ trợ yêu cầu này."
                : " and the processing of my information to handle this request."}
            </span>
          </label>
        </fieldset>
        {summary && (
          <div className="flex items-start gap-3 rounded-xl bg-teal-400/5 p-4 text-sm text-slate-200">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-teal-300" />
            <div>
              <p>{summary}</p>
              <p className="mt-1 text-xs text-slate-400">
                {duration}{" "}
                {vi
                  ? "phút · Chờ xác nhận"
                  : "minutes · Subject to confirmation"}
              </p>
            </div>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={sending || !timezone}
          className="min-h-12 rounded-xl bg-teal-400 font-bold text-slate-950 hover:bg-teal-300"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {sending
            ? vi
              ? "Đang gửi yêu cầu…"
              : "Sending your request…"
            : vi
              ? "Gửi yêu cầu đặt lịch"
              : "Request a consultation"}
        </Button>
      </form>
    </section>
  );
}
