import { Badge } from "@/components/ui/Badge";
import type { AnswerResult } from "@/lib/types";

interface FeedbackPanelProps {
  result: AnswerResult;
}

export function FeedbackPanel({ result }: FeedbackPanelProps) {
  const { isCorrect, score, feedback, correctAnswer, userAnswer } = result;

  const scoreVariant =
    score >= 80 ? "success" : score >= 50 ? "warning" : "error";
  const scoreLabel =
    score >= 80 ? "Great answer!" : score >= 50 ? "Partially correct" : "Not quite";

  return (
    <div className="space-y-3">
      {/* Score row */}
      <div className="flex items-center gap-2">
        <Badge variant={scoreVariant}>{score}/100</Badge>
        <span className="text-xs text-gray-500">{scoreLabel}</span>
      </div>

      {/* User's answer */}
      <div className="p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Your answer</p>
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
          <p className="text-xs font-medium text-green-600 mb-1">Model answer</p>
          <p className="text-sm text-green-900 leading-relaxed">{correctAnswer}</p>
        </div>
      )}
    </div>
  );
}
