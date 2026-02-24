import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PASSING_SCORE } from "@/lib/constants";

// TODO: Replace mock data with real session results
// (passed via URL params, server session, or localStorage on the client)
const MOCK = {
  totalQuestions: 8,
  answeredQuestions: 8,
  averageScore: 82,
  difficulty: "intermediate" as const,
  timeSpent: "12 min",
};

function ResultsContent() {
  const { totalQuestions, answeredQuestions, averageScore, difficulty, timeSpent } = MOCK;
  const passed = averageScore >= PASSING_SCORE;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
            {passed ? "Well done!" : "Keep practising!"}
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
        <div className="flex items-center gap-2 mb-10">
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

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            Back to home
          </Link>
          <Link
            href={`/read?difficulty=${difficulty}`}
            className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Try again
          </Link>
        </div>
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
