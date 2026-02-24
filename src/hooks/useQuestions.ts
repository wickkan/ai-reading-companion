"use client";

import { useState, useEffect, useCallback } from "react";
import type { PassageChunk, Question, AnswerResult } from "@/lib/types";

/**
 * Fetches questions for the given passage chunk and handles answer submission.
 *
 * @param chunk      - The current passage section
 * @param difficulty - The session difficulty level
 */
export function useQuestions(chunk: PassageChunk, difficulty: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch whenever the chunk changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      setQuestions([]);

      try {
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunk, difficulty }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = (await res.json()) as { questions: Question[] };
        setQuestions(data.questions);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load questions";
        setError(message);
        // TODO: Fall back to a static set of questions for offline resilience
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuestions();
  }, [chunk.id, difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Submits a user's answer to the evaluation API.
   * Returns the AnswerResult or null on failure.
   */
  const submitAnswer = useCallback(
    async (question: Question, userAnswer: string): Promise<AnswerResult | null> => {
      try {
        const res = await fetch("/api/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, userAnswer }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        return (await res.json()) as AnswerResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to evaluate answer";
        setError(message);
        return null;
      }
    },
    []
  );

  return { questions, isLoading, error, submitAnswer };
}
