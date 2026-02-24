import { NextRequest, NextResponse } from "next/server";
import type { PassageChunk } from "@/lib/types";
import { generateQuestions } from "@/lib/ai";

interface RequestBody {
  chunk: PassageChunk;
  difficulty: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RequestBody>;

    // Input validation
    if (!body.chunk || !body.difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: chunk, difficulty" },
        { status: 400 }
      );
    }

    const { chunk, difficulty } = body;

    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Must be beginner, intermediate, or advanced." },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(chunk, difficulty);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[generate-questions] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
