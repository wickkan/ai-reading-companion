/**
 * AI client helpers — wrappers around the Anthropic SDK.
 * Server-side only. Do NOT import this module in client components.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PassageChunk, Question, AnswerResult } from "./types";
import { QUESTIONS_PER_CHUNK, PASSING_SCORE } from "./constants";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

/**
 * Strips markdown code fences that Claude sometimes wraps JSON in.
 * e.g. ```json\n[...]\n``` → [...]
 */
function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : raw.trim();
}

// Shape of what the AI returns for question generation
interface RawQuestion {
  questionText: string;
  expectedAnswer: string;
  hints?: string[];
}

// Shape of what the AI returns for answer evaluation
interface RawEvaluation {
  score: number;
  feedback: string;
  correctAnswer: string;
}

// ────────────────────────────────────────────────────────────────────────────

/**
 * Generates comprehension questions for a single passage chunk.
 *
 * @param chunk      - The passage section to generate questions about
 * @param difficulty - The session difficulty level
 * @returns          Array of Question objects, length = QUESTIONS_PER_CHUNK
 */
export async function generateQuestions(
  chunk: PassageChunk,
  difficulty: string
): Promise<Question[]> {
  const difficultyGuide =
    {
      beginner:
        "Ask about explicit facts and basic meaning. Include 1–2 short hints per question to help the student if they get stuck.",
      intermediate:
        "Ask about relationships between ideas, cause and effect, or the author's purpose. No hints needed.",
      advanced:
        "Ask for inference, critical analysis, or evaluation that requires reading between the lines. No hints needed.",
    }[difficulty] ?? "Ask about key ideas in the passage. No hints needed.";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "You are a reading comprehension expert designing questions for English learners. " +
      "Your questions must test genuine understanding of the text, not surface-level recall. " +
      "Return ONLY a valid JSON array — no explanation, no markdown, no prose.",
    messages: [
      {
        role: "user",
        content:
          `Passage excerpt:\n"""\n${chunk.content}\n"""\n\n` +
          `Generate exactly ${QUESTIONS_PER_CHUNK} comprehension questions at ${difficulty} difficulty.\n\n` +
          `Difficulty guideline: ${difficultyGuide}\n\n` +
          `Return a JSON array matching this schema exactly:\n` +
          `[\n` +
          `  {\n` +
          `    "questionText": "string",\n` +
          `    "expectedAnswer": "A 1–2 sentence model answer",\n` +
          `    "hints": ["hint1", "hint2"]  // include only for beginner; omit the key entirely for other levels\n` +
          `  }\n` +
          `]`,
      },
    ],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: RawQuestion[];
  try {
    parsed = JSON.parse(extractJSON(raw)) as RawQuestion[];
  } catch {
    throw new Error(
      `generateQuestions: failed to parse AI response as JSON.\nRaw: ${raw}`
    );
  }

  // Normalise to our Question type — IDs are assigned here, not by the AI
  return parsed.slice(0, QUESTIONS_PER_CHUNK).map((q, i) => ({
    id: `q-${chunk.id}-${i + 1}`,
    chunkId: chunk.id,
    questionText: q.questionText,
    difficulty: difficulty as Question["difficulty"],
    expectedAnswer: q.expectedAnswer,
    hints: q.hints && q.hints.length > 0 ? q.hints : undefined,
  }));
}

// ────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates a student's free-text answer against the expected answer.
 *
 * @param question   - The question object (contains expectedAnswer for context)
 * @param userAnswer - Raw text the student submitted
 * @returns          AnswerResult with score 0–100, feedback, and model answer
 */
export async function evaluateAnswer(
  question: Question,
  userAnswer: string
): Promise<AnswerResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system:
      "You are a warm, encouraging reading comprehension tutor. " +
      "You give partial credit for partially correct answers. " +
      "Your feedback is always constructive — acknowledge what the student got right before pointing to what is missing. " +
      "Return ONLY a valid JSON object — no explanation, no markdown, no prose.",
    messages: [
      {
        role: "user",
        content:
          `Question: ${question.questionText}\n` +
          `Model answer: ${question.expectedAnswer}\n` +
          `Student's answer: ${userAnswer}\n\n` +
          `Score the student's answer 0–100 using this guide:\n` +
          `90–100: key idea captured fully and accurately\n` +
          `70–89: mostly correct, minor detail missing\n` +
          `50–69: partially correct, shows some understanding\n` +
          `30–49: minimal understanding, key idea absent\n` +
          `0–29:  incorrect or not relevant to the question\n\n` +
          `Return a JSON object matching this schema exactly:\n` +
          `{\n` +
          `  "score": number,\n` +
          `  "feedback": "2–3 sentences: acknowledge strengths, then guide improvement",\n` +
          `  "correctAnswer": "A clear model answer the student can learn from"\n` +
          `}`,
      },
    ],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: RawEvaluation;
  try {
    parsed = JSON.parse(extractJSON(raw)) as RawEvaluation;
  } catch {
    throw new Error(
      `evaluateAnswer: failed to parse AI response as JSON.\nRaw: ${raw}`
    );
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));

  return {
    questionId: question.id,
    userAnswer,
    isCorrect: score >= PASSING_SCORE,
    score,
    feedback: parsed.feedback,
    correctAnswer: parsed.correctAnswer,
  };
}
