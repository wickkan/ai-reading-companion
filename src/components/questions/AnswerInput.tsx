"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AnswerInputProps {
  onSubmit: (answer: string) => Promise<void>;
  isSubmitting: boolean;
  hints?: string[];
}

export function AnswerInput({ onSubmit, isSubmitting, hints }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const handleSubmit = () => {
    if (answer.trim()) {
      void onSubmit(answer.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your answer here… (Shift + Enter for new line)"
        rows={3}
        className="w-full px-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
      />

      {/* Hint section — only shown for beginner difficulty */}
      {hints && hints.length > 0 && (
        <div>
          {showHint ? (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-medium text-amber-600 mb-1">
                Hint {hintIndex + 1} of {hints.length}
              </p>
              <p className="text-sm text-amber-900">{hints[hintIndex]}</p>
              {hintIndex < hints.length - 1 && (
                <button
                  onClick={() => setHintIndex((i) => i + 1)}
                  className="text-xs text-amber-600 hover:text-amber-700 mt-2 font-medium"
                >
                  Next hint →
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-amber-500 hover:text-amber-600 font-medium"
            >
              💡 Show Hint
            </button>
          )}
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!answer.trim() || isSubmitting}
      >
        {isSubmitting ? "Evaluating…" : "Submit Answer"}
      </Button>
    </div>
  );
}
