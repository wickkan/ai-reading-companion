/**
 * AI client helpers — wrappers around the Anthropic SDK.
 * Server-side only. Do NOT import this module in client components.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PassageChunk, Question, AnswerResult } from "./types";
import { QUESTIONS_PER_CHUNK, PASSING_SCORE } from "./constants";
import { PASSAGE_CHUNKS } from "./passage";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Server-side cache: difficulty → { [chunkId]: Question[] }
// Persists for the lifetime of the Node process — zero generation cost after first request per difficulty.
const questionCache = new Map<string, Record<string, Question[]>>();
// Use the exact dated ID — SDK 0.37.0 resolves the "claude-sonnet-4-6" alias to
// the stale version "claude-sonnet-4-5-20250514". The current valid version is below.
const MODEL = "claude-sonnet-4-5-20250929";

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

/** Normalises raw AI output to our Question type. IDs are assigned here, not by the AI. */
function normalizeQuestions(
  chunkId: string,
  raw: RawQuestion[],
  difficulty: string
): Question[] {
  return raw.slice(0, QUESTIONS_PER_CHUNK).map((q, i) => ({
    id: `q-${chunkId}-${i + 1}`,
    chunkId,
    questionText: q.questionText,
    difficulty: difficulty as Question["difficulty"],
    expectedAnswer: q.expectedAnswer,
    hints: q.hints && q.hints.length > 0 ? q.hints : undefined,
  }));
}

/**
 * Generates questions for ALL passage chunks in a single API call and caches
 * the result by difficulty. Subsequent calls for the same difficulty are free.
 */
async function generateAllQuestions(
  difficulty: string
): Promise<Record<string, Question[]>> {
  const cached = questionCache.get(difficulty);
  if (cached) return cached;

  const difficultyGuide =
    {
      beginner:
        "Ask about explicit facts and basic meaning. Include 1–2 short hints per question to help the student if they get stuck.",
      intermediate:
        "Ask about relationships between ideas, cause and effect, or the author's purpose. No hints needed.",
      advanced:
        "Ask for inference, critical analysis, or evaluation that requires reading between the lines. No hints needed.",
    }[difficulty] ?? "Ask about key ideas in the passage. No hints needed.";

  const sections = PASSAGE_CHUNKS.map(
    (c) => `[${c.id}]:\n"""\n${c.content}\n"""`
  ).join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "You are a reading comprehension expert designing questions for English learners. " +
      "Your questions must test genuine understanding of the text, not surface-level recall. " +
      "Return ONLY a valid JSON object — no explanation, no markdown, no prose.",
    messages: [
      {
        role: "user",
        content:
          `For each passage section below, generate exactly ${QUESTIONS_PER_CHUNK} comprehension questions at ${difficulty} difficulty.\n\n` +
          `Difficulty guideline: ${difficultyGuide}\n\n` +
          `Passage sections:\n\n${sections}\n\n` +
          `Return a single JSON object where each key is the section ID and each value is an array of question objects:\n` +
          `{\n` +
          `  "chunk-1": [\n` +
          `    { "questionText": "string", "expectedAnswer": "A 1–2 sentence model answer", "hints": ["hint1"] }\n` +
          `  ],\n` +
          `  "chunk-2": [ ... ],\n` +
          `  ...\n` +
          `}\n` +
          `Omit the "hints" key entirely for non-beginner difficulty.`,
      },
    ],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: Record<string, RawQuestion[]>;
  try {
    parsed = JSON.parse(extractJSON(raw)) as Record<string, RawQuestion[]>;
  } catch {
    throw new Error(
      `generateAllQuestions: failed to parse AI response as JSON.\nRaw: ${raw}`
    );
  }

  const result: Record<string, Question[]> = {};
  for (const chunk of PASSAGE_CHUNKS) {
    result[chunk.id] = normalizeQuestions(
      chunk.id,
      parsed[chunk.id] ?? [],
      difficulty
    );
  }

  questionCache.set(difficulty, result);
  return result;
}

/**
 * Returns questions for a single passage chunk.
 * Internally uses generateAllQuestions — the first call for a difficulty
 * generates all chunks at once; subsequent calls are instant cache hits.
 *
 * @param chunk      - The passage section to generate questions about
 * @param difficulty - The session difficulty level
 * @returns          Array of Question objects, length = QUESTIONS_PER_CHUNK
 */
export async function generateQuestions(
  chunk: PassageChunk,
  difficulty: string
): Promise<Question[]> {
  const all = await generateAllQuestions(difficulty);
  return all[chunk.id] ?? [];
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
