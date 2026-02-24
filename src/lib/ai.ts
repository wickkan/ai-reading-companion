/**
 * AI client helpers — wrappers around the Anthropic SDK.
 *
 * Both functions are called from the API routes (server-side only).
 * Do NOT import this module in client components.
 */

import type { PassageChunk, Question, AnswerResult } from "./types";

// TODO: Initialise the Anthropic client
// import Anthropic from "@anthropic-ai/sdk";
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generates comprehension questions for a given passage chunk.
 *
 * @param chunk     - The passage section to generate questions about
 * @param difficulty - The desired difficulty level for the questions
 * @returns         A promise resolving to an array of Question objects
 *
 * TODO: Implement prompt engineering to:
 *   - Ask claude-haiku-4-5 to produce exactly QUESTIONS_PER_CHUNK questions
 *   - Return structured JSON matching the Question interface
 *   - Scale question depth/type based on difficulty level
 *   - Include hints only for 'beginner' difficulty
 */
export async function generateQuestions(
  chunk: PassageChunk,
  difficulty: string
): Promise<Question[]> {
  // TODO: Replace stub with real Anthropic SDK call
  console.log("generateQuestions called", { chunkId: chunk.id, difficulty });

  return [];
}

/**
 * Evaluates a user's free-text answer against the expected answer.
 *
 * @param question   - The question object (includes expectedAnswer)
 * @param userAnswer - The raw text the user submitted
 * @returns          A promise resolving to an AnswerResult with score and feedback
 *
 * TODO: Implement prompt engineering to:
 *   - Use claude-haiku-4-5 for fast, cost-efficient evaluation
 *   - Score answers 0–100, considering partial credit
 *   - Generate constructive, encouraging feedback (not just "wrong")
 *   - Return structured JSON matching the AnswerResult interface
 */
export async function evaluateAnswer(
  question: Question,
  userAnswer: string
): Promise<AnswerResult> {
  // TODO: Replace stub with real Anthropic SDK call
  console.log("evaluateAnswer called", { questionId: question.id, userAnswer });

  return {
    questionId: question.id,
    userAnswer,
    isCorrect: false,
    score: 0,
    feedback: "TODO: AI evaluation not yet implemented.",
    correctAnswer: question.expectedAnswer,
  };
}
