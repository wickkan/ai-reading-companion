import type { PassageChunk } from "./types";

export interface SynthesisQuestion {
  questionText: string;
  expectedAnswer: string;
}

/**
 * Passage data exactly as provided in the technical assessment spec.
 * Source: { "passage": { "id": "passage-1", "title": "The Secret Life of Honeybees", ... } }
 *
 * The single passage string is split into four logical sections here so we can
 * serve them one at a time and generate per-chunk questions.
 *
 * Split rationale:
 *   Chunk 1 — Intro + Queen bee (hive overview, queen's role)
 *   Chunk 2 — Worker bees (lifecycle progression of roles)
 *   Chunk 3 — Drones (purpose, autumn expulsion)
 *   Chunk 4 — Waggle dance + closing fact (communication, honey stat)
 */
export const PASSAGE_ID = "passage-1";
export const PASSAGE_TITLE = "The Secret Life of Honeybees";

export const PASSAGE_CHUNKS: PassageChunk[] = [
  {
    id: "chunk-1",
    index: 0,
    content:
      "Inside every beehive, there is a world more organised than most human cities. A single hive can contain up to 60,000 bees, and every single one has a job to do. At the center of the hive is the queen bee. She is the only bee that lays eggs—up to 2,000 per day during summer. Despite her title, the queen doesn't actually make decisions for the hive. Her main job is simply to lay eggs and keep the colony growing.",
    keyInsights: [
      "A single hive holds up to 60,000 bees — every one has a specific job.",
      "The queen's only role is reproduction: laying up to 2,000 eggs per day.",
      "Despite her title, the queen does not make decisions for the colony.",
    ],
  },
  {
    id: "chunk-2",
    index: 1,
    content:
      "The worker bees are all female, and they do everything else. Young workers stay inside the hive, cleaning cells, feeding larvae, and building honeycomb from wax they produce from their own bodies. As they get older, they graduate to guarding the hive entrance. The oldest workers become foragers, flying up to five miles from the hive to collect nectar and pollen.",
    keyInsights: [
      "All worker bees are female — they handle every hive task except laying eggs.",
      "A worker's role changes with age: nursery duties → guard → forager.",
      "Honeycomb wax is produced from the bees' own bodies, not collected externally.",
    ],
  },
  {
    id: "chunk-3",
    index: 2,
    content:
      "Male bees are called drones. They don't collect food, don't guard the hive, and don't have stingers. Their only purpose is to mate with queens from other hives. In autumn, when food becomes scarce, the workers push the drones out of the hive to conserve resources.",
    keyInsights: [
      "Drones are male bees with one purpose: mating with queens from other hives.",
      "Drones have no stinger and contribute nothing to food collection or defence.",
      "Every autumn, workers expel all drones to conserve food for winter.",
    ],
  },
  {
    id: "chunk-4",
    index: 3,
    content:
      "Bees communicate through dancing. When a forager finds a good source of flowers, she returns to the hive and performs a 'waggle dance' that tells other bees exactly where to find the food. The angle of her dance shows the direction relative to the sun, and the length of her waggle shows the distance. This tiny insect has been making honey the same way for over 100 million years. Every spoonful of honey represents the life's work of about twelve bees.",
    keyInsights: [
      "The 'waggle dance' encodes both direction (angle) and distance (duration) to a food source.",
      "Honeybees have used this same communication method for over 100 million years.",
      "One spoonful of honey represents the entire life's work of about twelve bees.",
    ],
  },
];

/**
 * Returns all passage chunks in order.
 * In a more complex app, this could accept a passage ID and fetch dynamically.
 */
export function chunkPassage(): PassageChunk[] {
  return PASSAGE_CHUNKS;
}

/**
 * Final synthesis question per difficulty level.
 * Shown after all four section questions are complete — requires the student
 * to integrate what they have read across the whole passage.
 */
export const SYNTHESIS_QUESTIONS: Record<
  "beginner" | "intermediate" | "advanced",
  SynthesisQuestion
> = {
  beginner: {
    questionText:
      "In your own words, write a short paragraph explaining how a beehive is organised. Make sure to mention the three types of bees and what each one does.",
    expectedAnswer:
      "A beehive is highly organised, with three types of bees each having a specific role. The queen is the only bee that lays eggs — up to 2,000 per day — keeping the colony growing. Worker bees, all female, handle every other task: young workers clean and feed larvae, older ones guard the entrance, and the oldest fly out to collect nectar and pollen. Drones are male bees whose sole purpose is to mate with queens from other hives; they are expelled by workers every autumn when food becomes scarce.",
  },
  intermediate: {
    questionText:
      "Write a paragraph explaining why worker bees could be considered the most important members of the hive. Use at least three specific details from the passage to support your argument.",
    expectedAnswer:
      "Worker bees are arguably the most essential members of the hive because they perform every function that keeps the colony alive. First, they build the honeycomb from wax produced by their own bodies, creating the physical infrastructure of the hive. Second, they feed larvae and guard the entrance, ensuring the next generation survives. Third, as foragers they travel up to five miles to collect the nectar and pollen that sustains everyone — including the queen and drones, who contribute nothing to food supply. Without workers, the colony could not function.",
  },
  advanced: {
    questionText:
      "The passage states that the queen bee 'doesn't actually make decisions for the hive.' Write a paragraph exploring how the hive functions without a single leader. Consider how the different roles, communication methods, and seasonal behaviours work together to keep the colony alive.",
    expectedAnswer:
      "The hive operates through a distributed, self-organising system rather than top-down leadership. Each bee class serves a distinct biological function: the queen ensures genetic continuity, workers maintain all operational tasks, and drones provide genetic diversity. Communication is decentralised — foragers use the waggle dance to share precise information about food sources without any central coordinator. Seasonal adaptation is equally autonomous: workers collectively expel drones each autumn with no single bee directing this. The colony's intelligence is emergent, not hierarchical — no individual controls the whole, yet the hive responds to environmental change and sustains behaviours unchanged for over 100 million years.",
  },
};
