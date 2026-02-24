export interface PassageChunk {
  id: string;
  content: string;
  index: number;
}

export interface Question {
  id: string;
  chunkId: string;
  questionText: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedAnswer: string;
  hints?: string[];
}

export interface AnswerResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number; // 0–100
  feedback: string;
  correctAnswer: string;
}

export interface ReadingSession {
  currentChunkIndex: number;
  answers: AnswerResult[];
  startedAt: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isComplete: boolean;
}
