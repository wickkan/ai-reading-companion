"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PassageChunk as PassageChunkDisplay } from "./PassageChunk";
import { PassageNav } from "./PassageNav";
import { ChunkSummaryCard } from "./ChunkSummaryCard";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { chunkPassage } from "@/lib/passage";
import { useReadingSession } from "@/hooks/useReadingSession";
import { useQuestions } from "@/hooks/useQuestions";
import { QUESTIONS_PER_CHUNK, PASSAGE_CHUNK_COUNT } from "@/lib/constants";
import type { Question, CompletedSession } from "@/lib/types";

/**
 * Main orchestrator for the reading experience.
 * Renders the current passage chunk, fetches questions, and handles navigation.
 */
export function PassageReader() {
  const router = useRouter();
  const chunks = chunkPassage();
  const { session, addAnswer, advanceChunk, setChunkIndex, completeSession } =
    useReadingSession();

  // viewingIndex tracks which chunk is *displayed*; session.currentChunkIndex
  // tracks the furthest chunk reached. They differ when the user navigates back.
  const [viewingIndex, setViewingIndex] = useState(session.currentChunkIndex);

  // Keep viewingIndex in sync when the session advances forward
  useEffect(() => {
    setViewingIndex(session.currentChunkIndex);
  }, [session.currentChunkIndex]);

  const currentChunk = chunks[viewingIndex];
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
  const isViewingPast = viewingIndex < session.currentChunkIndex;

  const handleAnswer = useCallback(
    async (question: Question, answer: string) => {
      const result = await submitAnswer(question, answer);
      if (result) {
        addAnswer(result);
      }
    },
    [submitAnswer, addAnswer]
  );

  const handleNavigate = useCallback(
    (index: number) => {
      if (index <= session.currentChunkIndex) {
        setViewingIndex(index);
      }
    },
    [session.currentChunkIndex]
  );

  const handleNext = () => {
    if (isViewingPast) {
      // Return to the active chunk
      setViewingIndex(session.currentChunkIndex);
      return;
    }
    if (isLastChunk) {
      if (session.isComplete) return; // guard against double-click
      completeSession();
      const payload: CompletedSession = {
        answers: session.answers,
        startedAt: session.startedAt.getTime(),
        completedAt: Date.now(),
        difficulty: session.difficulty,
        totalQuestions: QUESTIONS_PER_CHUNK * PASSAGE_CHUNK_COUNT,
      };
      sessionStorage.setItem("readingSession", JSON.stringify(payload));
      router.push("/results");
    } else {
      advanceChunk();
    }
  };

  const buttonLabel = isViewingPast
    ? "Return To Current Section"
    : isLastChunk
      ? "Finish Reading"
      : "Next Section →";

  // Button is enabled when: returning to current section (always), or all answered on active chunk
  const buttonEnabled = isViewingPast || allAnswered;

  // Show summary card only on the active chunk (not when reviewing past chunks)
  const showSummary =
    allAnswered &&
    !isViewingPast &&
    (currentChunk.keyInsights?.length ?? 0) > 0;

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
          onNavigate={handleNavigate}
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
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
            <p className="text-gray-400 text-sm">Generating questions…</p>
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
              chunkContent={currentChunk.content}
            />
          ))
        )}
      </div>

      {/* Key takeaways — shown after answering all questions for this section */}
      {showSummary && (
        <ChunkSummaryCard
          sectionLabel={`Section ${viewingIndex + 1} of ${chunks.length}`}
          insights={currentChunk.keyInsights!}
        />
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-gray-400">
          {isViewingPast
            ? `Reviewing section ${viewingIndex + 1}`
            : allAnswered
              ? "All questions answered — ready to continue."
              : `${questions.length - answeredForChunk.length} Question${
                  questions.length - answeredForChunk.length !== 1 ? "s" : ""
                } Remaining`}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!buttonEnabled}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
