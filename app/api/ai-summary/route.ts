import { NextResponse } from "next/server";
import { generateAISummary } from "@/lib/ai";

/**
 * AI Summary API — 为指定页面生成 AI 差异化内容
 */
export async function POST(req: Request) {
  try {
    const { state, category, platform } = await req.json();

    if (!state || !category || !platform) {
      return NextResponse.json(
        { success: false, error: "state, category, and platform are required" },
        { status: 400 }
      );
    }

    const summary = await generateAISummary(state, category, platform);

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("AI Summary API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
