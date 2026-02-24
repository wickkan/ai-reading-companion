"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ReadingSession, AnswerResult } from "@/lib/types";

interface SessionContextValue {
  session: ReadingSession;
  addAnswer: (result: AnswerResult) => void;
  setChunkIndex: (index: number) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function createInitialSession(
  difficulty: ReadingSession["difficulty"]
): ReadingSession {
  return {
    currentChunkIndex: 0,
    answers: [],
    startedAt: new Date(),
    difficulty,
    isComplete: false,
  };
}

interface SessionProviderProps {
  children: ReactNode;
  difficulty: ReadingSession["difficulty"];
}

export function SessionProvider({ children, difficulty }: SessionProviderProps) {
  const [session, setSession] = useState<ReadingSession>(() =>
    createInitialSession(difficulty)
  );

  const addAnswer = (result: AnswerResult) => {
    setSession((prev) => ({
      ...prev,
      answers: [
        ...prev.answers.filter((a) => a.questionId !== result.questionId),
        result,
      ],
    }));
  };

  const setChunkIndex = (index: number) => {
    setSession((prev) => ({ ...prev, currentChunkIndex: index }));
  };

  const resetSession = () => {
    setSession(createInitialSession(difficulty));
  };

  return (
    <SessionContext.Provider
      value={{ session, addAnswer, setChunkIndex, resetSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
