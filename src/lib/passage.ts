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
  },
  {
    id: "chunk-2",
    index: 1,
    content:
      "The worker bees are all female, and they do everything else. Young workers stay inside the hive, cleaning cells, feeding larvae, and building honeycomb from wax they produce from their own bodies. As they get older, they graduate to guarding the hive entrance. The oldest workers become foragers, flying up to five miles from the hive to collect nectar and pollen.",
  },
  {
    id: "chunk-3",
    index: 2,
    content:
      "Male bees are called drones. They don't collect food, don't guard the hive, and don't have stingers. Their only purpose is to mate with queens from other hives. In autumn, when food becomes scarce, the workers push the drones out of the hive to conserve resources.",
  },
  {
    id: "chunk-4",
    index: 3,
    content:
      "Bees communicate through dancing. When a forager finds a good source of flowers, she returns to the hive and performs a 'waggle dance' that tells other bees exactly where to find the food. The angle of her dance shows the direction relative to the sun, and the length of her waggle shows the distance. This tiny insect has been making honey the same way for over 100 million years. Every spoonful of honey represents the life's work of about twelve bees.",
  },
];

/**
 * Returns all passage chunks in order.
 * In a more complex app, this could accept a passage ID and fetch dynamically.
 */
export function chunkPassage(): PassageChunk[] {
  return PASSAGE_CHUNKS;
}
