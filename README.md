# CrossQuest — Vertically Opposite Angles · Grade 7

An interactive 5-phase mathematics learning module for Grade 7 (Singapore Secondary 1, ages 12–13) exploring **Vertically Opposite Angles** in neon-lit Crossroads City with **Priya**, **Wei Ming**, and **Tally the Owl 🦉**.

## Learning Phases

1. **Wonder:** How can you know an angle without measuring? The scissor blade mystery.
2. **Story (6 Panels):** Where two straight roads cross, defining vertically opposite angles, adjacent angles on a straight line ($180^\circ$), derivation ($a + b = 180^\circ$, $c + b = 180^\circ \implies a = c$), algebraic applications, and 3-line junctions ($360^\circ$).
3. **Simulate (4 Interactive Stations with Sequential Gating):**
   - **Station 1 (Scissor Lab):** Concept discovery, interactive opening slider, $180^\circ$ rotation spin, 3-step proof reveal, confirmation check.
   - **Station 2 (Junction Builder):** Build-to-target road angle alignment challenge across 3 planning rounds.
   - **Station 3 (Hub Designer):** Multi-step composite construction and reason justifications for 3-line hubs ($360^\circ$).
   - **Station 4 (Case of the Wrong Working):** Error-detective challenge finding and fixing seeded algebraic and geometric misconceptions.
4. **Practice (10 Worlds · 4 Modes):**
   - **Modes:** Guided Practice (hints & second chances), Independent Practice (10 questions), Timed Challenge ($60\text{ s}$ per question), Boss Battle (3 lives ❤️❤️❤️ with trophies).
   - **Gamification:** XP engine with streak bonuses, stars ($0–3\star$), 8 collectible badges, and 10 world boss trophies.
   - **Features:** 100-slot procedural question bank, geometric SVG diagrams drawn to scale, rule-tag pills, and on-demand "Read Question" narration.
5. **Reflect & Celebration:**
   - 3-question quick recap targeting core misconceptions.
   - Scoreboard with real streak tracking, 10-world star ledger, boss trophy cabinet, and badge shelf.
   - Optional reflection for Tally and grand celebration screen with confetti.

---

## Documentation

- [Product Requirements Document (PRD)](docs/CrossQuest_G7_Vertically_Opposite_Angles_PRD.md)
- [Technical Requirements Document (TRD)](docs/CrossQuest_G7_Vertically_Opposite_Angles_TRD.md)

---

## Running Locally

```bash
npm install
npm test        # Run the 5-suite mathematical QA stress test (30,000 iterations)
npm run dev     # Vite development server
npm run build   # Production bundle build
npm run preview # Preview production build locally
```

---

## Deployment

The project is structured for zero-config production deployment on Vercel, Netlify, Cloudflare Pages, or any static hosting service:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+
- **Environment Variables (Optional for on-the-fly speech):**
  - `ELEVENLABS_API_KEY`: Serverless function key (for `api/elevenlabs.js` on Vercel)
  - `VITE_ELEVENLABS_API_KEY`: Client-side fallback key for local development

---

## Audio Pipeline (ElevenLabs "Alice")

The audio system uses an **ElevenLabs-only** pipeline with zero browser speech synthesis fallback:
- **Voice:** Alice (Clear, Engaging Educator) — Voice ID: `Xb7hH8MSUJpSbSDYk0k2`
- **Model:** `eleven_multilingual_v2`
- **Offline Generation:**
  ```bash
  # With VITE_ELEVENLABS_API_KEY in .env.local:
  npm run generate-audio   # writes public/assets/audio/*.mp3 + src/utils/audioMap.js
  npm run clean-audio      # cleans orphaned audio assets
  ```
- **Fallback behavior:** If static asset is missing and no API key is present, narration skips silently without robotic synthetic voices.
- Spoken text conversion (`src/engine/toSpoken.js`) expands all symbols, abbreviations, and degrees into natural English words before narration.

---

## Art Brief: 6 Story Panels ($1024 \times 1024$)

Style: Painterly neon-glow storybook, deep cosmic purple palette, vibrant gold and cyan accents, friendly 3D animated character style.

| Panel | Filename | Scene & Mood |
|---|---|---|
| 1 | `slide1.png` | Aerial view of a glowing Crossroads City junction; four corner arcs shimmer; Priya and Wei Ming on a hover-platform holding a holographic blueprint. |
| 2 | `slide2.png` | Close-up of the crossing labelled A, B, C, D with vertex O in gold; opposite corners glow the same color; Tally the Owl perched on the vertex. |
| 3 | `slide3.png` | A long straight neon road with a protractor-style half-turn arc labelled $180^\circ$; Wei Ming pointing at a $65^\circ / 115^\circ$ split. |
| 4 | `slide4.png` | Giant holographic proof wall: three linked equations lighting up in sequence ($a+b=180^\circ$, $c+b=180^\circ \implies a=c$); Priya at the wall, Tally reading. |
| 5 | `slide5.png` | Two-panel scene: a numeric crossing ($65^\circ / 115^\circ / 65^\circ / 115^\circ$) and Wei Ming at a whiteboard with algebra; bridge X-brace behind them. |
| 6 | `slide6.png` | Futuristic six-way hub with three lines through one point; studio lab door glowing at the end; Priya, Wei Ming, and Tally looking ahead excitedly. |
