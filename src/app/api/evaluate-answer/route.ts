import { NextRequest, NextResponse } from "next/server";
import type { Question } from "@/lib/types";
import { evaluateAnswer } from "@/lib/ai";

interface RequestBody {
  question: Question;
  userAnswer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RequestBody>;

    // Input validation
    if (!body.question || typeof body.userAnswer !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: question, userAnswer" },
        { status: 400 }
      );
    }

    const { question, userAnswer } = body;

    if (!userAnswer.trim()) {
      return NextResponse.json(
        { error: "userAnswer cannot be empty" },
        { status: 400 }
      );
    }

    const result = await evaluateAnswer(question, userAnswer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[evaluate-answer] Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
