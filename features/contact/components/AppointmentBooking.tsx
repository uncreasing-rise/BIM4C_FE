"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PRIVACY_POLICY_VERSION } from "@/constants/legal-content";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Slot = { startAt: string; endAt: string; timezone: string };

export function AppointmentBooking({ projectSlug }: { projectSlug?: string }) {
  const { locale } = useLanguage();
  const vi = locale === "vi";
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const from = new Date();
    const to = new Date(from.getTime() + 21 * 24 * 60 * 60 * 1000);
    apiClient
      .get<Slot[]>(`${API_ENDPOINTS.appointments.availability}?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`, { cache: "no-store" })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selected = slots.find((item) => item.startAt === slot);
    if (!selected) return toast.error(vi ? "Vui lòng chọn khung giờ." : "Please choose a time slot.");
    setSending(true);
    try {
      const result = await apiClient.post<{ success: true; message: string }>(API_ENDPOINTS.appointments.create, {
        name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), company: String(form.get("company") ?? ""), topic: String(form.get("topic") ?? "Project consultation"), message: String(form.get("message") ?? ""), projectSlug, startAt: selected.startAt, endAt: selected.endAt, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh", consent: form.get("consent") === "on", privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      }, { cache: "no-store" });
      setSuccess(true);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (vi ? "Không thể đặt lịch." : "Unable to book this appointment."));
    } finally { setSending(false); }
  }

  if (success) return <div className="rounded-xl border border-teal-400/30 bg-teal-950/40 p-5 text-sm text-teal-100">{vi ? "Yêu cầu đặt lịch đã được ghi nhận. BIM4C sẽ xác nhận qua email." : "Your booking request was received. BIM4C will confirm it by email."}</div>;

  return <div className="mt-8 border-t border-white/10 pt-8">
    <div className="mb-5"><h3 className="text-xl font-semibold">{vi ? "Đặt lịch tư vấn" : "Book a consultation"}</h3><p className="mt-2 text-sm text-white/65">{vi ? "Chọn một khung giờ còn trống. Múi giờ hiển thị theo thiết bị của bạn." : "Choose an available time. Times are shown in your device timezone."}</p></div>
    <form className="grid gap-4" onSubmit={submit}>
      <select name="slot" value={slot} onChange={(event) => setSlot(event.target.value)} required className="h-12 rounded-xl border border-slate-700 bg-slate-900/90 px-4 text-base text-white">
        <option value="">{loading ? (vi ? "Đang tải khung giờ…" : "Loading available times…") : slots.length ? (vi ? "Chọn ngày và giờ" : "Choose date and time") : (vi ? "Chưa có lịch trống" : "No available times")}</option>
        {slots.map((item) => <option key={item.startAt} value={item.startAt}>{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.startAt))}</option>)}
      </select>
      <div className="grid gap-4 sm:grid-cols-2"><Input name="name" required placeholder={vi ? "Họ và tên *" : "Full name *"} className="h-12 bg-slate-900/90 text-white" /><Input name="email" type="email" required placeholder={vi ? "Email *" : "Email *"} className="h-12 bg-slate-900/90 text-white" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Input name="phone" placeholder={vi ? "Điện thoại" : "Phone"} className="h-12 bg-slate-900/90 text-white" /><Input name="company" placeholder={vi ? "Công ty" : "Company"} className="h-12 bg-slate-900/90 text-white" /></div>
      <Input name="topic" required defaultValue={vi ? "Tư vấn dự án" : "Project consultation"} placeholder={vi ? "Chủ đề" : "Topic"} className="h-12 bg-slate-900/90 text-white" />
      <Textarea name="message" placeholder={vi ? "Ghi chú thêm" : "Additional notes"} className="min-h-24 bg-slate-900/90 text-white" />
      <label className="flex items-start gap-3 text-xs text-slate-200"><input name="consent" type="checkbox" required className="mt-1 size-4 accent-teal-400" />{vi ? "Tôi đồng ý với Chính sách bảo mật và việc xử lý dữ liệu cá nhân." : "I agree to the Privacy Policy and processing of my personal data."}</label>
      <Button type="submit" disabled={sending || loading || !slots.length} className="min-h-12 rounded-xl bg-teal-400 font-bold text-slate-950 hover:bg-teal-300">{sending ? (vi ? "Đang đặt lịch…" : "Booking…") : (vi ? "Đặt lịch tư vấn" : "Book consultation")}</Button>
    </form>
  </div>;
}
