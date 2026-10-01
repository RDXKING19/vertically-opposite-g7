# CrossQuest — Grade 7 · Vertically Opposite Angles
## Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Intellia Global interactive maths module |
| **Module name** | **CrossQuest** (repo: `g7-crossquest-vertically-opposite-angles`) |
| **`{{GRADE}}`** | Grade 7 (Singapore Secondary 1, age ≈ 12–13) |
| **`{{TOPIC}}`** | Vertically Opposite Angles |
| **`{{SPECIAL_INSTRUCTIONS}}`** | (1) **Clone source = `working-backwards-grade7-main.zip`.** Use it as the reference for UI, UX, architecture, layouts and viewport behaviour. (2) Otherwise, blueprint defaults apply. |
| **Companion doc** | `CrossQuest_G7_Vertically_Opposite_Angles_TRD.md` |
| **Status** | Draft v1.0 — build-ready, pending the Open Questions in §15 |

---

## 1. Overview

CrossQuest teaches one idea deeply: **when two straight lines cross, the angles opposite each other at the crossing are equal — and you can prove it, use it, and state the reason for it.**

A student joins **Priya** and **Wei Ming**, two junior junction designers in neon-lit **Crossroads City**, and moves through the standard five-phase journey: **Wonder → Story → Simulate → Practice → Reflect**. It has 4 hands-on Simulate stations, a 100-slot procedurally generated question bank across 10 worlds, 4 practice modes, XP / stars / streaks / 8 badges / 10 boss trophies, and full ElevenLabs narration.

**Design intent for Grade 7.** At this age the failure mode is not "can't subtract from 180". It is (a) confusing *equal* with *supplementary*, (b) assuming any two "opposite-looking" angles qualify (even when a line is bent), and (c) not stating a geometric reason, which is exactly where Secondary 1 exam marks are lost. The module is built to attack those three misconceptions directly.

---

## 2. Background & Reference Reconciliation

The Intellia blueprints were written against the `G2-Money-Money-main` architecture. For this build the **uploaded Grade 7 reference (`working-backwards-grade7-main`) is the clone source** for UI/UX/architecture/layout/viewport. After a full read of that codebase, the two sources disagree in several places. The decisions below are binding for this PRD and the TRD; items marked ⚑ are also raised in §15 for stakeholder confirmation.

| # | Topic | Blueprint says | Reference zip actually does | **Decision for CrossQuest** |
|---|---|---|---|---|
| R1 | Look & feel | Dark glass-morphism, Fredoka/Nunito, `design-tokens.css` | Same visual language; tokens live in `index.css :root` + `tailwind.config.js` | **Follow zip** pixel-for-pixel (nav capsule, cosmic gradient, glass cards, gold CTA). No separate `design-tokens.css`; add `--world-0…9` to `index.css`. |
| R2 | Screen layout | "Replicate established design" | Fixed `TopNav`; centred glass cards; Story = 2-column image/text; Simulate = left station tabs + right activity pane; Practice = 5×2 world grid + quiz card | **Follow zip layouts exactly.** |
| R3 | Tech stack | React 19, Vite 8, framer-motion, lucide, oxlint | React 18.3, Vite 5, Tailwind 3.4, `canvas-confetti`; no framer-motion/lucide | **Follow zip stack** (no version bump; no new UI libraries). |
| R4 | App state | `useReducer` with 17 actions | Plain `useState` in `App.jsx` | **Hybrid:** phase navigation stays `useState` (zip). Gamification/progress moves to one `useReducer` (needed for XP, streaks, badges, trophies). |
| R5 | Folder structure | `components/phases/*`, `config/`, `data/` | `stages/*`, `components/*`, `mathData.js`, `utils/` | **Keep zip's `stages/` + `components/` naming.** Add `config/`, `data/`, `state/` only where the blueprint requires them. |
| R6 | Simulate | **4 stations**, each with a completion gate | **3 stations × 3 activities**, no gating (🔓 icons are decorative) | **4 stations (blueprint)** rendered in **zip's sidebar + pane layout**. The pane's "Activity n of 3" chip becomes "Station n of 4". ⚑ |
| R7 | Practice modes | 4 modes (Guided / Independent / Timed / Boss), hints, badges | Single flow: 10 Qs, 3 hearts, no hints, no modes, no badges | **4 modes (blueprint)**, added via a `ModeSelectModal` in zip styling. Zip's hearts UI is reused for Boss Battle only. ⚑ |
| R8 | Star thresholds | 9–10 = 3★, 7–8 = 2★, 5–6 = 1★ | 8+ = 3★, 6+ = 2★, 4+ = 1★ ("Need 4/10") | **Blueprint thresholds.** Unlock rule stays "previous world ≥ 1★", so copy becomes "Need 5/10". ⚑ |
| R9 | Question bank | 100 Qs, schema with `hint1/hint2`, ≥300-run QA | Infinite random `makeQuestion()`, no hints, no dedupe, no QA | **Blueprint schema + QA.** 100 slots (10 worlds × 10); each slot regenerates fresh numbers per run, de-duplicated per run. |
| R10 | Audio fallback | **Never** use browser Web Speech | `audio.js` falls back to `speechSynthesis` | **Remove the fallback.** Narration silently skips on failure. |
| R11 | Story length | 4 panels default (flex if needed) | 8 panels | **6 panels** (staged derivation justifies >4). Zip's slide code is already length-driven. |
| R12 | Character names | Singaporean-multicultural first names | English names (Leo, Maya, Zara…) | **Blueprint default** (Priya, Wei Ming). ⚑ |
| R13 | Mascot | Tally the Owl 🦉 default | Inconsistent: ⏪ (Intro), 🦁 (Story), 🤖 "Robo" (Wonder/Reflect) | **Tally the Owl 🦉 everywhere;** all "Robo"/🦁/🤖 strings removed. |
| R14 | Reflect | 3-question recap + scorecard + optional reflection | Scoreboard + **mandatory** ≥10-char free text | **Blueprint:** 3-question recap → scorecard → **optional** reflection. ⚑ |

