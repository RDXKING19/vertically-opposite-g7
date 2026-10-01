export const MIN_ANGLE = 20;
export const MAX_ANGLE = 160;
export const RIGHT_LO = 85;
export const RIGHT_HI = 95;

/** Mulberry32 PRNG for deterministic or seeded generation */
export const makeRng = (seed = Date.now()) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

export const straightPartner = t => 180 - t;

export const isCleanAngle = (t, { allowRight = false } = {}) =>
  Number.isInteger(t) &&
  t >= MIN_ANGLE &&
  t <= MAX_ANGLE &&
  (allowRight || t < RIGHT_LO || t > RIGHT_HI);

/**
 * Pick clean angle θ for two crossing straight lines.
 * Both θ and 180° − θ fall strictly within [20°, 160°] and avoid near-right angles [85°, 95°].
 */
export function pickCrossAngle(rng, { multipleOf5 = false, allowRight = false } = {}) {
  for (let i = 0; i < 500; i++) {
    const t = multipleOf5 ? 5 * randInt(rng, 4, 32) : randInt(rng, MIN_ANGLE, MAX_ANGLE);
    if (isCleanAngle(t, { allowRight }) && isCleanAngle(180 - t, { allowRight }) && (allowRight || t !== 90)) {
      return t;
    }
  }
  return 65; // proven clean fallback
}

export const evalExpr = (e, x) => e.a * x + e.b;

export const exprText = e => {
  const ax = e.a === 1 ? 'x' : `${e.a}x`;
  return e.b === 0 ? ax : e.b > 0 ? `${ax} + ${e.b}` : `${ax} − ${-e.b}`;
};

/**
 * VOA equation e1(x) = e2(x):
 * - integer x ∈ [4, 30]
 * - distinct integer coefficients a1, a2 ∈ [1, 6]
 * - both sides evaluate to a single clean angle ∈ [20°, 160°]
 * - x itself never equals the angle value (prevents answer confusion)
 * - 180° - angle is also clean
 */
export function makeVoaEquation(rng) {
  for (let i = 0; i < 2000; i++) {
    const x = randInt(rng, 4, 30);
    const a1 = randInt(rng, 1, 6);
    const a2 = randInt(rng, 1, 6);
    if (a1 === a2) continue;
    const b1 = randInt(rng, -30, 60);
    const angle = a1 * x + b1;
    const b2 = angle - a2 * x;
    if (b1 === 0 || b2 === 0 || Math.abs(b2) > 60) continue;
    if (!isCleanAngle(angle) || angle === x || !isCleanAngle(180 - angle)) continue;
    return { x, angle, e1: { a: a1, b: b1 }, e2: { a: a2, b: b2 } };
  }
  // Proven fallback (from PRD worked example)
  return { x: 15, angle: 55, e1: { a: 3, b: 10 }, e2: { a: 5, b: -20 } };
}

/**
 * Three-line hub:
 * α + β + γ = 180°, all multiples of 5, distinct, all clean (>=20, not in 85..95).
 */
export function makeHub(rng) {
  for (let i = 0; i < 2000; i++) {
    const a = 5 * randInt(rng, 4, 20);
    const b = 5 * randInt(rng, 4, 20);
    const c = 180 - a - b;
    if (c < MIN_ANGLE || c % 5 !== 0) continue;
    if (new Set([a, b, c]).size < 3) continue;
    if ([a, b, c].some(v => v >= RIGHT_LO && v <= RIGHT_HI)) continue;
    return { a, b, c };
  }
  return { a: 40, b: 65, c: 75 };
}

/**
 * Two-line crossing geometry at point O.
 * Line 1 passes through rays A (rotation) and C (rotation + 180).
 * Line 2 passes through rays B (rotation + theta) and D (rotation + 180 + theta).
 */
export function crossGeometry(theta, rotation = 0, R = 100) {
  const norm = deg => ((deg % 360) + 360) % 360;
  const rays = {
    A: norm(rotation),
    B: norm(rotation + theta),
    C: norm(rotation + 180),
    D: norm(rotation + 180 + theta)
  };
  const angles = {
    AOB: theta,
    BOC: 180 - theta,
    COD: theta,
    DOA: 180 - theta
  };
  // Math.cos / Math.sin: in SVG y increases downward, so -sin produces standard Cartesian y-up
  const pt = (d, r = R) => [
    r * Math.cos((d * Math.PI) / 180),
    -r * Math.sin((d * Math.PI) / 180)
  ];

  const arc = (from, to, r = 40) => {
    const sweepDiff = ((to - from) % 360 + 360) % 360;
    const large = sweepDiff > 180 ? 1 : 0;
    const [x1, y1] = pt(from, r);
    const [x2, y2] = pt(to, r);
    // SVG arc format: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    // Because y is flipped, counter-clockwise in Cartesian corresponds to sweep-flag 0 in SVG
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const midRay = (from, to) => {
    const diff = ((to - from) % 360 + 360) % 360;
    return norm(from + diff / 2);
  };

  return {
    rays,
    angles,
    pt,
    arc,
    midRay,
    sweep: (a, b) => ((rays[b] - rays[a]) % 360 + 360) % 360
  };
}

/**
 * Three-line hub geometry at vertex O.
 * 3 full straight lines: AD (rotation), BE (rotation + a), CF (rotation + a + b).
 * The three adjacent angles on line AD are a, b, c (where a + b + c = 180°).
 */
export function hubGeometry(a, b, c, rotation = 0, R = 100) {
  const norm = deg => ((deg % 360) + 360) % 360;
  const rays = {
    A: norm(rotation),
    B: norm(rotation + a),
    C: norm(rotation + a + b),
    D: norm(rotation + 180),
    E: norm(rotation + 180 + a),
    F: norm(rotation + 180 + a + b)
  };
  const sectors = {
    AOB: a,
    BOC: b,
    COD: c,
    DOE: a,
    EOF: b,
    FOA: c
  };

  const pt = (d, r = R) => [
    r * Math.cos((d * Math.PI) / 180),
    -r * Math.sin((d * Math.PI) / 180)
  ];

  const arc = (from, to, r = 40) => {
    const sweepDiff = ((to - from) % 360 + 360) % 360;
    const large = sweepDiff > 180 ? 1 : 0;
    const [x1, y1] = pt(from, r);
    const [x2, y2] = pt(to, r);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const midRay = (from, to) => {
    const diff = ((to - from) % 360 + 360) % 360;
    return norm(from + diff / 2);
  };

  return { rays, sectors, pt, arc, midRay };
}
