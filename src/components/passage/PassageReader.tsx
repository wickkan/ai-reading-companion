"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { PassageChunk as PassageChunkDisplay } from "./PassageChunk";
import { PassageNav } from "./PassageNav";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { chunkPassage } from "@/lib/passage";
import { useReadingSession } from "@/hooks/useReadingSession";
import { useQuestions } from "@/hooks/useQuestions";
import type { Question } from "@/lib/types";

/**
 * Main orchestrator for the reading experience.
 * Renders the current passage chunk, fetches questions, and handles navigation.
 */
export function PassageReader() {
  const router = useRouter();
  const chunks = chunkPassage();
  const { session, addAnswer, advanceChunk } = useReadingSession();

  const currentChunk = chunks[session.currentChunkIndex];
  const { questions, isLoading, submitAnswer } = useQuestions(
    currentChunk,
    session.difficulty
  );

  const answeredForChunk = session.answers.filter((a) =>
    questions.some((q) => q.id === a.questionId)
  );
  const allAnswered =
    questions.length > 0 && answeredForChunk.length >= questions.length;
  const isLastChunk = session.currentChunkIndex === chunks.length - 1;

  const handleAnswer = useCallback(
    async (question: Question, answer: string) => {
      const result = await submitAnswer(question, answer);
      if (result) {
        addAnswer(result);
      }
    },
    [submitAnswer, addAnswer]
  );

  const handleNext = () => {
    if (isLastChunk) {
      router.push("/results");
    } else {
      advanceChunk();
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="flex items-center gap-4">
        <ProgressBar
          current={session.currentChunkIndex + 1}
          total={chunks.length}
          label="Section"
          className="flex-1"
        />
        <PassageNav
          totalChunks={chunks.length}
          currentIndex={session.currentChunkIndex}
          completedIndices={Array.from(
            { length: session.currentChunkIndex },
            (_, i) => i
          )}
          onNavigate={() => {
            // TODO: Allow backward navigation through completed sections
          }}
        />
      </div>

      {/* Passage text */}
      <PassageChunkDisplay chunk={currentChunk} isActive />

      {/* Questions */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Check your understanding
        </h2>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="text-gray-400 text-sm">Generating questions…</div>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onSubmit={(answer) => handleAnswer(q, answer)}
              existingResult={session.answers.find(
                (a) => a.questionId === q.id
              )}
            />
          ))
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-gray-400">
          {allAnswered
            ? "All questions answered — ready to continue."
            : `${questions.length - answeredForChunk.length} question${questions.length - answeredForChunk.length !== 1 ? "s" : ""} remaining`}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!allAnswered}
        >
          {isLastChunk ? "Finish reading" : "Next section →"}
        </Button>
      </div>
    </div>
  );
}
