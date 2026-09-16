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
      zaloWebhookUrl,
    } = body;

    if (type === "telegram") {
      if (!botToken || !chatId) {
        return NextResponse.json(
          { message: "Vui lòng nhập Bot Token và Chat ID" },
          { status: 400 },
        );
      }

      const messageText =
        "BIM4C: Kiểm tra kết nối Telegram do quản trị viên yêu cầu.";

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
          {
            message: `Telegram API Error: ${resData?.description || "Không thể gửi tin nhắn"}`,
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        data: {
          success: true,
          message:
            "Đã gửi thông báo Lead thử nghiệm thành công tới Telegram của Quản trị viên!",
        },
      });
    }

    if (type === "zalo") {
      const phone = zaloAdminPhone;
      if (!zaloWebhookUrl) {
        return NextResponse.json(
          {
            message:
              "Chưa cấu hình dịch vụ gửi Zalo. Không có tin nhắn nào được gửi.",
          },
          { status: 501 },
        );
      }

      // Format notification message intended for the Administrator
      const adminAlertText =
        "BIM4C: Kiểm tra kết nối webhook do quản trị viên yêu cầu.";

      // If webhook or access token provided, we can POST to Zalo API
      if (zaloWebhookUrl) {
        try {
          const response = await fetch(zaloWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipientPhone: phone,
              message: adminAlertText,
            }),
          });
          if (!response.ok) throw new Error("Webhook không chấp nhận yêu cầu.");
        } catch (error) {
          return NextResponse.json(
            {
              message:
                error instanceof Error
                  ? error.message
                  : "Không thể kết nối webhook.",
            },
            { status: 502 },
          );
        }
      }

      return NextResponse.json({
        data: {
          success: true,
          message:
            "Webhook đã chấp nhận yêu cầu kiểm tra. Chưa xác nhận tin nhắn được giao tới Zalo.",
        },
      });
    }

    if (type === "email") {
      if (!recipientEmail) {
        return NextResponse.json(
          { message: "Vui lòng nhập Email người nhận" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          message:
            "Chưa tích hợp dịch vụ gửi email. Không có email nào được gửi.",
        },
        { status: 501 },
      );
    }

    return NextResponse.json(
      { message: "Loại kiểm tra không hợp lệ" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Lỗi kiểm tra thông báo",
      },
      { status: 500 },
    );
  }
}
