import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards } from "@/lib/ai/generator";

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

    // Generate flashcards
    const flashcardSet = await generateFlashcards(content, options);

    return NextResponse.json({
      success: true,
      data: flashcardSet,
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate flashcards",
      },
      { status: 500 }
    );
  }
}

