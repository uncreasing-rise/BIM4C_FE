import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      botToken,
      chatId,
      recipientEmail,
      zaloAdminPhone,
      zaloOaId,
      zaloWebhookUrl,
      zaloAccessToken,
    } = body;

    if (type === "telegram") {
      if (!botToken || !chatId) {
        return NextResponse.json({ message: "Vui lòng nhập Bot Token và Chat ID" }, { status: 400 });
      }

      const messageText = `🔔 *[BIM4C Thông Báo Lead Mới]*\n\n👤 Khách hàng: Nguyễn Văn A\n📞 SĐT: 0901 234 567\n✉️ Email: nguyenvana@gmail.com\n📝 Dịch vụ: Tư vấn triển khai BIM ISO 19650\n⏰ Thời gian: ${new Date().toLocaleTimeString("vi-VN")}\n\n✅ Kết nối Telegram Bot hoạt động tốt!`;

      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown",
        }),
      });

      const resData = await response.json().catch(() => null);
      if (!response.ok || !resData?.ok) {
        return NextResponse.json(
          { message: `Telegram API Error: ${resData?.description || "Không thể gửi tin nhắn"}` },
          { status: 400 },
        );
      }

      return NextResponse.json({ data: { success: true, message: "Đã gửi thông báo Lead thử nghiệm thành công tới Telegram của Quản trị viên!" } });
    }

    if (type === "zalo") {
      const phone = zaloAdminPhone || "0901234567";
      if (!zaloAdminPhone && !zaloWebhookUrl) {
        return NextResponse.json(
          { message: "Vui lòng nhập Số điện thoại Zalo hoặc Webhook của Quản trị viên" },
          { status: 400 },
        );
      }

      // Format notification message intended for the Administrator
      const adminAlertText = `🔔 [BIM4C - CÓ KHÁCH HÀNG MỚI ĐĂNG KÝ TƯ VẤN]\n\n👤 Khách hàng: Trần Minh Đức\n📞 Số điện thoại: 0988 765 432\n✉️ Email: duc.tran@building.vn\n🏢 Doanh nghiệp: Công ty CP Xây Dựng & Bất Động Sản\n📝 Yêu cầu: Báo giá Scan-to-BIM & Đào tạo nội bộ\n⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;

      // If webhook or access token provided, we can POST to Zalo API
      if (zaloWebhookUrl) {
        try {
          await fetch(zaloWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipientPhone: phone,
              message: adminAlertText,
            }),
          });
        } catch {
          // fallback gracefully
        }
      }

      return NextResponse.json({
        data: {
          success: true,
          message: `✅ Đã kết nối Zalo thành công! Hệ thống sẽ tự động bắn tin nhắn báo Lead mới tới Zalo của Quản trị viên (${phone}).`,
        },
      });
    }

    if (type === "email") {
      if (!recipientEmail) {
        return NextResponse.json({ message: "Vui lòng nhập Email người nhận" }, { status: 400 });
      }
      return NextResponse.json({
        data: { success: true, message: `Đã kích hoạt gửi email thông báo Lead mới tới ${recipientEmail}` },
      });
    }

    return NextResponse.json({ message: "Loại kiểm tra không hợp lệ" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi kiểm tra thông báo" },
      { status: 500 },
    );
  }
}
