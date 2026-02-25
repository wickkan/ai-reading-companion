interface PassageNavProps {
  totalChunks: number;
  currentIndex: number;
  completedIndices: number[];
  onNavigate: (index: number) => void;
}

/**
 * Dot-style navigation showing progress through passage sections.
 * Completed sections show as filled dots; the current section is a pill.
 */
export function PassageNav({
  totalChunks,
  currentIndex,
  completedIndices,
  onNavigate,
}: PassageNavProps) {
  return (
    <nav
      aria-label="Passage sections"
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: totalChunks }, (_, i) => {
        const isCompleted = completedIndices.includes(i);
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            disabled={isFuture}
            aria-label={`Section ${i + 1}${isCompleted ? " (completed)" : isCurrent ? " (current)" : " (not yet reached)"}`}
            aria-current={isCurrent ? "step" : undefined}
            className={`h-2 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-6 bg-blue-600"
                : isCompleted
                  ? "w-2 bg-blue-300 hover:bg-blue-400 cursor-pointer"
                  : "w-2 bg-gray-200 opacity-40 cursor-not-allowed"
            }`}
          />
        );
      })}
    </nav>
  );
}
