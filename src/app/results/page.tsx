"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PASSING_SCORE } from "@/lib/constants";
import type { AnswerResult, CompletedSession, ReadingSession } from "@/lib/types";

const NEXT_DIFFICULTY: Record<string, ReadingSession["difficulty"]> = {
  beginner: "intermediate",
  intermediate: "advanced",
};

const NEXT_DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Intermediate",
  intermediate: "Advanced",
};

/**
 * Returns the section number from a questionId like "q-chunk-2-1" → 2.
 * Returns null for synthesis questions ("q-synthesis-1").
 */
function sectionFromId(questionId: string): number | null {
  if (questionId.startsWith("q-synthesis")) return null;
  const match = questionId.match(/chunk-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function AnswerReview({ answers }: { answers: AnswerResult[] }) {
  // Separate synthesis answers from section answers
  const sectionAnswers = answers.filter(
    (a) => sectionFromId(a.questionId) !== null
  );
  const synthesisAnswers = answers.filter(
    (a) => sectionFromId(a.questionId) === null
  );

  // Group section answers by section number, preserving order
  const sections = new Map<number, AnswerResult[]>();
  for (const a of sectionAnswers) {
    const sec = sectionFromId(a.questionId) as number;
    if (!sections.has(sec)) sections.set(sec, []);
    sections.get(sec)!.push(a);
  }

  const renderAnswerCard = (a: AnswerResult) => (
    <Card key={a.questionId} padding="sm">
      <div className="space-y-2">
        {/* Question */}
        {a.questionText && (
          <p className="text-sm font-medium text-gray-800 leading-relaxed">
            {a.questionText}
          </p>
        )}

        {/* Score badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              a.isCorrect
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {a.score}/100
          </span>
          <span className="text-xs text-gray-400">
            {a.isCorrect ? "Correct" : "Needs work"}
          </span>
        </div>

        {/* User's answer */}
        <div className="p-2.5 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-0.5">Your Answer</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {a.userAnswer}
          </p>
        </div>

        {/* Model answer — only on incorrect */}
        {!a.isCorrect && (
          <div className="p-2.5 bg-green-50 rounded-lg">
            <p className="text-xs font-medium text-green-600 mb-0.5">
              Model Answer
            </p>
            <p className="text-sm text-green-900 leading-relaxed">
              {a.correctAnswer}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Answer Review</h2>
      <div className="space-y-6">
        {Array.from(sections.entries())
          .sort(([a], [b]) => a - b)
          .map(([sec, secAnswers]) => (
            <div key={sec}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Section {sec}
              </p>
              <div className="space-y-3">
                {secAnswers.map(renderAnswerCard)}
              </div>
            </div>
          ))}

        {/* Synthesis section */}
        {synthesisAnswers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Your Synthesis
            </p>
            <div className="space-y-3">
              {synthesisAnswers.map(renderAnswerCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsContent() {
  const [data, setData] = useState<CompletedSession | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("readingSession");
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      setData(JSON.parse(raw) as CompletedSession);
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center">
          <p className="text-4xl mb-4">◎</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No session found</h1>
          <p className="text-gray-500 mb-8">
            It looks like you navigated here directly. Complete a reading session to see your results.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Start Reading
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  const answeredQuestions = data.answers.length;
  const totalQuestions = data.totalQuestions;
  const averageScore =
    answeredQuestions > 0
      ? Math.round(
          data.answers.reduce((sum, a) => sum + a.score, 0) / answeredQuestions
        )
      : 0;
  const passed = averageScore >= PASSING_SCORE;

  const ms = Math.max(0, data.completedAt - data.startedAt);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const timeSpent =
    minutes > 0 ? `${minutes} min` : seconds > 0 ? `${seconds}s` : "< 1s";

  const { difficulty } = data;
  const nextDifficulty = NEXT_DIFFICULTY[difficulty];
  const showLevelUp = averageScore >= 85 && nextDifficulty !== undefined;

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-xl">
        {/* Hero result */}
        <div className="text-center mb-10">
          <div
            className={`text-6xl mb-4 ${passed ? "text-green-500" : "text-amber-400"}`}
          >
            {passed ? "✓" : "◎"}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? "Well Done!" : "Keep Practising!"}
          </h1>
          <p className="text-gray-500">
            You answered {answeredQuestions} of {totalQuestions} questions in{" "}
            {timeSpent}.
          </p>
        </div>

        {/* Stats card */}
        <Card className="mb-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {averageScore}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Average score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {answeredQuestions}/{totalQuestions}
              </div>
              <div className="text-xs text-gray-500 mt-1">Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{timeSpent}</div>
              <div className="text-xs text-gray-500 mt-1">Time spent</div>
            </div>
          </div>
        </Card>

        {/* Difficulty */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-500">Difficulty:</span>
          <Badge
            variant={
              difficulty === "beginner"
                ? "success"
                : difficulty === "advanced"
                  ? "warning"
                  : "info"
            }
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>

        {/* Level-up nudge */}
        {showLevelUp && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Ready for a bigger challenge?
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                You scored {averageScore}% on {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} — try {NEXT_DIFFICULTY_LABEL[difficulty]}
              </p>
            </div>
            <Link
              href={`/read?difficulty=${nextDifficulty}`}
              className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try {NEXT_DIFFICULTY_LABEL[difficulty]} →
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-2">
          <Link
            href="/"
            className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            Back To Home
          </Link>
          <Link
            href={`/read?difficulty=${difficulty}`}
            className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </Link>
        </div>

        {/* Per-question answer review */}
        <AnswerReview answers={data.answers} />
      </main>
      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
          Loading…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
