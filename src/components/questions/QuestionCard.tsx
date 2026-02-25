"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AnswerInput } from "./AnswerInput";
import { FeedbackPanel } from "./FeedbackPanel";
import type { Question, AnswerResult } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => Promise<void>;
  existingResult?: AnswerResult;
  chunkContent?: string;
}


export function QuestionCard({
  question,
  onSubmit,
  existingResult,
  chunkContent,
}: QuestionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (answer: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit(answer);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Question header */}
        <div className="flex items-start gap-3">
          <p className="text-gray-900 font-medium leading-relaxed text-sm flex-1">
            {question.questionText}
          </p>
        </div>

        {/* Answer area or feedback */}
        {existingResult ? (
          <FeedbackPanel result={existingResult} chunkContent={chunkContent} />
        ) : (
          <AnswerInput
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            hints={question.hints}
          />
        )}
      </div>
    </Card>
  );
}
