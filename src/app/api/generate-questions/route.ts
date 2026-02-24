import { NextRequest, NextResponse } from "next/server";
import type { PassageChunk } from "@/lib/types";

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

    // TODO: Replace with real Anthropic SDK call
    // import { generateQuestions } from "@/lib/ai";
    // const questions = await generateQuestions(chunk, difficulty);

    // Stub response — remove once AI is wired up
    const questions = [
      {
        id: `q-${chunk.id}-1`,
        chunkId: chunk.id,
        questionText: `[TODO] Question 1 about section ${chunk.index + 1}`,
        difficulty,
        expectedAnswer: "[TODO] Expected answer placeholder",
        hints: difficulty === "beginner" ? ["[TODO] Hint 1"] : undefined,
      },
      {
        id: `q-${chunk.id}-2`,
        chunkId: chunk.id,
        questionText: `[TODO] Question 2 about section ${chunk.index + 1}`,
        difficulty,
        expectedAnswer: "[TODO] Expected answer placeholder",
      },
    ];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[generate-questions] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
