import { MC } from './misconceptions.js';

/**
 * Builds 4 distinct options containing 1 correct answer and 3 well-formed distractors.
 * Handles numbers or string options.
 */
export function buildOptions(rng, correct, candidates = [], { lo = 10, hi = 350, fmt = v => (typeof v === 'number' ? `${v}°` : String(v)) } = {}) {
  const isNumeric = typeof correct === 'number';

  if (!isNumeric) {
    const correctStr = String(correct);
    const seen = new Set([correctStr]);
    const wrong = [];

    for (const c of candidates) {
      const s = String(c);
      if (wrong.length < 3 && s && !seen.has(s)) {
        seen.add(s);
        wrong.push(s);
      }
    }

    // Fallback fill if not enough candidates
    const defaultFallbacks = ['None of these', 'Cannot be determined', 'Adjacent angles', '90°'];
    for (const fb of defaultFallbacks) {
      if (wrong.length < 3 && !seen.has(fb)) {
        seen.add(fb);
        wrong.push(fb);
      }
    }

    const raw = [correctStr, ...wrong];
    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [raw[i], raw[j]] = [raw[j], raw[i]];
    }
    return { options: raw, correctAnswer: correctStr };
  }

  // Numeric option builder
  const seen = new Set([correct]);
  const wrong = [];
  const ok = c => Number.isInteger(c) && c >= lo && c <= hi && !seen.has(c);

  for (const c of candidates) {
    if (wrong.length < 3 && ok(c)) {
      seen.add(c);
      wrong.push(c);
    }
  }

  // Top up with near-misses
  const deltas = [5, -5, 10, -10, 15, -15, 20, -20, 25, -25, 30, -30];
  for (const d of deltas) {
    const candidate = correct + d;
    if (wrong.length < 3 && ok(candidate)) {
      seen.add(candidate);
      wrong.push(candidate);
    }
  }

  if (wrong.length < 3) {
    for (let fallback = lo; fallback <= hi && wrong.length < 3; fallback += 10) {
      if (ok(fallback)) {
        seen.add(fallback);
        wrong.push(fallback);
      }
    }
  }

  const raw = [correct, ...wrong];
  // Fisher-Yates shuffle
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]];
  }

  return {
    options: raw.map(fmt),
    correctAnswer: fmt(correct)
  };
}

/** MC-1..MC-4 numeric candidate generators for a simple crossing θ (see PRD §8.3) */
export const misconceptionCandidates = theta => [
  180 - theta,            // MC-1 supplementary
  90 - theta,             // MC-2 complementary
  360 - theta,            // MC-3 reflex
  theta * 2,              // MC-4 doubling
  Math.round(theta / 2)   // MC-4 halving
];
