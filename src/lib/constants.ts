export const APP_NAME = "Reading Companion";

export const QUESTIONS_PER_CHUNK = 2;

export const PASSING_SCORE = 70;

export const PASSAGE_CHUNK_COUNT = 4;

export const SYNTHESIS_QUESTION_COUNT = 1;

export const DIFFICULTY_LEVELS = [
  {
    value: "beginner" as const,
    label: "Beginner",
    description: "Straightforward questions with helpful hints",
  },
  {
    value: "intermediate" as const,
    label: "Intermediate",
    description: "Balanced questions that encourage deeper thinking",
  },
  {
    value: "advanced" as const,
    label: "Advanced",
    description: "Challenging analysis and inference questions",
  },
];
