# EdAccelerator Reading Companion

An AI-powered reading comprehension tool that guides learners through a passage with personalised questions and written feedback.

**Live demo:** [edaccel-reading-companion.vercel.app](https://edaccel-reading-companion.vercel.app)

--

## Overview

Reading Companion targets a common gap in digital learning: students can click through multiple choice questions without ever reading the text. This app forces active engagement by requiring text responses that the AI then scores and critiques.

The flow is:

1. Student picks a difficulty level (Beginner / Intermediate / Advanced)
2. A passage about honeybee biology is split into 4 short sections
3. After each section, 2 AI-generated comprehension questions appear
4. The student types a free-text answer. The AI scores it 0–100 with written feedback
5. Wrong answers surface the relevant excerpt from the passage alongside the model answer
6. After the final section, a synthesis question asks the student to integrate everything they have read across all four sections
7. A results page shows overall score, time taken, every answer with the model answer, and a "level up" option if they scored ≥ 85%

No account is needed. The whole session takes roughly 10–15 minutes.

---

## Approach

The app is built on Next.js 15 App Router with React 19 and TypeScript in strict mode. The core architecture separates concerns cleanly:

- **`SessionContext`** owns all in-session state (answers, chunk progress, difficulty). It is the single source of truth and is deliberately scoped to the `/read` route only.
- **`useReadingSession`** wraps the context and adds navigation helpers, keeping component logic thin.
- **`useQuestions`** handles the question fetch and answer submission lifecycle independently per chunk.
- **`PassageReader`** is the orchestrator — it composes everything and manages the display/progress split (a student can review past sections without affecting their progress index).
- **API routes** are thin validation wrappers. All AI logic lives in `src/lib/ai.ts` as a server-only module.

When the session ends, `PassageReader` serialises the `CompletedSession` to `sessionStorage` before routing to `/results`. This bridges the React context across the route transition without requiring a database.

---

## Setup

```bash
# 1. Clone the repo and install dependencies
npm install

# 2. Copy the example env file and add your Anthropic API key
cp .env.local.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY=<your key>

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other useful commands:

```bash
npm run build       # production build
npm run lint        # ESLint
npx tsc --noEmit    # type-check without building
```

---

## Design Decisions

**Free-text answers only.** Open answers are harder to fake and produce richer signals for the AI to work with.

**Bulk question generation.** On the first request for a given difficulty, a single Anthropic API call generates all 8 comprehension questions (2 per section × 4 sections) in one prompt. The result is cached in a module-level `Map` for the process lifetime. Sections 2–4 are instant cache hits - this halves perceived loading time and keeps API costs low.

**Synthesis question.** The final question cannot be answered from any single section - it requires integrating the whole passage. It is also differentiated by difficulty. Beginner summarises, Intermediate argues a position, Advanced analyses the emergent structure of the colony. The "Finish Reading" button is locked until this question is answered.

**Key insights after each section.** Once all questions for a section are answered, a "Key Takeaways" card appears before the student advances. This is a deliberate pause for consolidation rather than letting them rush forward.

**sessionStorage, not a database.** The app is stateless server-side. Session data lives in the browser's `sessionStorage` and survives page refresh but not a new tab — appropriate for a single-session tool with no login requirement.

---

## AI Strategy

All AI interaction goes through `src/lib/ai.ts`, a server-only module that wraps the Anthropic SDK.

### Question generation

```
Model:   claude-sonnet-4-5-20250929
Format:  Single API call, all 4 chunks in one prompt
Output:  JSON object keyed by chunk ID → array of questions
Cache:   Module-level Map<difficulty, questions> — cleared on server restart
```

The prompt instructs Claude to generate exactly 2 questions per section matched to the requested difficulty, with a clear expected answer and (for Beginner only) up to 3 progressive hints. The response is parsed with an `extractJSON` helper that strips markdown code fences before `JSON.parse`.

### Answer evaluation

```
Model:   claude-sonnet-4-5-20250929
Format:  One call per submitted answer
Output:  JSON — { score, feedback, correctAnswer, isCorrect }
Cache:   None (every answer is unique)
```

The system prompt establishes five scoring bands (90–100 full, 70–89 mostly correct, 50–69 partial, 30–49 minimal, 0–29 incorrect) and requires concise, constructive feedback. The model answer is always returned so the results page can display it even when the student's answer was correct.

A score ≥ 70 is treated as "correct" (`isCorrect: true`) throughout the UI.

### Synthesis evaluation

The synthesis question is a static `Question` object built from `SYNTHESIS_QUESTIONS[difficulty]` in `passage.ts`. It flows through the same `/api/evaluate-answer` route as every other question — no special handling needed because the route never inspects `chunkId`.

---

## Improvements

Given more time, the following would significantly strengthen the product:

**Streaming AI responses.** Currently the UI blocks until the entire evaluation JSON is ready (~3–4 seconds). Streaming the feedback text character-by-character would feel more like a tutor thinking out loud and reduce perceived wait time.

**Multiple passages.** The app is hard-coded to one passage. Abstracting the passage data model and adding a passage selection step would make it reusable for any text.

**Persistent accounts and progress history.** `sessionStorage` is cleared between sessions. A lightweight auth layer (e.g. Clerk) and a database (e.g. Postgres via Supabase) would let students track improvement over time and let teachers view class results.

**Teacher dashboard.** Aggregate score data across students by difficulty, section, and question would identify which parts of a passage or which question types cause most difficulty.

**Adaptive difficulty within a session.** If a student scores very high on the first two sections at Beginner, the remaining questions could silently upgrade to Intermediate difficulty rather than waiting until the next session.

**Automated tests.** The project has no test suite. Unit tests for `ai.ts` (mocking the Anthropic SDK), integration tests for the API routes, and end-to-end tests with Playwright would give confidence when the passage or prompt changes.

**Rate limiting.** The API routes currently have no rate limiting. Adding per-IP limits via Vercel's edge middleware would prevent abuse of the Anthropic API key.

---

## Time Spent

~10 hours total over two days

| Phase                                                                                    | Time     |
| ---------------------------------------------------------------------------------------- | -------- |
| Architecture & scaffolding (routing, context, types, session state)                      | 1.5h     |
| Passage content + AI prompt engineering (question generation, evaluation, scoring bands) | 1.5h     |
| Core reading flow (PassageReader, QuestionCard, AnswerInput, FeedbackPanel)              | 2.5h     |
| API routes + bulk question cache                                                         | 1h       |
| Results page (score derivation, answer review, level-up action)                          | 1h       |
| Polish (synthesis question, backward nav, skeleton loader, UX copy)                      | 1.5h     |
| Edge case testing + bug fixes                                                            | 0.5h     |
| Documentation                                                                            | 0.5h     |
| **Total**                                                                                | **~10h** |
