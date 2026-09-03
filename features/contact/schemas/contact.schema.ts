import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  email: z.email("Email không hợp lệ."),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(10, "Nội dung cần ít nhất 10 ký tự."),
  consent: z.literal(true, { error: "Bạn cần đồng ý với Chính sách bảo mật." }),
});

export const courseRegistrationSchema = z.object({
  courseId: z.string().trim().min(1, "Khóa học không hợp lệ."),
  name: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  email: z.email("Email không hợp lệ."),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ."),
  consent: z.literal(true, { error: "Bạn cần đồng ý với Chính sách bảo mật." }),
});

export const newsletterSchema = z.object({
  email: z.email("Email không hợp lệ."),
  consent: z.literal(true, { error: "Bạn cần đồng ý nhận thông tin." }),
});
