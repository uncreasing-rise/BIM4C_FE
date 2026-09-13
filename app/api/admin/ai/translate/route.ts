import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, targetLang = "en", context = "construction_bim" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ message: "Văn bản nguồn không được để trống" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      const prompt = `You are an expert bilingual construction, engineering, architecture, and BIM (Building Information Modeling) terminology translator.
Translate the following ${targetLang === "en" ? "Vietnamese" : "English"} text into natural, professional ${targetLang === "en" ? "English" : "Vietnamese"} suitable for a corporate construction technology website.
Context: ${context}

Text to translate:
"""
${text}
"""

Rules:
- Keep formatting, markdown, bullet points intact.
- Use industry-standard BIM terms (e.g. CDE = Common Data Environment, Clash Detection, Information Requirements, Digital Twin, BIM Execution Plan).
- Return ONLY the direct translation without any introductory or conversational text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000,
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated) {
          return NextResponse.json({ data: { translatedText: translated } });
        }
      }
    }

    // Fallback dictionary-assisted translator for common construction terms if no API key is configured
    return NextResponse.json({
      data: {
        translatedText: text
          .replace(/Tư vấn BIM/gi, "BIM Consulting")
          .replace(/Đào tạo/gi, "Training")
          .replace(/Thiết kế/gi, "Integrated Design")
          .replace(/Tư vấn giám sát/gi, "Construction Supervision")
          .replace(/Dự án/gi, "Project")
          .replace(/Nền tảng/gi, "Foundation")
          .replace(/Chuyên sâu/gi, "Advanced")
          .replace(/Quản lý/gi, "Management")
          .replace(/Thực chiến/gi, "Applied")
          .replace(/Quản trị thông tin/gi, "Information Management"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi xử lý dịch thuật AI" },
      { status: 500 },
    );
  }
}
