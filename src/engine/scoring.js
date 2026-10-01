/**
 * Calculate stars (0..3) earned based on percentage of correct answers:
 * ≥ 90% -> 3 stars
 * ≥ 70% -> 2 stars
 * ≥ 50% -> 1 star
 * < 50% -> 0 stars
 */
export const calcStars = (correct, total) => {
  if (total <= 0) return 0;
  const pct = (correct * 100) / total;
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  if (pct >= 50) return 1;
  return 0;
};

/**
 * Calculate XP gained for a correct answer:
 * Base: 10 XP on 1st attempt, 6 XP on 2nd, 3 XP thereafter
 * Hint penalty: -2 XP per hint used (floor of 3 XP)
 * Streak bonus: +2 XP per streak step from the 3rd correct answer in a row, capped at +10 XP
 */
export const calcXP = ({ attempt = 1, hintsUsed = 0, streak = 1 } = {}) => {
  const attemptBase = attempt === 1 ? 10 : attempt === 2 ? 6 : 3;
  const base = Math.max(3, attemptBase - 2 * hintsUsed);
  const bonus = streak >= 3 ? Math.min(10, 2 * (streak - 2)) : 0;
  return base + bonus;
};
