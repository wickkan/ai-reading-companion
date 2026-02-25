import { Card } from "@/components/ui/Card";

interface ChunkSummaryCardProps {
  sectionLabel: string;
  insights: string[];
}

/**
 * Shown after a student answers all questions for a section.
 * Reinforces the key ideas before they advance to the next chunk.
 */
export function ChunkSummaryCard({ sectionLabel, insights }: ChunkSummaryCardProps) {
  return (
    <Card className="bg-emerald-50 border-emerald-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-emerald-500 text-base">✓</span>
        <div>
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
            {sectionLabel}
          </p>
          <p className="text-sm font-semibold text-emerald-900">Key Takeaways</p>
        </div>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
            <span className="mt-0.5 text-emerald-400 shrink-0 font-bold">·</span>
            {insight}
          </li>
        ))}
      </ul>
    </Card>
  );
}
