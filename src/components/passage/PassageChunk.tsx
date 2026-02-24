import type { PassageChunk as PassageChunkType } from "@/lib/types";

interface PassageChunkProps {
  chunk: PassageChunkType;
  isActive: boolean;
}

/**
 * Renders a single section of the passage.
 * The active chunk is fully visible; inactive ones are dimmed.
 */
export function PassageChunk({ chunk, isActive }: PassageChunkProps) {
  return (
    <article
      id={`chunk-${chunk.id}`}
      className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40 pointer-events-none"}`}
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
        <p
          className="text-gray-800 leading-8 text-[1.05rem]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {chunk.content}
        </p>
      </div>
    </article>
  );
}
