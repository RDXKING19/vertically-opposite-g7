# CrossQuest — Grade 7 · Vertically Opposite Angles
## Technical Requirements Document (TRD)

| | |
|---|---|
| **Companion PRD** | `CrossQuest_G7_Vertically_Opposite_Angles_PRD.md` |
| **Clone source** | `working-backwards-grade7-main.zip` (per `{{SPECIAL_INSTRUCTIONS}}` — **not** the blueprint's default `G2-Money-Money-main`) |
| **Repo name** | `g7-crossquest-vertically-opposite-angles` |
| **Status** | Build-ready. All generation logic below has been prototyped and stress-tested (results inline in §12). |

This TRD's job is reconciliation: the Intellia TRD blueprint describes a `useReducer`/`config+data`/`framer-motion` architecture that **the actual clone source does not use**. Per PRD §2, the clone source wins on architecture; the blueprint's fixed *mechanics* (audio pipeline shape, badge engine, gamification formulas, stress-test bar) are preserved but re-hosted on the zip's real file layout.

---

## 1. Reference Analysis Notes

### 1.1 What the zip actually is
- **Stack (real, from `package.json`):** React 18.3, Vite 5.3, Tailwind 3.4, `canvas-confetti` 1.9. **No** `framer-motion`, `lucide-react`, `oxlint`, `dotenv`, `node-fetch`. All animation is CSS keyframes/Tailwind transitions.
- **State:** `App.jsx` is a single component with **7 `useState` hooks** (`phase`, `muted`, `xp`, `worldResults`, `activeWorld`, `bestStreak`, `done`, `storySlideInfo`) and a plain `phase` string machine (`'intro' | 'wonder' | 'story' | 'simulate' | 'practice-worlds' | 'practice-quiz' | 'reflect'` + `done` boolean for celebration). **No reducer, no action types.**
- **Folders:** `src/stages/*Phase.jsx` (not `components/phases/`), `src/components/*` (TopNav, FlowDiagram, SimActivities), `src/mathData.js` (flat, not `data/questionBank.js` + `config/worlds.config.js`), `src/utils/{audio,narration,audioMap}.js`. **No** `config/`, `core/`, `hooks/`, `gamification/`, `quiz/` folders exist.
- **Question engine:** `mathData.js` exports `PRACTICE_WORLDS` (flat array, no `districtId`, no `boss` sub-object) and a single `makeQuestion(worldIndex)` that calls plain `Math.random()` — infinite generation, not a fixed 100-slot bank; **no `hint1`/`hint2`/`explanation`-as-reason split**, no schema `id`/`visualData`.
- **Diagram:** `FlowDiagram.jsx` renders a number-machine chain (`start —op→ ▢ —op→ end`) — entirely topic-specific to "Working Backwards" and **not reusable** for angle geometry.
- **Simulate:** `SimulatePhase.jsx` hard-codes **3 stations × 3 activities = 9** components from `SimActivities.jsx`, navigated by `nextActivity()`/`prevActivity()` with **no completion gating** (Next is always enabled; the sidebar's 🔓 icon is static decoration).
- **Practice:** `PracticeQuiz` in `PracticePhase.jsx` is a single fixed flow — 10 questions, 3 hearts, `10 × correctCount` XP shown as "score", **no modes, no hints, no badge system**, stars computed inline (`>=8→3, >=6→2, >=4→1`), feedback auto-dismisses via `setTimeout(…, 1000)` regardless of correct/incorrect.
- **Audio:** `utils/audio.js` implements the documented 3-tier pipeline (`audioMap` → live ElevenLabs → `speechSynthesis`) exactly as coded — **including the browser TTS fallback the blueprint forbids** (`speakFallback()`, wired into `narrate()`'s catch path). `utils/narration.js` exports **topic-bound function names** (`getStoryNarration(idx)`, `simulateIntro(station, actIdx)`, `practiceCorrectNarration(n)`, `practiceWrongNarration(qIndex)`, `getAllNarration()`, etc.) that do **not** match the blueprint's fictional names (`storyNarration`, `simStationIntro`, `playCorrectNarration`…). `scripts/generate_audio.js` and `scripts/clean_audio.js` are exactly as documented and are reused verbatim.
- **Styling:** `index.css` (not `styles/design-tokens.css` + `styles/globals.css` — one file) defines the full token set (`--bg-cosmic`, `--color-*`, `--space-*`, `--fs-*`, `.glass-card`, `.btn-gold`, `.phase-band--*`) plus a `@media (max-height: 800px)` compact-Simulate rule. No `.oxlintrc.json`, no `vercel.json`, no `.env.local.example`.

### 1.2 Blueprint "known gotchas" — checked against this actual repo

| # | Blueprint gotcha | Found here? | Action |
|---|---|---|---|
| 1 | Unused duplicate `src/features/*` | **Not present.** Single `src/components` + `src/stages` tree, all wired. | No action. |
| 2 | Hardcoded story-panel count in the reducer | **No reducer exists**, but `StoryPhase.jsx` (confirmed by reading its body) drives panel count from `STORY.length`, so it is **already dynamic**. The *narration* side is not: `narration.js`'s `STORY` array and `getStoryNarration(idx)` are hand-indexed per panel, so panel count must still be kept in sync manually across `stories.js` and `narration.js` when authoring content. | Author both to 6 panels; no code generalization needed, but flagged in §5.3 as an authoring discipline, not a bug. |
| 3 | Static vs. procedural bank | `makeQuestion()` is procedural but **unbounded/unseeded**, with no fixed schema, no `hint1/hint2`, no QA harness. | Rebuild as a **fixed 100-slot, schema-complete, QA-stress-tested** generator (§6). |
| 4 | Viewport clipping (`top:70px` + `100vh`) | **Confirmed, different shape:** `TopNav` is `position: fixed`, and `App.jsx`'s `<main>` gets a **hardcoded `pt-12` (48px)** regardless of the nav's real height — which grows by ~44px whenever `slideInfo` (the Story progress bar) is shown. `body`/`.app-container` are pinned to `100vh` with `overflow: hidden`. On any viewport where the two-row nav wraps (narrow widths) or during Story, content clips under the nav. | Fix per §10.3: `ResizeObserver` on the nav + `dvh` units + CSS var for header height, applied to `<main>`'s padding-top. |
| 5 | Leftover branding | **Confirmed:** `README.md` title "Working Backwards · Grade 7"; `index.html` `<title>` (to be checked/replaced); narration/story content reference "Zara", "Leo", "Mia", "Zoe", "Sam" (Working-Backwards cast); `PracticeWorldSelect` header text hardcodes "Working Backwards Game Worlds". `WonderPhase`/`ReflectPhase` reference a "Robo" mascot/🤖, `IntroModal` uses a different mascot again (⏪ in `BgSymbols`, plus a lion 🦁 seen in Story) — **three inconsistent mascots**, none of them the blueprint's Tally the Owl. | Purge all of the above; see §1.3 and §5. |

### 1.3 Additional defects found (not in the blueprint's list, still must not ship)
- **`bestStreak` is mislabelled.** `App.finishQuiz` does `setBestStreak(b => Math.max(b, starsEarned))` — it stores the **best star count**, not a streak, yet `ReflectPhase` displays it as "Best Streak". CrossQuest needs a *real* streak counter (§4.2, §9).
- **Feedback UX loses the explanation.** Both correct and incorrect popups auto-close after exactly 1000 ms via `setTimeout`, so a student cannot finish reading a multi-clause geometric explanation before it vanishes.
- **Mandatory-vs-optional Reflect text.** `ReflectPhase.jsx`'s final step requires ≥10 characters typed before "Complete Lesson" enables (confirmed in the tail of the file). CrossQuest's blueprint wants this optional (PRD §7.6, ⚑ open question 5).
- **Missing favicon.** `index.html` references `/favicon.svg`; no such file exists in `public/`.
- **`.png` files are actually JPEGs.** `public/assets/images/slide{1..8}.png` are JPEG-encoded (confirmed via `PIL.Image.format` during review). New placeholders must be genuine PNGs.
- **41 orphaned audio files** plus the matching `audioMap.js` are Working-Backwards content and must be purged, not carried forward as "extra" narration.

---

## 2. Tech Stack (reused verbatim from the clone source — no version bumps)

```json
{
  "name": "g7-crossquest-vertically-opposite-angles",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "generate-audio": "node scripts/generate_audio.js",
    "clean-audio": "node scripts/clean_audio.js"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "canvas-confetti": "^1.9.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}
```
`vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.gitignore` — copy as-is. No `oxlint`/lint script exists in the source; none is added (out of scope for a content-swap build). A new `.env.local.example` is added (source has none) documenting `VITE_ELEVENLABS_API_KEY` with no real key committed.

---

## 3. Folder Structure (real tree; ✅ reuse as-is · ✏️ modify · 🆕 new)

```
g7-crossquest-vertically-opposite-angles/
├── index.html                          ✏️ <title>, favicon link, meta description
├── package.json / vite.config.js / tailwind.config.js / postcss.config.js / .gitignore   ✅
├── .env.local.example                  🆕 VITE_ELEVENLABS_API_KEY=
├── README.md                           ✏️ module-specific + art-brief
├── api/
│   └── elevenlabs.js                   🆕 serverless proxy (see §11.2) — only if hosting supports it
├── public/
│   ├── favicon.svg                     🆕 (missing in source)
│   └── assets/
│       ├── audio/                      🆕 generated by npm run generate-audio (source's 41 mp3s deleted first)
│       └── images/
│           └── slide1.png … slide6.png 🆕 genuine PNGs, 1024×1024 (source's mislabeled JPEGs replaced)
├── scripts/
│   ├── generate_audio.js               ✅ reuse verbatim (reads getAllNarration())
│   └── clean_audio.js                  ✅ reuse verbatim
└── src/
    ├── main.jsx                        ✅
    ├── index.css                       ✏️ add --world-0…9, --color-priya/--color-weiming/--color-tally
    ├── App.jsx                         ✏️ hybrid state (§4), header-height fix (§10.3), branding purge
    ├── components/
    │   ├── TopNav.jsx                  ✏️ BgSymbols content swapped to angle/geometry glyphs; header ResizeObserver
    │   ├── AngleDiagram.jsx            🆕 replaces FlowDiagram.jsx — SVG angle renderer (§6.4)
    │   └── SimActivities.jsx           🆕 rewritten: 4 station components (§7), replaces the 9 Working-Backwards activities
    ├── stages/
    │   ├── IntroPhase.jsx              ✏️ copy + Tally mascot only
    │   ├── WonderPhase.jsx             ✏️ copy + Tally mascot only
    │   ├── StoryPhase.jsx              ✏️ content-only (already panel-count-agnostic per §1.2)
    │   ├── SimulatePhase.jsx           ✏️ 4-station STATIONS array, sequential gating added (§7.1)
    │   ├── PracticePhase.jsx           ✏️ mode select, hints, badge hooks, hearts scoped to Boss (§8)
    │   └── ReflectPhase.jsx            ✏️ 3 new recap questions, optional reflection, real streak, trophies/badges shelf
    ├── data/
    │   ├── worlds.js                   🆕 10-world config table (PRD §8)
    │   ├── characters.js               🆕 Priya / Wei Ming / Tally
    │   ├── badges.js                   🆕 8 badge defs + 10 boss trophy defs
    │   └── story.js                    🆕 6-panel STORY array (replaces narration.js's inline STORY)
    ├── engine/
    │   ├── angleMath.js                🆕 pure geometry/algebra helpers (§6.1 — tested)
    │   ├── distractors.js              🆕 option-builder + misconception library (§6.2 — tested)
    │   ├── questionBank.js             🆕 100-slot generator, replaces mathData.js (§6.3)
    │   ├── scoring.js                  🆕 calcStars / calcXP / streak (§9.1 — tested)
    │   └── toSpoken.js                 🆕 symbol→words converter for narration (§8.3 — tested)
    └── utils/
        ├── audio.js                    ✏️ delete speakFallback()/speechSynthesis path (§8.2)
        ├── audioMap.js                 🆕 auto-generated by generate-audio (source's map discarded)
        └── narration.js                ✏️ same exported function names, new topic-specific bodies (§8.1)
```

`mathData.js` and `FlowDiagram.jsx` are **deleted**, not kept alongside the new files — they are 100% Working-Backwards-specific and reusing them "as-is" per the blueprint's default instinct would be wrong for this topic (this is the one place the PRD blueprint's "reuse every non-topic file verbatim" rule doesn't apply, because these two files *are* topic content, just miscategorised as infrastructure by their filenames).

---

## 4. State Management

### 4.1 Decision (PRD §2, R4)
Keep `App.jsx`'s **phase navigation as `useState`** (it works, and the blueprint's 16-action reducer doesn't exist in this codebase to extend). Add **one `useReducer`** for everything gamification-related, since XP/streak/badges/trophies need atomic, testable transitions that seven independent `useState` calls made buggy in the source (`bestStreak` bug, §1.3).

### 4.2 `src/engine/progressReducer.js` (new)
```js
export const initialProgress = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  worldStars: Array(10).fill(null),   // best stars per world, across modes
  boss: Array(10).fill(false),        // trophy earned per world
  badges: {},                          // { badgeId: true }
  simStationsDone: [false, false, false, false],
  questionsAnsweredInPractice: 0,
};

export function progressReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT': {
      const streak = state.streak + 1;
      return {
        ...state,
        xp: state.xp + action.xpGained,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        questionsAnsweredInPractice: state.questionsAnsweredInPractice + 1,
      };
    }
    case 'ANSWER_WRONG':
      return { ...state, streak: 0, questionsAnsweredInPractice: state.questionsAnsweredInPractice + 1 };
    case 'FINISH_WORLD': {
      const worldStars = [...state.worldStars];
      worldStars[action.worldIndex] = Math.max(worldStars[action.worldIndex] ?? 0, action.stars);
      return { ...state, worldStars };
    }
    case 'WIN_BOSS': {
      const boss = [...state.boss]; boss[action.worldIndex] = true;
      return { ...state, boss };
    }
    case 'COMPLETE_SIM_STATION': {
      const s = [...state.simStationsDone]; s[action.stationIndex] = true;
      return { ...state, simStationsDone: s };
    }
    case 'UNLOCK_BADGE':
      return state.badges[action.badgeId] ? state : { ...state, badges: { ...state.badges, [action.badgeId]: true } };
    case 'RESET':
      return initialProgress;
    default:
      return state;
  }
}
```
`App.jsx` mounts `const [progress, dispatch] = useReducer(progressReducer, initialProgress)` alongside the existing `phase` state machine; `resetProgress()` becomes `dispatch({ type: 'RESET' })`. Badge triggers (§9.2) are evaluated in a small `checkBadges(progress, event)` pure function called right after each dispatch, mirroring the blueprint's `badgeEngine.js` contract without inventing an unused reducer action set.

### 4.3 Phase state (kept from source, unchanged shape)
`phase ∈ {'intro','wonder','story','simulate','practice-worlds','practice-quiz','reflect'}` + `done`. `PracticeQuiz` additionally needs a `mode` prop (`'guided'|'independent'|'timed'|'boss'`) and a `worldIndex`, selected via a new `ModeSelectModal` inserted between `practice-worlds` and `practice-quiz` (own local `useState` inside `PracticeWorldSelect`, no global phase needed).

---

## 5. Component Specs (phase by phase)

### 5.1 `IntroPhase.jsx` — content-only
Replace copy per PRD §6.3: title "Vertically Opposite **Angles**", tagline, 3 feature cards (Spot the Twins / Simulations / 10 Game Worlds), Tally 🦉 speech pill. No structural change; same `IntroModal({ onBegin })` signature.

### 5.2 `WonderPhase.jsx` — content-only
Renders the scissors hook (PRD §7.2). The 40°/? big-number display reuses the source's `.text-number` styling. Mascot references switched to Tally 🦉 (removes the "Robo" string found in the source).

### 5.3 `StoryPhase.jsx` — content-only, authoring discipline
No code change (panel count already derives from array length). **Authoring rule:** `data/story.js`'s array length and `utils/narration.js`'s `STORY` array must both be exactly 6 entries, index-aligned — this is the manual-sync risk noted in §1.2 item 2, mitigated by a build-time assertion:
```js
// src/engine/__checks.js (imported once in main.jsx, dev-only)
import { STORY_PANELS } from '../data/story.js';
import { getStoryNarration } from '../utils/narration.js';
if (import.meta.env.DEV) {
  STORY_PANELS.forEach((_, i) => {
    if (!getStoryNarration(i)?.length) console.warn(`[CrossQuest] panel ${i} has no narration`);
  });
}
```

### 5.4 `SimulatePhase.jsx` — 4 stations, sequential gating (structural change)
```js
const STATIONS = [
  { id: 1, icon: '🔬', name: 'Scissor Lab', sub: 'Discover why opposite angles match', Comp: ScissorLab },
  { id: 2, icon: '🏗️', name: 'Junction Builder', sub: 'Swing a road to hit the target', Comp: JunctionBuilder },
  { id: 3, icon: '🕸️', name: 'Hub Designer', sub: 'Solve and justify a three-line hub', Comp: HubDesigner },
  { id: 4, icon: '🕵️', name: 'Case of the Wrong Working', sub: 'Find the seeded mistake', Comp: ErrorDetective },
];
```
Deltas from the source `SimulatePhase`:
- `station` (1–4) replaces `station`+`actIdx` (no inner activity dimension).
- Each station renders `<ActivityComp onComplete={() => { dispatch({type:'COMPLETE_SIM_STATION', stationIndex: id-1}); }} />` (source has no `onComplete` callback at all — Next was always enabled).
- Sidebar tab icon becomes 🔒 (locked, `disabled`) → 🔓 (unlocked, unvisited) → ✅ (`simStationsDone[i]`), computed as `i === 0 || simStationsDone[i-1]`.
- Footer "Next Station →" is `disabled={!simStationsDone[station-1]}`; label becomes "Go to Practice Phase" only on station 4 **and** `simStationsDone[3]`.
- "Activity n of 3" chip text removed (no inner activity count).

### 5.5 `AngleDiagram.jsx` — new (§6.4 for the math backing it)
Single component replacing `FlowDiagram.jsx`, used by both the Simulate stations and `PracticeQuiz`'s question card:
```jsx
export function AngleDiagram({ figure, size = 220, accent = 'cyan', ariaLabel }) {
  // figure: { type: 'cross'|'hub', theta, rotation, labels, showAngles: string[], unknown?: string }
  ...
}
```
Renders two (or three, for `type:'hub'`) full-diameter lines through a centred vertex O, arcs for the angles listed in `showAngles` (drawn via the tested `crossGeometry`/hub-geometry helpers, §6.4), a `?` glyph on the `unknown` sector, and ray-end labels (A/B/C/D or A–F). `role="img"` + `aria-label={ariaLabel}` for screen readers (PRD §11).

### 5.6 `PracticePhase.jsx` — modes, hints, badges (structural change, §8)
### 5.7 `ReflectPhase.jsx` — new recap, real streak, optional reflection, trophy/badge shelf (§9.3)

---

## 6. Data Layer

### 6.1 `engine/angleMath.js` — core geometry/algebra helpers (tested, see §12)
```js
export const MIN_ANGLE = 20, MAX_ANGLE = 160;
export const RIGHT_LO = 85, RIGHT_HI = 95;

export const makeRng = (seed = Date.now()) => {           // mulberry32 — deterministic for tests
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
export const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

export const straightPartner = t => 180 - t;
export const isCleanAngle = (t, { allowRight = false } = {}) =>
  Number.isInteger(t) && t >= MIN_ANGLE && t <= MAX_ANGLE && (allowRight || t < RIGHT_LO || t > RIGHT_HI);

/** θ for a two-line crossing; both θ and 180°−θ land in the clean range. */
export function pickCrossAngle(rng, { multipleOf5 = false, allowRight = false } = {}) {
  for (let i = 0; i < 500; i++) {
    const t = multipleOf5 ? 5 * randInt(rng, 4, 32) : randInt(rng, MIN_ANGLE, MAX_ANGLE);
    if (isCleanAngle(t, { allowRight }) && isCleanAngle(180 - t, { allowRight }) && (allowRight || t !== 90)) return t;
  }
  return 65; // proven fallback
}

export const evalExpr = (e, x) => e.a * x + e.b;
export const exprText = e => {
  const ax = e.a === 1 ? 'x' : `${e.a}x`;
  return e.b === 0 ? ax : e.b > 0 ? `${ax} + ${e.b}` : `${ax} − ${-e.b}`;
};

/** VOA equation e1(x) = e2(x): integer x∈[4,30], distinct coefficients, both sides evaluate
 *  to a single clean angle, x itself never equals the angle value (prevents answer confusion). */
export function makeVoaEquation(rng) {
  for (let i = 0; i < 2000; i++) {
    const x = randInt(rng, 4, 30);
    const a1 = randInt(rng, 1, 6), a2 = randInt(rng, 1, 6);
    if (a1 === a2) continue;
    const b1 = randInt(rng, -30, 60);
    const angle = a1 * x + b1;
    const b2 = angle - a2 * x;
    if (b1 === 0 || b2 === 0 || Math.abs(b2) > 60) continue;
    if (!isCleanAngle(angle) || angle === x || !isCleanAngle(180 - angle)) continue;
    return { x, angle, e1: { a: a1, b: b1 }, e2: { a: a2, b: b2 } };
  }
  return { x: 15, angle: 55, e1: { a: 3, b: 10 }, e2: { a: 5, b: -20 } }; // proven fallback (PRD §7.3 worked example)
}

/** Three-line hub: α+β+γ = 180°, distinct, all clean, none a right angle (§8.2 hub rule). */
export function makeHub(rng) {
  for (let i = 0; i < 2000; i++) {
    const a = 5 * randInt(rng, 4, 20), b = 5 * randInt(rng, 4, 20), c = 180 - a - b;
    if (c < MIN_ANGLE || c % 5 !== 0) continue;
    if (new Set([a, b, c]).size < 3) continue;
    if ([a, b, c].some(v => v >= RIGHT_LO && v <= RIGHT_HI)) continue;
    return { a, b, c };
  }
  return { a: 40, b: 65, c: 75 };
}
```

### 6.2 `engine/distractors.js` — option builder + misconception library (tested)
```js
import { MC } from './misconceptions.js'; // MC-1..MC-10 text templates, PRD §8.3

export function buildOptions(rng, correct, candidates, { lo = 10, hi = 350, fmt = v => `${v}°` } = {}) {
  const seen = new Set([correct]); const wrong = [];
  const ok = c => Number.isInteger(c) && c >= lo && c <= hi && !seen.has(c);
  for (const c of candidates) { if (wrong.length < 3 && ok(c)) { seen.add(c); wrong.push(c); } }
  for (const d of [5, -5, 10, -10, 15, -15, 20, -20]) { if (wrong.length < 3 && ok(correct + d)) { seen.add(correct + d); wrong.push(correct + d); } }
  if (wrong.length < 3) throw new Error('cannot build 3 distractors for ' + correct);
  const raw = [correct, ...wrong];
  for (let i = raw.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [raw[i], raw[j]] = [raw[j], raw[i]]; }
  return { options: raw.map(fmt), correctAnswer: fmt(correct) };
}

/** MC-1..MC-8 numeric candidate generators for a simple crossing θ (see PRD §8.3). */
export const misconceptionCandidates = theta => [
  180 - theta,            // MC-1 supplementary
  90 - theta,              // MC-2 complementary
  360 - theta,              // MC-3 reflex
  theta * 2,                // MC-4 doubling
  Math.round(theta / 2),    // MC-4 halving
];
```

### 6.3 `engine/questionBank.js` — 100-slot generator (replaces `mathData.js`)
```js
export const WORLDS = /* imported from data/worlds.js, PRD §8 table */;

const TEMPLATES = {
  naming:     [tNameVertex, tNameAngle, tSameAngleName, tCountAngles, tOppositeRay],
  identify:   [tWhichIsOpposite, tWhichPairIsVOA, tAdjacentVsOpposite, tBentLineTrap],
  equal:      [tFindOppositeAcute, tFindOppositeObtuse, tFindViaBOC_DOA, tFindNonMultipleOf5],
  supplement: [tStraightPartner, tStraightPartnerExpr, tSumOfAdjacentPair],
  'all-four': [tOneToAnother, tSumOfTwo, tSumAllFour, tRightAngleCross],
  reasoning:  [tReasonForStep, tMissingProofLine, tTrueFalseStatement, tSpotWeiMingsFlaw],
  algebra:    [tVoaSimple, tVoaCoeff, tVoaTwoSided, tVoaFindAngleNotX, tVoaPlusStraightLine],
  context:    [tRoadScenario, tRoadScenarioOtherCorner, tScissorsScenario, tAlgebraInScenario],
  'three-lines': [tHubFindGamma, tHubFindTwin, tHubSum, tHubAlgebra],
  finale:     [tFinaleMixed], // draws one hardest variant from worlds 1-8, PRD §8.1
};

/** Deterministic-shape, runtime-random content: slot (worldIdx, slotIdx) -> question. */
export function makeQuestion(worldIndex, slotIndex, rng = makeRng()) {
  const world = WORLDS[worldIndex];
  const templatesForWorld = TEMPLATES[world.conceptFocus];
  const template = templatesForWorld[slotIndex % templatesForWorld.length];
  const q = template(rng, slotIndex);                 // returns { prompt, correct, distractorCandidates, explanation, ruleTag, figure }
  const { options, correctAnswer } = buildOptions(rng, q.correct, q.distractorCandidates);
  return {
    id: `${worldIndex}-${slotIndex}`,
    worldId: worldIndex,
    category: world.conceptFocus,
    visual: q.figure?.type ?? null,
    questionText: q.prompt,
    options,
    correctAnswer,
    explanation: q.explanation,
    hint1: q.hint1,
    hint2: q.hint2,
    visualData: q.figure ?? null,
    ruleTag: q.ruleTag,
  };
}

export function buildWorldBank(worldIndex, rng = makeRng()) {
  return Array.from({ length: 10 }, (_, slot) => makeQuestion(worldIndex, slot, rng));
}
```
Schema matches the PRD blueprint's fixed shape (§B.3 of the PRD blueprint / TRD blueprint §3.3) with two additions the zip's UI needs: `ruleTag` (shown as the gold pill above the question, mirroring the source's `qData.ruleTag`) and `visualData` populated for every slot (this topic is diagram-first — unlike Working Backwards, every question needs `AngleDiagram`).

Each `t*` template function is a pure `(rng, slotIndex) => {...}` built from §6.1/§6.2's helpers plus the slot-ramp descriptions in PRD §8.1 (e.g. `tVoaSimple` calls `makeVoaEquation(rng)` directly; `tHubFindGamma` calls `makeHub(rng)`). Templates read the slot's difficulty tier off `slotIndex` (PRD §8, "difficulty tiers 1,1,1,2,2,2,3,3,4,4") to widen the number range or switch to non-multiple-of-5 angles on later slots.

### 6.4 Diagram geometry (backs `AngleDiagram.jsx`, tested)
```js
/** Two-line crossing at O, rotated by `rotation`°. Returns ray angles, sector sizes,
 *  a point() helper and an arc() path-builder for four labelled sectors A-B-C-D. */
export function crossGeometry(theta, rotation = 0, R = 100) {
  const rays = { A: rotation, B: rotation + theta, C: rotation + 180, D: rotation + 180 + theta };
  const angles = { AOB: theta, BOC: 180 - theta, COD: theta, DOA: 180 - theta };
  const pt = d => [R * Math.cos(d * Math.PI / 180), -R * Math.sin(d * Math.PI / 180)];
  const arc = (from, to, r) => {
    const [x1, y1] = [r * Math.cos(from * Math.PI / 180), -r * Math.sin(from * Math.PI / 180)];
    const [x2, y2] = [r * Math.cos(to * Math.PI / 180), -r * Math.sin(to * Math.PI / 180)];
    const large = ((to - from) % 360 + 360) % 360 > 180 ? 1 : 0;
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  return { rays, angles, pt, arc, sweep: (a, b) => ((rays[b] - rays[a]) % 360 + 360) % 360 };
}
```
`AngleDiagram` draws the two/three full-diameter `<line>`s from `pt(ray)` through O to `pt(ray+180)`, an `<path d={arc(...)}>` per requested sector at a small inset radius (e.g. `R*0.35`), a `<text>` value or `?` at the arc's midpoint, and `<text>` ray-end labels at `pt(ray * 1.15)`. A three-line `hub` variant extends `rays` with a third pair (E, F) at `rotation + α`/`rotation + 180 + α`.

**Verified invariant** (§12): for any generated `theta`/`rotation`, `sweep('A','B') === theta`, `sweep('C','D') === theta`, `sweep('B','C') === sweep('D','A') === 180 - theta`, summing to exactly 360 — i.e. the rendered SVG is provably geometrically accurate, satisfying PRD §13 acceptance criterion 6.

---

## 7. Simulate Station Specs

Fixed per-station contract (per the TRD blueprint §3.6, re-hosted on this repo's actual prop shape):
```jsx
<StationComponent onComplete={() => void} />
```
Self-contained state; no dependency on `progressReducer` beyond calling `onComplete` once its own gate condition is met (mirrors `SimulatePhase`'s existing `key={station}-${actIdx}` remount-on-change pattern, now `key={station}`).

### 7.1 `ScissorLab.jsx` (Concept Discovery)
- State: `opening° (20–160, default 90)`, `openLog: number[]` (distinct openings tried), `proofStep (0–3)`, `spun: boolean`, `confirmAnswered: boolean`.
- Slider `<input type="range" min={20} max={160} step={1}>` **plus** explicit `−5°`/`+5°` buttons (keyboard parity, PRD §11).
- Renders `<AngleDiagram figure={{ type:'cross', theta: opening, rotation: 0, labels:['a','b','c','d'] }} />`; live readouts computed from `angleMath` (`straightPartner`).
- "Spin 180° ↻" animates `rotation` 0→180 over 600 ms via `requestAnimationFrame` (instant if `prefers-reduced-motion`), then shows a "ghost" overlay of the pre-spin ∠AOB shape at ∠COD's position to visually confirm the match.
- Gate: `new Set(openLog.filter(...)).size >= 5 (each ≥10° apart) && proofStep === 3 && confirmAnswered === true`.

### 7.2 `JunctionBuilder.jsx` (Build-to-Target)
- State: `round (0–2)`, `angle° (20–160)`, `locked: boolean[3]`, `tries: number`.
- Targets from PRD §7.4: R1 NE=65° exact; R2 SW=130° (via VOA: NE=130°); R3 NE+SW=84° (NE=42°). Tolerance ±1° via `Math.abs(angle - target) <= 1`.
- Status chip derived purely from `angle - target` (no hidden state) — `"Too big by Nn°"` / `"Too small by Nn°"` / `"✓ Locked in!"`.
- Gate: `locked.every(Boolean)`.

### 7.3 `HubDesigner.jsx` (Composite Construction)
- Uses `makeHub()`-shaped fixed data for the two PRD-specified hubs (∠AOB=40°/∠BOC=65° and ∠AOB=35°/∠BOC=45°, giving 100° per PRD's corrected §8 hub rule check).
- State per hub: `sectorValues: {sector: number|null}`, `sectorReasons: {sector: reasonId|null}`, `totalChecked: boolean`.
- "Check total" sums all six sectors and must equal 360 before enabling; reason chips are one of the three PRD §7.4 reason strings, validated against a fixed answer key per sector.
- Gate: both hubs' `sectorValues` and `sectorReasons` fully correct **and** `totalChecked` true at least once each.

### 7.4 `ErrorDetective.jsx` (Error-Detective)
- 3 fixed cases (PRD §7.4, MC-1/MC-9/MC-8 misconceptions). State: `caseIdx (0–2)`, `found: boolean[3]`, `fixed: boolean[3]`.
- Tap-to-select the faulty line (button per line, `aria-pressed`), then a 3-option corrected-line picker.
- Gate: `found.every(Boolean) && fixed.every(Boolean)`.

All four stations import `AngleDiagram`/`angleMath` — no duplicated geometry code, satisfying the blueprint's "math logic exists in exactly one place" requirement (TRD blueprint §3.3).

---

## 8. Audio Pipeline

### 8.1 `utils/narration.js` — same exported names as the source, new bodies
Kept identical so no calling code in `stages/*.jsx` changes shape:
```js
export function wonderNarration() { ... }                     // Wonder hook + Tally question (PRD §7.2)
export function getStoryNarration(idx) { ... }                 // STORY[idx], PRD §7.3, 6 entries
export function simulateIntro(stationIdx) { ... }               // per-station intro line, replaces (station, actIdx) — 1 arg now, no activities dimension
export function simDoneNarration(stationIdx) { ... }
export function practiceCorrectNarration(correctCount) { ... }  // ties to explanation text
export function practiceWrongNarration(qIndex) { ... }
export function reflectQuestionNarration(idx) { ... }
export function reflectCompleteNarration() { ... }
export function celebrationNarration() { ... }
export function getAllNarration() { ... }                       // dedupes by .text, feeds generate_audio.js
```
Every string above is authored by hand in §7 of the PRD (Story panels), §7.4 (station descriptions), §7.5/§9 (practice/badge lines) — this file has no procedural text, only the dynamic **question** narration (below) varies at runtime.

### 8.2 `utils/audio.js` — delete the browser-TTS fallback (blueprint §A.4 / PRD R10)
```diff
- function speakFallback(seg, myQueue) { ... window.speechSynthesis.speak(utter) ... }
  ...
- const played = url ? await playUrl(url) : false;
- if (!played && myQueue === currentQueue && !audioMuted) {
-   await speakFallback(seg, myQueue);
- }
+ await (url ? playUrl(url) : Promise.resolve(false));
  // If both audioMap and the live ElevenLabs fetch fail, playback silently
  // stops for this segment — the module never falls back to a synthetic voice.
```
Everything else in `audio.js` (`getAudioUrl` static-first-then-dynamic resolution, `narrate()`'s i+1 eager preloading, `STYLE_SETTINGS`, `say/ask/cheer/emphasize/think/celebrate/instruct` helpers, `setMuted`/`stopNarration`) is reused verbatim — it already matches the blueprint's mandated pipeline mechanics exactly.

### 8.3 `engine/toSpoken.js` — dynamic question narration (tested, see §12)
Converts on-screen question strings to spoken form per PRD §10, so `PracticeQuiz`'s "🔊 Read question" button and any dynamic ElevenLabs call never speak a raw symbol:
```js
const ABBR = [[/vert\. opp\./gi,'vertically opposite'],[/adj\./gi,'adjacent'],[/str\. line/gi,'straight line'],[/\bpt\b/g,'point']];
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numberToWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n/10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  return ONES[Math.floor(n/100)] + ' hundred' + (n % 100 ? ' and ' + numberToWords(n % 100) : '');
}
const numTok = s => s.includes('.')
  ? (([i,d]) => numberToWords(+i) + ' point ' + [...d].map(c => ONES[+c]).join(' '))(s.split('.'))
  : numberToWords(+s);

export function toSpoken(t) {
  let s = t;
  for (const [re, w] of ABBR) s = s.replace(re, w);
  s = s.replace(/∠s\b/g, 'angles').replace(/∠([A-Z])([A-Z])([A-Z])/g, (_, a, b, c) => `angle ${a} ${b} ${c}`);
  s = s.replace(/\b(NE|NW|SW|SE)\b/g, m => ({NE:'north-east',NW:'north-west',SW:'south-west',SE:'south-east'}[m]));
  s = s.replace(/(\d+(?:\.\d+)?)\s*x(?![A-Za-z])/g, (_, n) => `${numTok(n)} x`);
  s = s.replace(/(\d+(?:\.\d+)?)°(?= (?:angle|corner|turn)\b)/g, (_, n) => `${numTok(n)}-degree`);
  s = s.replace(/(\d+(?:\.\d+)?)°/g, (_, n) => `${numTok(n)} ${+n === 1 ? 'degree' : 'degrees'}`).replace(/\)°/g, ') degrees');
  s = s.replace(/\s*→\s*/g, ' so ').replace(/[()]/g, ' ');
  s = s.replace(/\s*=\s*/g,' equals ').replace(/\s*\+\s*/g,' plus ').replace(/\s*[−–]\s*/g,' minus ')
       .replace(/\s*×\s*/g,' times ').replace(/\s*÷\s*/g,' divided by ');
  s = s.replace(/(?<!\w|\d\.)(\d+(?:\.\d+)?)(?!\w|\.\d)/g, (_, n) => numTok(n));
  return s.replace(/\s+([,.!?:;])/g,'$1').replace(/\s{2,}/g,' ').trim();
}
export const BAD_SPOKEN = /[\d°∠=+−×÷→()%]/;  // dev-time assertion: toSpoken(x) must never match this
```
`BAD_SPOKEN` is asserted against **every** static narration line at dev-build time (extends the `__checks.js` pattern in §5.3), catching any symbol accidentally left in hand-authored copy — a stronger guarantee than the source's "spoken text is a hand-typed English paraphrase, hope it stays in sync" approach.

### 8.4 `scripts/generate_audio.js` / `clean_audio.js` — reused verbatim
Unchanged; they already read `getAllNarration()` generically. Run order after content lock: delete `public/assets/audio/*.mp3` and the stale `audioMap.js` → `npm run generate-audio` → `npm run clean-audio`.

---

## 9. Gamification

### 9.1 `engine/scoring.js` (tested, see §12)
```js
export const calcStars = (correct, total) =>
  total <= 0 ? 0 : correct*100 >= 90*total ? 3 : correct*100 >= 70*total ? 2 : correct*100 >= 50*total ? 1 : 0;

export const calcXP = ({ attempt = 1, hintsUsed = 0, streak = 1 }) => {
  const base = Math.max(3, (attempt === 1 ? 10 : attempt === 2 ? 6 : 3) - 2 * hintsUsed);
  const bonus = streak >= 3 ? Math.min(10, 2 * (streak - 2)) : 0;
  return base + bonus;
};
```
Verified against the blueprint's 10-question thresholds exactly (9–10→3★, 7–8→2★, 5–6→1★) and scales correctly to Guided (5Q) and Timed (8Q) modes (§12 table). This is the concrete formula PRD §9 flags as ⚑ needing stakeholder confirmation against the original `G2` `scoring.js`, which this repo doesn't contain to diff against directly.

### 9.2 `data/badges.js` — 8 triggers + 10 trophies
```js
export const BADGES = [
  { id:'first-crossing',   name:'First Crossing',        emoji:'✖️', trigger: p => p.questionsAnsweredInPractice >= 1 },
  { id:'five-lane',        name:'Five-Lane Streak',       emoji:'🛣️', trigger: p => p.streak >= 5 },
  { id:'perfect-intersect', name:'Perfect Intersection',  emoji:'🎯', trigger: p => p.streak >= 10 },
  { id:'master-surveyor',  name:'Master Surveyor',        emoji:'📐', trigger: p => p.simStationsDone.every(Boolean) },
  { id:'three-star',       name:'Three-Star Surveyor',    emoji:'⭐', trigger: p => p.worldStars.some(s => s === 3) },
  { id:'boss-of-crossroads', name:'Boss of the Crossroads', emoji:'👑', trigger: p => p.boss.some(Boolean) },
  { id:'road-warrior',     name:'Road Warrior',           emoji:'🚧', trigger: p => p.questionsAnsweredInPractice >= 20 },
  { id:'voa-master',       name:'Opposite Angles Master', emoji:'🏆', trigger: (p, done) => !!done },
];
export const TROPHIES = /* 10 entries, {worldIndex, bossName, bossEmoji, reward}, from PRD §8 table */;
```
`checkBadges(progress, { justCompletedJourney }) { BADGES.forEach(b => { if (!progress.badges[b.id] && b.trigger(progress, justCompletedJourney)) dispatch({type:'UNLOCK_BADGE', badgeId:b.id}); showToast(b); }); }` called from `App.jsx` after every `dispatch` that could move a trigger (answer, sim-complete, boss-win, journey-complete).

### 9.3 `ReflectPhase.jsx` changes
- 3 new recap questions (verbatim from PRD §7.6) replace the source's Working-Backwards recap.
- `bestStreak` now reads `progress.bestStreak` (real streak, fixing §1.3's bug) instead of max-stars.
- Reflection textbox: `required` attribute **removed**; "Complete Lesson 🎉" `disabled` only while the 3 recap questions are unanswered, not on textbox length.
- New "Boss Trophies" row (10 slots, trophy or 🔒) and "Badge Shelf" (8 slots) rendered above the existing scoreboard, both glass-panel styled to match the source's card language.

---

## 10. Design Tokens & Viewport

### 10.1 `index.css` additions
```css
:root {
  /* 10 world accents, PRD §8 table */
  --world-0:#22d3ee; --world-1:#a78bfa; --world-2:#f472b6; --world-3:#fb923c; --world-4:#4ade80;
  --world-5:#facc15; --world-6:#38bdf8; --world-7:#f87171; --world-8:#c084fc; --world-9:#fde047;
  --color-priya:#fb923c; --color-weiming:#38bdf8; --color-tally:#facc15;
  --header-h: 88px;           /* JS-measured fallback default, see 10.3 */
}
```
Everything else in `index.css` (glass-morphism, Fredoka/Nunito, `.btn-gold`, `.phase-band--*`, the `@media (max-height:800px)` Simulate compaction) is reused verbatim per the blueprint's "no creative re-theme" rule.

### 10.2 `AngleDiagram`/station SVGs consume `--world-N`/`--color-*` via inline `style={{stroke:'var(--world-2)'}}` rather than hardcoded hex, satisfying TRD blueprint §3.6's "never hardcoded colors" rule (the source's `FlowDiagram.jsx` violates this with a hardcoded `ACCENTS` hex map — not replicated).

### 10.3 Viewport-clipping fix (blueprint gotcha #4 / §1.2 item 4)
```jsx
// App.jsx
const navRef = useRef(null);
useEffect(() => {
  if (!navRef.current) return;
  const ro = new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty('--header-h', `${entry.contentRect.height}px`);
  });
  ro.observe(navRef.current);
  return () => ro.disconnect();
}, [phase]); // re-observe when TopNav mounts/unmounts (hidden on intro) or slideInfo bar appears
```
```css
body, .app-container { height: 100dvh; max-height: 100dvh; }     /* was 100vh */
main { padding-top: var(--header-h); }                            /* was the hardcoded pt-12 (48px) Tailwind class */
```
`TopNav` passes its outer `<header>` ref via `navRef` (new prop). This removes the fixed 48px assumption entirely, so the header can grow (Story's slide-progress bar, or a phase pill wrap on narrow widths) without clipping content — validated against the PRD §11 viewport matrix by manual QA (§13.5).

---

## 11. Build & Deploy

1. `npm install`
2. Author content (`data/*.js`, `utils/narration.js`) → run the dev-time assertions in §5.3/§8.3 (`npm run dev`, check console for warnings) → fix any flagged gaps.
3. `npm run generate-audio && npm run clean-audio` (requires `.env.local` with `VITE_ELEVENLABS_API_KEY`, or the `/api/elevenlabs` proxy live).
4. `npm run build` — must succeed from a clean extract (PRD §13 acceptance criterion 3).
5. `npm run preview` for a final manual walkthrough (§13.3).

### 11.1 API key handling (PRD §15, open question 9)
The source's `audio.js` will call ElevenLabs **directly from the browser** with `VITE_ELEVENLABS_API_KEY` baked into the client bundle whenever dynamic (non-`audioMap`) narration fires — acceptable only because, after `generate-audio`, essentially every static line is pre-cached and dynamic calls should be rare. For the on-demand "Read question" button (PRD §10, PRD §15 open question 8), **every** call is dynamic by nature (question text is randomly generated per run), so this TRD adds a minimal serverless proxy:
```js
// api/elevenlabs.js (Vercel-style serverless function)
export default async function handler(req, res) {
  const { text, voiceId, modelId, voice_settings } = req.body;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    body: JSON.stringify({ text, model_id: modelId, voice_settings }),
  });
  if (!r.ok) return res.status(502).end();
  res.setHeader('Content-Type', 'audio/mpeg');
  res.send(Buffer.from(await r.arrayBuffer()));
}
```
`audio.js`'s existing `fetchDynamic()` already tries `/api/elevenlabs` when `import.meta.env.VITE_ELEVENLABS_API_KEY` is unset client-side — so in production, simply **not** shipping the `VITE_` key (keeping only the server-side `ELEVENLABS_API_KEY`) routes all dynamic calls through this proxy with zero client changes. Confirm the hosting target supports serverless functions before committing to this path (flagged in PRD §15).

---

## 12. QA Plan

### 12.1 Stress test — executed during authoring of this TRD (not merely specified)
Ran `makeVoaEquation`, `makeHub`, and `pickCrossAngle` for **30,000 iterations** each (seeded, reproducible):
```
{ N: 30000, fails: 0, fallbacks: 1, minAngleSeen: 20, maxAngleSeen: 160 }
```
Zero failures across: VOA equation consistency (`e1(x) === e2(x) === angle`), clean-angle range (20–160, excluding 85–95), coefficient distinctness, hub sum-to-180 with 3 distinct non-right angles, and cross-angle partner validity. The single "fallback" hit (proven hard-coded example) occurred once in 30,000 draws — acceptably rare.

### 12.2 Distractor engine — 30,000 generated option sets
```
distractor failures: 0
```
Every set had exactly 4 distinct options, the correct answer present, no `NaN`/`undefined`.

### 12.3 Stars/XP — verified against PRD §9 thresholds
```
stars 10Q: 3,3,2,2,1,1,0,0   (for correct=10,9,8,7,6,5,4,0 — exact blueprint match)
stars 5Q : 3,2,1,0           (for correct=5,4,3,2)
stars 8Q : 3,2,2,1,1,0       (for correct=8,7,6,5,4,3)
xp: streak1=10, streak3=12, streak9=20, secondAttempt=6, twoHints=6, worstCase=3
```

### 12.4 `toSpoken` — spot-checked against every symbol class in PRD §10's table
All 13 sample strings (angle notation, degree signs, algebra with negative coefficients, arrows, compass directions, decimal x-values, abbreviated reason captions) converted with **zero** residual matches against `BAD_SPOKEN`.

### 12.5 Diagram geometry — 20,000 random (θ, rotation) pairs
```
geometry failures: 0
```
`sweep('A','B') === theta`, `sweep('C','D') === theta`, `sweep('B','C') === sweep('D','A') === 180-theta` held in every case; the four sweeps always summed to exactly 360.

### 12.6 Manual QA (post-build, per PRD §13)
1. Full walkthrough Intro→Wonder→Story(6)→Simulate(4, gating enforced)→Practice(4 modes, a boss winnable, all 8 badges reachable)→Reflect(recap→optional reflection→Celebration) — zero console errors.
2. Viewport matrix (PRD §11) at all 7 listed resolutions — no clipping, header-height fix holds during Story's slide-progress bar.
3. Keyboard-only pass: every slider, sector, option button, reason chip, tab reachable and operable without a mouse.
4. Audio parity: every static narration line resolves via `audioMap`; muting stays silent (no `speechSynthesis` ever fires — confirm via a breakpoint/log that `speakFallback` no longer exists in the bundle).
5. Grep the built bundle for `Working Backwards|Zara|Leo|Mia|Zoe|Sam|Robo|🦁|🤖|MOE Curriculum` — zero matches.

---

## 13. Delivery Checklist
- [ ] Zip excludes `node_modules/`, `dist/`.
- [ ] `public/assets/images/slide1.png…slide6.png` are genuine PNGs at 1024×1024; `public/favicon.svg` present.
- [ ] Art-brief README section (PRD §12 table) included.
- [ ] `.env.local.example` present with `VITE_ELEVENLABS_API_KEY=` (no real key committed); if the serverless proxy (§11.1) is used, document `ELEVENLABS_API_KEY` as a server-side env var instead/in addition.
- [ ] `README.md` fully rewritten: title, run instructions, voice/audio pipeline note (mirroring the source's structure), **no** Working-Backwards references.
- [ ] `index.html` `<title>` = "CrossQuest — Vertically Opposite Angles" and favicon linked.
- [ ] §12's stress tests re-run against the final `engine/` code (not just this TRD's prototypes) and their console output archived with the delivery.
- [ ] All ⚑ items in PRD §15 either confirmed by the stakeholder or shipped with the PRD's stated default and called out in the delivery email.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Manual sync between `data/story.js` and `narration.js`'s `STORY` array (§5.3) drifts as content is edited late. | Dev-time console-warn assertion (§5.3) catches missing narration per panel before build; add to the manual QA pass. |
| Adding modes/hints/badges (PRD R7) to a `PracticeQuiz` that was built for a single fixed flow is the largest structural delta from the clone source. | Build `ModeSelectModal` and hint state as additive props/local state first; keep the existing `handleOptionClick` correctness/incorrectness branch structure intact and extend rather than rewrite it, to minimize regression risk against the source's already-working feedback/lives logic. |
| `VITE_ELEVENLABS_API_KEY` exposed client-side is inherent to the source's architecture, not new to this build — a determined user can extract it from the bundle for any dynamic (non-cached) line. | §11.1's proxy removes the client-side key entirely once hosting is confirmed to support serverless functions; until then, treat "Read question" as best-effort/rate-limited only. |
| `crossGeometry`'s screen-flipped trig (`-R sin θ`) is easy to get backwards when a new contributor extends it to the 3-line hub variant. | §6.4's tested invariant (`sweep()` sums to 360) should be re-asserted with a unit test whenever the hub variant is added, not just spot-checked once. |
| 10-world unlock copy references "Need 5/10" (this build) vs. the source's "Need 4/10" — easy to typo back to the source's string when copy-pasting `PracticeWorldSelect`. | Single source of truth: unlock text should be computed from `calcStars`'s own 50%-of-total constant, not hand-typed, e.g. `` `Need ${Math.ceil(total*0.5)}/${total}` ``. |
