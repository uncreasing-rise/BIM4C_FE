import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, content, lang = "vi" } = body;

    if (!title && !description) {
      return NextResponse.json({ message: "Cần ít nhất tiêu đề hoặc mô tả để gợi ý SEO" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      const prompt = `You are an enterprise SEO specialist for BIM4C, a leading Construction Technology and BIM consulting firm.
Based on the following content details (${lang === "vi" ? "in Vietnamese" : "in English"}):
Title: ${title || ""}
Description: ${description || ""}
Body Excerpt: ${(content || "").slice(0, 800)}

Generate optimal SEO metadata in JSON format:
{
  "seoTitle": "Engaging, keyword-rich SEO title under 60 characters with brand suffix '| BIM4C'",
  "seoDescription": "Compelling Meta description between 130-155 characters that drives clicks",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
Return ONLY valid JSON without markdown formatting or code blocks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (jsonText) {
          try {
            const parsed = JSON.parse(jsonText);
            return NextResponse.json({ data: parsed });
          } catch {
            // fallback if JSON parse fails
          }
        }
      }
    }

    // Heuristic fallback SEO metadata
    const cleanTitle = (title || "").trim();
    const cleanDesc = (description || "").trim();
    return NextResponse.json({
      data: {
        seoTitle: cleanTitle ? `${cleanTitle} | BIM4C` : "BIM4C — Enterprise Construction Technology",
        seoDescription: cleanDesc
          ? cleanDesc.slice(0, 150) + (cleanDesc.length > 150 ? "..." : "")
          : "Giải pháp chuyển đổi số, tư vấn BIM và đào tạo công nghệ xây dựng thực chiến từ BIM4C.",
        keywords: ["BIM", "BIM4C", "Tư vấn BIM", "Công nghệ xây dựng", "Mô hình thông tin công trình"],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi xử lý gợi ý SEO AI" },
      { status: 500 },
    );
  }
}
