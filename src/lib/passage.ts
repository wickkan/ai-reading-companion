import type { PassageChunk } from "./types";

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
      "Inside every beehive, there is a world more organized than most human cities. A single hive can contain up to 60,000 bees, and every single one has a job to do. At the center of the hive is the queen bee. She is the only bee that lays eggs—up to 2,000 per day during summer. Despite her title, the queen doesn't actually make decisions for the hive. Her main job is simply to lay eggs and keep the colony growing.",
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