**Reference defects that must not be carried forward** (found in the zip; each has a fix in the TRD): hard-coded `pt-12` under a variable-height fixed header with `100vh` (viewport clipping); "Best Streak" actually stores best *stars*; 1-second auto-dismiss of feedback that contains the explanation; `favicon.svg` referenced but missing; stale "MOE Curriculum" pill and README claims; browser TTS fallback; 41 leftover Working-Backwards audio files and story images.

---

## 3. Standards Alignment

**Curriculum anchor.** Singapore MOE Mathematics syllabus, Secondary 1 (Grade 7), Geometry & Measurement → *Angle properties → Angles formed with a common vertex*: "calculate unknown angles involving **adjacent angles on a straight line**, **vertically opposite angles**, and **angles at a point**."

**In scope (tested in the bank)**
- Vertically opposite angles (VOA): identification, equality, use in multi-step problems.
- Adjacent angles on a straight line (sum 180°) and angles at a point (sum 360°) — **only** as the supporting facts needed to find/justify VOA (they are inseparable in real Sec 1 questions).
- Linear algebraic expressions for angles, solved by equating (VOA) or by a sum (180° / 360°).
- Stating the geometric reason for each step.

**Bridge only (narrative / Simulate, not a bank topic)**
- Proof that VOA are equal, via adjacent angles on a straight line (Story panel 4, Simulate Station 1).

**Explicitly out of scope** (each is a possible future module)
- Parallel lines and a transversal (corresponding / alternate / co-interior angles) → future *ParallelQuest*.
- Angle properties of triangles, quadrilaterals, polygons.
- Bearings, reflex-angle problems beyond the 360° hub, formal multi-step proofs, non-integer angles, quadratic expressions.

**Conventions adopted (please confirm — §14/§15)**
1. Angle notation `∠AOB` with the vertex in the middle; `∠AOB` and `∠BOA` are the same angle.
2. Reasons are stated in full words in the UI ("vertically opposite angles are equal"); the exam abbreviation "vert. opp. ∠s" may appear only as a small caption and is always spoken in full.
3. All angles are whole degrees; expressions are linear; solutions for *x* are whole numbers.
4. UI copy does **not** use the phrase "MOE-aligned" (stale-copy rule). Intro pill reads **"Grade 7 Maths · Geometry"**.

---

## 4. Learning Objectives

By the end of this module, a student should be able to…

1. **Name and locate:** identify the vertex and name any of the four angles formed by two crossing straight lines using three-letter notation (e.g. ∠AOB).
2. **Identify:** pick out pairs of vertically opposite angles, distinguish them from adjacent angles, and recognise when two angles are *not* vertically opposite (a line is not straight).
3. **Apply the property:** state and use "vertically opposite angles are equal" to find a missing angle in one step.
4. **Relate to straight lines:** find an adjacent angle using "angles on a straight line add up to 180°", and find all four angles at an intersection from one.
5. **Explain why:** justify that vertically opposite angles are equal by using two adjacent-angle-on-a-line equations (a + b = 180°, c + b = 180° ⇒ a = c).
6. **Use algebra:** form and solve linear equations from VOA (e.g. 3x + 10 = 5x − 20) and from VOA combined with a straight line.
7. **Combine facts:** find unknown angles in a three-line hub using VOA, angles on a straight line and angles at a point.
8. **Reason and transfer:** state the correct geometric reason for each step and apply the ideas to real-world contexts (crossing roads, scissors, X-braces).

*Order is foundational → applied and drives the world sequence in §8.*

---

## 5. Inherited Standards (fixed — copied from the blueprint, adapted only where §2 says so)

### 5.1 Five-phase architecture
**Wonder → Story → Simulate → Practice (labelled "Practice" in UI) → Reflect.** Intro screen precedes Wonder (zip). Top navigation shows the five phases as numbered pills 01–05 (zip).

### 5.2 Practice modes (unchanged)
| Mode | Questions | Hints | Timed | Lives |
|---|---|---|---|---|
| Guided Practice | 5 | Yes | No | No |
| Independent Practice | 10 | No | No | No |
| Timed Challenge | 8 | No | Yes (60 s) | No |
| Boss Battle | 5 | No | No | Yes (3) |

*Interpretation: "60 s" is applied **per question** in Timed Challenge (60 s for all 8 would be ≈ 7 s each, unworkable for multi-step Grade 7 items). ⚑*

### 5.3 Gamification mechanics
XP, 0–3★ per world, streaks, 8 badges, 10 boss battles (5 Qs, 3 lives). Details and naming in §9.

### 5.4 Audio pipeline
ElevenLabs-only. Alice voice (`Xb7hH8MSUJpSbSDYk0k2`), model `eleven_multilingual_v2`, six style presets (statement/instruction, question, encouragement, emphasis, thinking, celebration). Pre-generated static `.mp3` for all known lines; dynamic on-the-fly generation only for procedurally varying question text. **No browser speech fallback, ever.** Strict 1:1 parity between spoken text and on-screen text. Symbols/abbreviations spoken as words (§10).

