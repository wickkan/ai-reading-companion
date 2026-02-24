"use client";

import { useCallback } from "react";
import { useSession } from "@/context/SessionContext";
import { PASSAGE_CHUNK_COUNT } from "@/lib/constants";

/**
 * Thin hook over SessionContext that adds navigation logic.
 * Components should use this instead of useSession() directly.
 */
export function useReadingSession() {
  const { session, addAnswer, setChunkIndex } = useSession();

  /**
   * Advances to the next passage chunk.
   * Callers should redirect to /results when the session is complete
   * (i.e. when currentChunkIndex >= PASSAGE_CHUNK_COUNT - 1).
   */
  const advanceChunk = useCallback(() => {
    const nextIndex = session.currentChunkIndex + 1;
    if (nextIndex < PASSAGE_CHUNK_COUNT) {
      setChunkIndex(nextIndex);
    }
    // Navigation to /results is handled in PassageReader so the router
    // stays in the component layer (not in a plain hook).
  }, [session.currentChunkIndex, setChunkIndex]);

  return { session, addAnswer, advanceChunk };
}
