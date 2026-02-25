import { Badge } from "@/components/ui/Badge";
import type { AnswerResult } from "@/lib/types";

interface FeedbackPanelProps {
  result: AnswerResult;
  chunkContent?: string;
}

export function FeedbackPanel({ result, chunkContent }: FeedbackPanelProps) {
  const { isCorrect, score, feedback, correctAnswer, userAnswer } = result;

  const scoreVariant =
    score >= 80 ? "success" : score >= 50 ? "warning" : "error";
  const scoreLabel =
    score >= 80 ? "Great Answer!" : score >= 50 ? "Partially Correct" : "Not Quite";

  return (
    <div className="space-y-3">
      {/* Score row */}
      <div className="flex items-center gap-2">
        <Badge variant={scoreVariant}>{score}/100</Badge>
        <span className="text-xs text-gray-500">{scoreLabel}</span>
      </div>

      {/* User's answer */}
      <div className="p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Your Answer</p>
        <p className="text-sm text-gray-700 leading-relaxed">{userAnswer}</p>
      </div>

      {/* AI feedback */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs font-medium text-blue-500 mb-1">Feedback</p>
        <p className="text-sm text-blue-900 leading-relaxed">{feedback}</p>
      </div>

      {/* Model answer — shown when score is below threshold */}
      {!isCorrect && (
        <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-xs font-medium text-green-600 mb-1">Model Answer</p>
          <p className="text-sm text-green-900 leading-relaxed">{correctAnswer}</p>
        </div>
      )}

      {/* Passage excerpt — helps the student connect the answer back to the source */}
      {!isCorrect && chunkContent && (
        <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
          <p className="text-xs font-semibold text-amber-600 mb-1">From The Passage</p>
          <blockquote className="text-sm text-amber-900 leading-relaxed italic">
            &ldquo;{chunkContent}&rdquo;
          </blockquote>
        </div>
      )}
    </div>
  );
}
