import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai/generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, options } = body;

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return NextResponse.json(
        { error: "Content is required and must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Generate quiz
    const quiz = await generateQuiz(content, options);

    return NextResponse.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}