### 5.5 Enforced product standards
Zip visual system reproduced faithfully (no re-theme). Enlarged fonts/touch targets in Simulate and Practice, calibrated for age 12–13 (restrained vs. Grade 2, still large). Reuse every non-topic file verbatim. Delivery as a zip excluding `node_modules`/`dist`, placeholder story images at the zip's shipped size (1024 × 1024) plus an art-brief README. Mascot **Tally the Owl 🦉** (default retained — an owl's head-turn is a friendly metaphor for "looking across the vertex"). Characters: **Priya** and **Wei Ming** (first names only).

---

## 6. Module Identity

- **Name:** CrossQuest — *Vertically Opposite Angles*
- **Setting:** **Crossroads City**, a neon-lit city where junction designers redesign road crossings, rail crossings and bridge braces. Older-grade, project-based framing: the student is an apprentice at the **Junction Design Studio**.
- **Characters**

| Key | Name | Role | Emoji | Colour token |
|---|---|---|---|---|
| `priya` | Priya | Lead junction designer; models correct reasoning | 👩🏽‍💻 | `--color-story` (#fb923c) |
| `weiming` | Wei Ming | Enthusiastic apprentice; voices the classic mistakes ("opposite angles add up to 180°!") | 🧑🏻‍🔧 | `--color-simulate` (#38bdf8) |
| `tally` | **Tally the Owl** (mascot) | Speech-bubble hints, encouragement, Read-aloud host | 🦉 | `--color-gold` (#facc15) |

- **Intro tagline:** "Ready to crack the crossroads code? 🎉"
- **Intro subtitle:** "Join Priya and Wei Ming on a journey through Crossroads City — spot vertically opposite angles, prove they're equal, and use them to solve junction puzzles!"

---

## 7. The Five-Phase Journey

### 7.1 Intro (zip `IntroModal`, content-only changes)
Pill "✨ Grade 7 Maths · Geometry"; title "Vertically Opposite **Angles**" (gold second line); Tally 🦉 speech pill; journey flow card (Wonder → Story → Simulate → Practice → Reflect); gold CTA "🚀 Begin Your Journey!"; three feature cards: **Spot the Twins** (find opposite angles), **Simulations** (Interactive labs), **10 Game Worlds** (XP & awards).

### 7.2 Wonder — hook
- **Heading:** "How Can You Know an Angle Without Measuring?"
- **Big-number box:** "Blades 40° → Handles ?°"
- **Paragraph (narrated):** "Priya opens a pair of scissors so the blades make a 40° angle. Wei Ming says the angle between the handles is exactly 40° too — and he did not measure!"
- **Tally thought bubble (narrated question):** "What secret do two crossing straight lines hide?"
- **CTA:** "Explore the Story →"

### 7.3 Story — **6 panels** (state explicitly; the reference `StoryPhase` is length-driven, so no magic number is left behind)

Order follows: concrete hook → vocabulary → prerequisite fact → derivation/rule → worked application → extension & recap.

| # | Title | Concept delivered | Narrative beat |
|---|---|---|---|
| 1 | Where Two Roads Cross | Two straight lines make four angles; the vertex | Priya and Wei Ming survey a neon junction |
| 2 | Meet the Opposite Twins | Naming ∠AOB; definition of *vertically opposite*; "vertical" ≠ up/down | Priya labels the corners |
| 3 | The Straight-Line Secret | Adjacent angles on a straight line = 180° | Wei Ming recalls the half-turn fact |
| 4 | Why Opposite Angles Are Equal | a + b = 180°, c + b = 180° ⇒ a = c | The proof, panel by panel |
| 5 | Solving Junction Puzzles | Worked numeric example + algebra example | Priya finds all four angles; Wei Ming tries x |
| 6 | Bigger Hubs, Bigger Missions | Three lines, angles at a point = 360°; call to the Lab | Studio door opens onto the lab |

**Final on-screen copy** (each panel = `title`, `body`, `quote` pill, Tally `bubble`; the narration script is generated from this text — see TRD §7):

1. **Where Two Roads Cross** — *body:* "Welcome to Crossroads City! Priya and Wei Ming design road junctions. Whenever two straight roads cross, four corners appear. The point where the roads meet is called the vertex." — *quote:* "Two straight lines that cross make four angles." — *bubble:* "Look closely — every crossing hides a secret!"
2. **Meet the Opposite Twins** — *body:* "Priya names each corner with three letters, like ∠AOB, with the vertex O in the middle. Two angles directly across the vertex from each other are called vertically opposite angles. 'Vertical' comes from vertex, not from up and down!" — *quote:* "Vertically opposite angles face each other across the vertex." — *bubble:* "Opposite corners look like twins. But are they really equal?"
3. **The Straight-Line Secret** — *body:* "Wei Ming remembers a fact: a straight line is a half-turn, so angles side by side on a straight line add up to 180°. If ∠AOB = 65°, then ∠BOC = 180° − 65° = 115°." — *quote:* "Adjacent angles on a straight line add up to 180°." — *bubble:* "Keep 180° in your pocket. You will need it in a moment!"
4. **Why Opposite Angles Are Equal** — *body:* "Let ∠AOB = a, ∠BOC = b and ∠COD = c. On straight line AC: a + b = 180°. On straight line BD: c + b = 180°. So a and c both equal 180° − b. That means a = c!" — *quote:* "Vertically opposite angles are equal." — *bubble:* "No measuring needed. The straight line does the work!"
5. **Solving Junction Puzzles** — *body:* "At Priya's crossing, ∠AOB = 65°. Its vertically opposite angle ∠COD is also 65°. The other two angles are 180° − 65° = 115° each. Then Wei Ming tries algebra: (3x + 10)° and (5x − 20)° are vertically opposite, so 3x + 10 = 5x − 20. That gives x = 15." — *quote:* "Opposite angles equal? Then set the expressions equal!" — *bubble:* "Always give a reason: vertically opposite angles are equal."
6. **Bigger Hubs, Bigger Missions** — *body:* "Some junctions have three lines through one point. Angles at a point add up to 360°, and every angle still has a vertically opposite twin. You are ready for the lab!" — *quote:* "Angles at a point add up to 360°." — *bubble:* "Ready? Enter the lab and show what you know!" — CTA "Enter Lab 🧪".

*Check:* 3x + 10 = 5x − 20 ⇒ 30 = 2x ⇒ x = 15 (each angle 55°).

### 7.4 Simulate — 4 stations (zip layout: left tab column, right pane, footer navigation)

Layout: left column lists **4 station tabs** (icon, name, sub-line, state icon 🔒 / 🔓 / ✅) and the "Go to Practice Phase →" CTA (enabled once all 4 are complete). Right pane shows the station header, one-line description, the interactive body, and a footer: "← Previous Station" / "Next Station →" (Next is enabled only after the current station is completed; the last button reads "Go to Practice Phase"). Stations unlock **sequentially**; completed stations remain revisitable. Every station shows a `station-success` panel with **"Complete Station ✓"**. Every drag/slider control has explicit **− / +** buttons and is keyboard-operable.

Each station follows one archetype from the blueprint heuristic:

| # | Station | Archetype | One-line premise |
|---|---|---|---|
| 1 | **Scissor Lab** 🔬 | Concept Discovery Lab | Open the scissors and *see* why opposite angles must match |
| 2 | **Junction Builder** 🏗️ | Build-to-Target Challenge | Swing a road to hit the planners' target angle |
| 3 | **Hub Designer** 🕸️ | Multi-Step / Composite Construction | Solve a three-line hub and justify every angle |
| 4 | **Case of the Wrong Working** 🕵️ | Error-Detective | Find the seeded mistake in a worked solution |

#### Station 1 — Scissor Lab (Concept Discovery)
- **Student manipulates:** a slider (20°–160°, 1° steps, − / + buttons that step 5°) that opens two crossing "scissor blades"; a **Spin 180° ↻** button; a **Next clue →** proof stepper.
- **Live feedback:** SVG with the four angles labelled a, b, c, d and their live values; live readouts "a + b = 180°", "b + c = 180°", "a = c ✓ always", "b = d ✓ always"; Spin rotates the whole figure 180° about O and shows the ghost of ∠AOB landing exactly on ∠COD; the proof stepper reveals: (1) "a + b = 180° — adjacent angles on a straight line" (2) "c + b = 180° — adjacent angles on a straight line" (3) "So a = c."
- **Completion gate:** explored ≥ 5 distinct openings (each ≥ 10° apart) **and** proof revealed 3/3 **and** confirmation question answered correctly ("The angle a is 48°. What is c?" — 48° / 132° / 42° / 312°; wrong answer → gentle hint and retry). Spin is encouraged, not required.

#### Station 2 — Junction Builder (Build-to-Target)
- **Scene:** top-down map: Palm Road (vertical) crosses Harbour Avenue (swingable). Corners are labelled **NE, NW, SW, SE**; the NE corner is the angle the student sets.
- **Student manipulates:** "Swing Harbour Avenue" slider (20°–160°, 1° steps) with − / + buttons (1° and 5°).
- **Live feedback:** all four corner values; a running sum readout for the round; status chip "Too big by 12°" / "Too small by 8°" / "✓ Locked in!".
- **Rounds (tolerance ±1°):** **R1** "Make the NE corner exactly 65°." **R2** "Planners want the SW corner to be 130°." (needs VOA: NE = 130°). **R3** "Make NE + SW add up to 84°." (each = 42°). A round-tracker shows 1/3, 2/3, 3/3; each success reveals the reasoning line (e.g. "SW is vertically opposite NE, so they are equal").
- **Completion gate:** all 3 rounds locked in. "Try another round" resets the slider between rounds; a tries counter is shown, not penalised.

#### Station 3 — Hub Designer (Composite Construction)
- **Scene:** three lines through O (rays A–F; A/D, B/E, C/F are opposite). Two angles are given (∠AOB, ∠BOC); four sectors are unknown.
- **Student manipulates:** taps a sector → a number stepper (− / + and typing) → picks a **reason chip** (Vertically opposite angles are equal / Adjacent angles on a straight line add up to 180° / Angles at a point add up to 360°) → **Check**.
- **Live feedback:** correct sectors fill with colour and their value; a **reason ledger** builds line by line ("∠DOE = 40° — vertically opposite angles are equal"); wrong entries shake with a targeted hint (e.g. "Is ∠COD next to ∠AOB and ∠BOC on line AD? Think 180°, not 360°"). After all four are filled, **Check total** adds the six angles to reveal 360° (angles at a point).
- **Rounds:** Hub 1 (∠AOB = 40°, ∠BOC = 65°) and Hub 2 (∠AOB = 35°, ∠BOC = 45°; third angle 100°). Both hubs obey the §8.2 hub rule (distinct angles, none in 85°–95°).
- **Completion gate:** both hubs fully solved, each with the correct reason chip on each sector, and the 360° total confirmed at least once. This targets objective 7 (composite).

#### Station 4 — Case of the Wrong Working (Error-Detective)
- **Student manipulates:** taps the faulty line in a worked solution, then picks the corrected line from three options.
- **Cases (each seeds one realistic mistake):**
  1. *Equal-vs-supplementary (the primary misconception):* "∠AOB = 70°. ∠COD is opposite ∠AOB. ∠COD = 180° − 70° = 110°." → faulty line 2; fix: "∠COD = 70° (vertically opposite angles are equal)".
  2. *Same misconception in algebra:* "(3x + 10)° and (5x − 20)° are vertically opposite. 3x + 10 + 5x − 20 = 180 → 8x − 10 = 180 → x = 23.75" → faulty line 2; fix: "3x + 10 = 5x − 20". (A non-whole *x* is the clue.)
  3. *Wrong reason:* "∠AOB = 115°. ∠AOB + ∠BOC = 360° (angles at a point) → ∠BOC = 245°" → faulty line 1; fix: "∠AOB + ∠BOC = 180° (adjacent angles on a straight line)".
- **Live feedback:** the tapped wrong line turns red with a 🔍 mark when correct; after the fix, a "Misconception caught" card explains it in one sentence; incorrect taps get a hint, never a lock-out.
- **Completion gate:** all 3 cases located **and** fixed.

*All four are genuinely interactive (live-updating SVG; no static reveal-and-answer screens) and visually distinct: rotating scissors, road map, radial hub, and a worked-solution "case file".*

### 7.5 Practice — worlds, modes, flow
- **World select (zip grid):** 10 cards in a 5 × 2 grid (2 columns on phones); each shows `W#`, `Q-range`, icon, name and ★★★/"Play →"/🔒. Header shows ⭐ x / 30 and the mode hint. World *n* unlocks when world *n−1* has ≥ 1★ ("Need 5/10").
- **Mode select:** clicking an unlocked world opens a **mode modal** with four cards (Guided / Independent / Timed / Boss) — each states its question count and rule in one line. Boss Battle is shown with the world's boss name/emoji.
- **Quiz card (zip layout):** world pill (uses the world accent), stats bar — ⭐ score · ❤️❤️❤️ (Boss Battle only; hidden in the other modes) · 🔥 streak — progress bar "Question n/N", dark question box with a gold **rule-tag** pill, the angle diagram, question text, 2 × 2 option grid. Extras: **🔊 Read question** button (on demand), **💡 Hint** button (Guided; two levels), countdown ring (Timed).
- **Feedback:** correct → green popup, auto-advance ≈ 1.6 s; incorrect → red popup that **stays until "Got it →"** (it contains the reasoned explanation). Guided allows a second attempt before revealing.
- **Boss Battle:** 3 hearts; losing all shows the zip "Out of Hearts" screen ("Tally says: …", Retry / Quit). Finishing 5 questions with ≥ 1 heart defeats the boss → trophy + Boss badge.
- **Result panel** after each run: score, stars earned, XP, any badge/trophy, buttons "Back to Worlds" and "Try another mode".

### 7.6 Reflect
Two internal steps in one zip-style glass card:
1. **Quick Recap — 3 questions** (distinct from the bank; targets the "equal, not supplementary" concept and the reason):
   1. "Two straight lines cross. One angle is 72°. What is the angle vertically opposite it?" — **72°** / 108° / 18° / 288°.
   2. "AC and BD are straight lines crossing at O. Which reason explains ∠AOB = ∠COD?" — **Vertically opposite angles are equal** / Adjacent angles on a straight line add up to 180° / Angles at a point add up to 360° / Alternate angles are equal.
   3. "(2x + 15)° and 65° are vertically opposite angles. What is x?" — **x = 25** / x = 50 / x = 40 / x = 65.
2. **Scoreboard:** Total XP · Stars x / 30 · Best Streak · World results (10 tiles) · Boss trophies · Badge shelf, then an **optional** reflection prompt: "Explain to Tally why vertically opposite angles are equal — use a diagram or an example!" **Complete Lesson 🎉** is always enabled after the recap.
3. **Celebration screen** (zip): confetti, "Grade 7 Maths Mastered!", "CrossQuest Complete!", XP and stars, "Play Module Again".

---

## 8. World & Question Bank

**Shape:** 10 worlds × 10 question **slots** = 100. Slots are ordered easy → hard; every run regenerates fresh numbers/letters (unique within a run). Modes draw from slots: **Guided** = slots 0–4; **Independent** = 0–9; **Timed** = 8 of the 10 (random, order preserved easy→hard); **Boss** = slots 5–9. **World id 9 (labelled W10) is the mixed-review Grand Finale**, with the hardest boss.

| id | World (icon) | `conceptFocus` | Description | Accent | Boss → reward |
|---|---|---|---|---|---|
| 0 | Crossing Basics ✖️ | `naming` | Vertex, angle names, how many angles two lines make | `#22d3ee` | Vertex Vandal 🕶️ → **Vertex Finder** |
| 1 | Spot the Pair 🔍 | `identify` | Find vertically opposite pairs; spot bent-line traps | `#a78bfa` | Bent-Line Bandit 🦹 → **Sharp Eye** |
| 2 | Mirror Twins 🪞 | `equal` | Opposite angles are equal — one-step finds | `#f472b6` | Mirror Mimic 👻 → **Twin Spotter** |
| 3 | Straight-Line Partners ➖ | `supplement` | Adjacent angles on a straight line = 180° | `#fb923c` | The Line Splitter ✂️ → **Line Keeper** |
| 4 | Full Intersection 🚦 | `all-four` | All four angles from one; sums; right-angle crossing | `#4ade80` | Four-Corner Phantom 🎭 → **Four-Corner Champion** |
| 5 | Reason Detective 🕵️ | `reasoning` | Choose and state the right geometric reason; why it works | `#facc15` | Captain Guess-a-Lot 🏴‍☠️ → **Reason Master** |
| 6 | Algebra Junction 🧮 | `algebra` | Equate expressions; solve x; sum-to-180° | `#38bdf8` | The Unknown X ❓ → **X-Hunter** |
| 7 | Real-World Crossings 🌉 | `context` | Roads, scissors, X-braces, rail crossings | `#f87171` | Gridlock Giant 🚧 → **City Fixer** |
| 8 | Three-Line Hub 🕸️ | `three-lines` | Three lines through a point; 180° and 360° together | `#c084fc` | Hub Hydra 🐙 → **Hub Hero** |
| 9 | Grand Junction 🏆 | `finale` | Mixed review of every type, hardest variants | `#fde047` | The Crossroads Titan 👑 → **Crossroads Champion** |

Difficulty tiers (for the world card / QA): 1,1,1,2,2,2,3,3,4,4.

### 8.1 Slot ramp and sample questions

| World | Slot ramp (0 → 9) | Sample questions (illustrative) |
|---|---|---|
| **0 naming** | vertex → name from rays → same-angle names (∠AOB = ∠BOA) → count of angles / pairs → which ray is opposite OA | "Lines AC and BD cross at O. Which point is the vertex of ∠AOB?" → **O** · "Lines PR and QS cross at X. Another name for ∠PXQ?" → **∠QXP** |
| **1 identify** | "opposite ∠AOB?" → "which pair is VOA?" → adjacent-vs-opposite → **bent-line trap** in slots 7–9 | "Which angle is vertically opposite ∠AOB?" → **∠COD** · "PQ is straight but RS bends at O. Are ∠POR and ∠QOS vertically opposite?" → **No — both lines must be straight** |
| **2 equal** | acute → obtuse → asked via ∠BOC/∠DOA → labelled a, b, c, d → non-multiple-of-5 angles late | "∠AOB = 65°. Find ∠COD." → **65°** · "∠BOC = 128°. Find ∠DOA." → **128°** |
| **3 supplement** | straight-line partner → given expression form → "sum of adjacent pair" → partner of an obtuse angle | "AOC is a straight line. ∠AOB = 72°. Find ∠BOC." → **108°** |
| **4 all-four** | one → another of the three → sum of two → "all four add to" → right-angle crossing | "∠AOB = 48°. Find ∠DOA." → **132°** · "Two lines cross at right angles. ∠AOB = 90°. Find ∠BOC." → **90°** |
| **5 reasoning** | reason for a step → missing proof line → true/false statement → spot-the-flaw in Wei Ming's claim | "Which reason explains ∠AOB = ∠COD?" → **Vertically opposite angles are equal** · "Wei Ming says ∠AOB + ∠COD = 180°. What is his mistake?" → **They are equal, not supplementary** |
| **6 algebra** | (x + b)° vs known → (ax + b)° vs known → two-sided equation → find the *angle* not x → VOA + straight line | "∠AOB = (2x + 15)° and ∠COD = 65° are vertically opposite. Find x." → **x = 25** · "(3x + 10)° and (5x − 20)° are vertically opposite. Find each angle." → **55°** |
| **7 context** | direct scenario → scenario asking a *different* corner → algebra inside a scenario | "Two roads cross. The north-east corner is 58°. What is the south-west corner?" → **58°** · "Scissors open so the blades make 35°. What angle do the handles make?" → **35°** |
| **8 three-lines** | find γ → find a VOA twin in the hub → sums → algebra in the hub | "AD, BE, CF meet at O. ∠AOB = 40°, ∠BOC = 65°. Find ∠COD." → **75°** · "…Find ∠EOF." → **65°** |
| **9 finale** | one hardest variant from each of worlds 1–8, ordered by difficulty | "(2x + 10)° and (x + 45)° are vertically opposite. Find the angle adjacent to (2x + 10)° on a straight line." → **100°** (x = 35, angle 80°) |

### 8.2 "Clean number" rules (hard constraints for generation)
1. **Angle pool:** whole degrees in **20°–160°**; **85°–95° excluded** (so no angle can be confused with a right angle by eye) except in the designated right-angle template (World 4). Slots 0–4 use multiples of 5; later slots may use any integer in range.
2. **Two-line figures:** θ and 180° − θ must both fall in 20°–160°; θ ≠ 90° outside the right-angle template.
3. **Algebra:** *x* is an integer in **4–30**; coefficients 1–6; every angle value is an integer in 20°–160°; constants may be negative, but every expression must evaluate to a whole-degree angle in range; *x* ≠ any angle value shown (prevents answer confusion); the two sides of a VOA equation have different coefficients.
4. **Three-line hub:** α + β + γ = 180°, each ≥ 20°, all three distinct, none 90°.
5. **Options:** exactly four **distinct** options, one correct; distractors come from the named misconception library (§8.3), topped up with ±5°/±10° near-misses only if a misconception distractor would collide or fall outside 10°–350°. Correct-answer position is uniformly shuffled.
6. **Bent-line figures:** the bent line must bend by ≥ 15° so the visual clearly differs from a straight line.
7. **Diagrams are drawn to scale** (rendered angles equal the data) and the whole figure is randomly rotated (0°–179°); labels stay upright. Because of rule 1, "measure by eye" never decides a question.

### 8.3 Misconception library (drives distractors, hints, and Station 4)
MC-1 VOA treated as **supplementary** (180° − θ) · MC-2 treated as **complementary** (90° − θ) · MC-3 360° − θ · MC-4 halving/doubling θ · MC-5 picks an **adjacent** angle as "opposite" · MC-6 "vertical" means up/down · MC-7 treats **bent-line** angles as VOA · MC-8 cites the **wrong reason** (angles at a point vs straight line) · MC-9 algebra: adds the two VOA expressions to 180°, or reports x instead of the angle, or slips a sign · MC-10 hub: uses 360° where the half-turn 180° applies.

---

## 9. Gamification

- **XP (per correct answer):** base **10** on first attempt (6 on second, 3 thereafter — only Guided allows a second attempt); **−2 per hint used** (floor 3); **streak bonus** +2 per streak step from the third correct in a row, capped at +10. Wrong/timeout = 0 XP. *(Exact constants are proposed; ⚑ confirm against the G2 scoring file.)*
- **Stars per world:** computed on the mode's own question count by percentage — **≥ 90 % = 3★, ≥ 70 % = 2★, ≥ 50 % = 1★, else 0★**; this reproduces the blueprint thresholds exactly for 10 questions (9–10 / 7–8 / 5–6) and scales to 5- and 8-question modes. A world keeps its **best** result across modes.
- **Streaks:** continuous across questions, worlds and modes; reset by a wrong answer or a timeout. The scorecard's **Best Streak** is the true streak (fixes the zip bug).
- **Boss Battles:** 10 (one per world), 5 questions, 3 lives; defeating one grants its **trophy** (reward name in §8). Trophies are shown in Reflect.

**Badges — the 8 fixed triggers, themed:**

| Trigger (fixed) | Badge name |
|---|---|
| First correct answer | **First Crossing** ✖️ |
| 5-answer streak | **Five-Lane Streak** 🛣️ |
| 10-answer streak | **Perfect Intersection** 🎯 |
| All 4 Simulate stations complete | **Master Surveyor** 📐 |
| Any world scores 3 stars | **Three-Star Surveyor** ⭐ |
| Any Boss Battle won | **Boss of the Crossroads** 👑 |
| 20+ questions answered in Practice | **Road Warrior** 🚧 |
| Full 5-phase journey complete | **Opposite Angles Master** 🏆 |

Unlocks show a top-centre toast in zip glass style (with narration) and appear on the Reflect badge shelf; badge #8 unlocks on the Celebration screen.

---

## 10. Audio & Narration Content Rules

Pipeline per §5.4. Narration mirrors on-screen text 1:1; **titles, headings and labels are not narrated** (zip rule). **Always spoken in full, never as symbols, abbreviations or bare digits:**

| On screen | Spoken as |
|---|---|
| `∠AOB` | "angle A O B" (letters separated so the voice spells them) |
| `65°` | "sixty-five degrees" |
| `180°`, `360°` | "one hundred and eighty degrees", "three hundred and sixty degrees" |
| `=`, `+`, `−`, `×` | "equals", "plus", "minus", "times" |
| `(3x + 10)°` | "three x plus ten degrees" |
| `3x + 10 = 5x − 20` | "three x plus ten equals five x minus twenty" |
| `x = 15` | "x equals fifteen" |
| "vert. opp. ∠s" (caption) | "vertically opposite angles" |
| "adj. ∠s on a str. line" (caption) | "adjacent angles on a straight line" |
| "∠s at a pt" (caption) | "angles at a point" |
| `NE / NW / SW / SE` | "north-east / north-west / south-west / south-east" |
| `?` in a diagram | "the missing angle" |

Numbers are spoken in words (zip convention, e.g. "twenty-five"). Dynamic question read-aloud uses the same conversion. Static line inventory is derived from the content files, ≈ 80–90 lines (final count = whatever `getAllNarration()` returns).

---

## 11. Accessibility, Viewport & UX Requirements

- **Age-calibrated sizing:** keep the zip's clamp-based type scale; Simulate and Practice body text ≥ 16 px, option buttons ≥ 56 px tall, all other tap targets ≥ 44 × 44 px (the zip's `text-xs px-4 py-2.5` buttons are raised).
- **Not colour-only:** every angle on every diagram carries a text label (value, letter or "?"); tones are paired with icons/text ("✓ Locked in!", "Too big by 12°").
- **Keyboard:** every slider has − / + buttons; sectors, option buttons, reason chips and tabs are focusable with a visible focus ring; Enter/Space activate; Esc closes the mode modal.
- **Screen readers:** `aria-live="polite"` on feedback and status chips; diagrams have an `aria-label` summarising the figure ("Two straight lines cross at O; angle A O B is sixty-five degrees").
- **Motion:** respect `prefers-reduced-motion` (spin/rotation animations become instant).
- **Viewport (fixes the zip's clipping bug):** the shell uses dynamic viewport height and a *measured* header height. **Supported matrix — no page-level scroll and no clipped controls at:** 1920 × 1080, 1440 × 900, 1366 × 768, 1280 × 720, 1024 × 768 (tablet landscape), 768 × 1024 (tablet portrait), 390 × 844 (phone portrait; icon-only phase pills). Content taller than the pane scrolls **inside** the pane.
- **Audio:** the Muted/Unmuted pill (zip) stays in the nav; muted = silent, never a spoken fallback.

---

## 12. Assets Required

- **6 story images** (one per panel) — **1024 × 1024**, the zip's shipped size (note: the zip's `.png` files actually contain JPEG data; new files must be genuine PNGs). Path `public/assets/images/slide1.png … slide6.png`.
- **Placeholders** in the delivery zip (numbered gradient tiles with the panel title) plus an **art-brief README**. Art direction to match the reference: painterly neon-glow storybook, deep purple/violet cosmic palette, gold and cyan accents, a friendly 3D-cartoon character style.

| Panel | Scene / characters / mood |
|---|---|
| 1 | Aerial view of a glowing Crossroads City junction; four corner arcs shimmer; Priya and Wei Ming on a hover-platform holding a holographic blueprint. Wonder & discovery. |
| 2 | Close-up of the crossing labelled A, B, C, D with vertex O in gold; opposite corners glow the same colour; Tally the Owl perched on the vertex. Playful. |
| 3 | A long straight neon road with a protractor-style half-turn arc labelled 180°; Wei Ming pointing at a 65° / 115° split. Aha moment. |
| 4 | Giant holographic "proof wall": three linked equations lighting up in sequence; Priya at the wall, Tally reading. Clarity, triumph. |
| 5 | Two-panel scene: a numeric crossing (65° / 115° / 65° / 115°) and Wei Ming at a whiteboard with the algebra; a bridge X-brace behind them. Focus and fun. |
| 6 | A futuristic six-way hub with three lines through one point; the studio's lab door glowing at the end; Priya, Wei Ming and Tally looking ahead. Excitement, invitation. |

- Favicon `public/favicon.svg` (missing in the reference) — a simple ✖️-crossing glyph in the gold/violet palette.
- Audio: generated by `npm run generate-audio` then `npm run clean-audio`; **all 41 reference `.mp3` files and the old `audioMap.js` are purged first.**

---

## 13. Success Metrics / Acceptance Criteria

**Fixed (from the blueprint)**
1. **Question-bank stress test:** ≥ 300 randomized generations of all 100 slots (30,000 questions): zero duplicate options, zero out-of-range values, zero `NaN`/`undefined`/empty fields.
2. **Audio parity:** every string passed to a narration helper has an exact `audioMap` match or is intentionally dynamic; no static line contains digits or symbols.
3. **Clean build:** `npm install && npm run build` succeeds from a clean extract.
4. **Full walkthrough:** Intro → Wonder → Story (6 panels) → Simulate (4 stations, gating correct) → Practice (all 4 modes reachable, a boss winnable, badges unlock) → Reflect (recap, scorecard, celebration) with zero console/page errors.

**Module-specific**
5. **Clean-number rules (§8.2) hold** in every generated question; bent-line figures always bend ≥ 15°; hub angles always sum to 180° per half.
6. **Diagram accuracy:** every rendered angle equals its data value within 0.01°; VOA pairs in the SVG are geometrically identical.
7. **Simulate is genuinely interactive:** each station's live visual changes with student input; no station can be completed without the gate condition in §7.4; each has keyboard-operable controls.
8. **Misconception coverage:** for every world, each option set contains ≥ 1 named-misconception distractor (§8.3) wherever one applies.
9. **Viewport matrix (§11)** passes with no clipping/overflow; TopNav never overlaps content.
10. **No branding leftovers:** no "Working Backwards", "Zara", "Robo", 🦁, 🤖, "MOE Curriculum" strings; page `<title>` and README updated; favicon present.

---

## 14. Assumptions

- **Curriculum conventions (confirm with stakeholders):** ∠ notation with the vertex in the middle; whole-degree angles; linear expressions only; algebraic VOA questions are appropriate at this point in the Sec 1 scheme of work (they assume linear equations are already taught); reasons in full words with the exam abbreviation as caption only.
- **Character names and mascot** (Priya, Wei Ming, Tally the Owl) are **proposed defaults** from the blueprint's naming convention — not yet approved.
- **Timed Challenge** uses 60 s per question.
- **Guided Practice** allows one retry per question and does not cap stars.
- **Scoped out (possible future modules):** parallel lines & transversal; triangle/polygon angle properties; bearings; formal proofs.

---

## 15. Open Questions (need a stakeholder answer before or during build)

1. **Simulate structure ⚑** — the reference has 3 stations × 3 activities with free navigation; the blueprint mandates 4 stations with gating. This PRD uses **4 stations, sequentially gated** in the reference's layout. Confirm, or specify 4 × 2/3 activities.
2. **Practice modes ⚑** — the reference has no modes, hints or badges. This PRD adds all four modes and the badge system per the blueprint. Confirm this is wanted for Grade 7 (versus the reference's single hearts-based flow).
3. **Star thresholds & unlock copy ⚑** — blueprint (5/10 for 1★) vs reference (4/10). This PRD uses the blueprint.
4. **Timed Challenge timing ⚑** — 60 s per question (assumed) or 60 s total?
5. **Reflect ⚑** — recap + optional reflection (blueprint) vs the reference's mandatory written reflection.
6. **Names ⚑** — Singaporean-multicultural defaults (Priya, Wei Ming) vs the reference's English names; any "no X names" constraint?
7. **XP constants ⚑** — confirm the proposed formula matches the G2 `scoring.js`.
8. **On-demand "Read question" narration** — costs ElevenLabs credits per unique question; approve, or restrict to static lines only?
9. **API key handling** — the reference exposes `VITE_ELEVENLABS_API_KEY` in the client bundle when dynamic audio is used. The TRD proposes a server-side proxy (`/api/elevenlabs`) for production. Confirm hosting supports serverless functions (Vercel assumed).
10. **Story panel count** — 6 proposed; the blueprint default is 4 and the reference uses 8.
