"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { registerCourse } from "../api/mutations";

export function CourseRegistrationForm({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending"); setMessage("");
    try {
      const result = await registerCourse({ courseId, name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), phone: String(data.get("phone") ?? "") });
      form.reset(); setStatus("success"); setMessage(result.message);
    } catch (error) {
      setStatus("error"); setMessage(error instanceof ZodError ? error.issues[0]?.message ?? "Thông tin chưa hợp lệ." : error instanceof Error ? error.message : "Không thể đăng ký lúc này.");
    }
  }
  return <form className="course-register-form" onSubmit={submit} noValidate><h3>Đăng ký khóa học</h3><p>{courseTitle}</p><label><span>Họ và tên *</span><input name="name" autoComplete="name" required /></label><label><span>Số điện thoại *</span><input name="phone" type="tel" autoComplete="tel" required /></label><label><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Đang gửi…" : "Đăng ký ngay"}<span>→</span></button>{message && <p className={`lead-form-message ${status}`} role="status">{message}</p>}</form>;
}
