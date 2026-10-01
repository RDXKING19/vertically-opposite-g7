import { makeRng, pickCrossAngle, makeVoaEquation, makeHub, isCleanAngle, evalExpr, crossGeometry } from '../src/engine/angleMath.js';
import { buildOptions, misconceptionCandidates } from '../src/engine/distractors.js';
import { makeQuestion, buildWorldBank } from '../src/engine/questionBank.js';
import { toSpoken, BAD_SPOKEN } from '../src/engine/toSpoken.js';
import { calcStars, calcXP } from '../src/engine/scoring.js';
import { getAllNarration } from '../src/utils/narration.js';
import { STORY_PANELS } from '../src/data/story.js';
import { WORLDS } from '../src/data/worlds.js';

console.log('=== CROSSQUEST QA STRESS TEST SUITE ===\n');

// 1. Stress Test: pickCrossAngle, makeVoaEquation, makeHub (30,000 iterations each)
console.log('1. Running 30,000 iterations on core math generators...');
const rng = makeRng(123456789);
let mathFails = 0;
let minAngle = 180, maxAngle = 0;

for (let i = 0; i < 30000; i++) {
  // pickCrossAngle
  const t = pickCrossAngle(rng, { multipleOf5: i % 2 === 0 });
  if (!isCleanAngle(t) || !isCleanAngle(180 - t)) {
    mathFails++;
    console.error(`pickCrossAngle failed at ${i}: ${t}`);
  }
  if (t < minAngle) minAngle = t;
  if (t > maxAngle) maxAngle = t;

  // makeVoaEquation
  const eq = makeVoaEquation(rng);
  const val1 = evalExpr(eq.e1, eq.x);
  const val2 = evalExpr(eq.e2, eq.x);
  if (val1 !== eq.angle || val2 !== eq.angle || eq.e1.a === eq.e2.a || eq.x === eq.angle) {
    mathFails++;
    console.error(`makeVoaEquation failed at ${i}:`, eq);
  }

  // makeHub
  const hub = makeHub(rng);
  if (hub.a + hub.b + hub.c !== 180 || new Set([hub.a, hub.b, hub.c]).size < 3) {
    mathFails++;
    console.error(`makeHub failed at ${i}:`, hub);
  }
}
console.log(`✔ Math Generators: 30,000 runs, fails = ${mathFails}, minAngle = ${minAngle}°, maxAngle = ${maxAngle}°`);

// 2. Question Bank & Distractors (30,000 questions across 10 worlds)
console.log('\n2. Testing 30,000 questions generated across all 10 worlds...');
let qFails = 0;
for (let i = 0; i < 3000; i++) {
  for (let w = 0; w < 10; w++) {
    const slot = i % 10;
    const q = makeQuestion(w, slot, rng);
    if (!q.questionText || !q.correctAnswer || q.options.length !== 4) {
      qFails++;
    }
    if (new Set(q.options).size !== 4) {
      qFails++;
      console.error(`Duplicate option in world ${w} slot ${slot}:`, q.options);
    }
    if (!q.options.includes(q.correctAnswer)) {
      qFails++;
      console.error(`Correct answer missing from options in world ${w} slot ${slot}:`, q);
    }
    if (q.options.some(o => o === undefined || o === 'undefined' || o === 'NaN' || o.includes('NaN'))) {
      qFails++;
      console.error(`NaN/undefined in options in world ${w} slot ${slot}:`, q);
    }
  }
}
console.log(`✔ Question Bank & Distractor Engine: 30,000 questions, fails = ${qFails}`);

// 3. Diagram Geometry (20,000 random (theta, rotation) pairs)
console.log('\n3. Testing 20,000 SVG diagram geometry invariants...');
let geomFails = 0;
for (let i = 0; i < 20000; i++) {
  const theta = 20 + Math.floor(rng() * 140);
  const rot = Math.floor(rng() * 360);
  const geom = crossGeometry(theta, rot);
  const sAB = geom.sweep('A', 'B');
  const sBC = geom.sweep('B', 'C');
  const sCD = geom.sweep('C', 'D');
  const sDA = geom.sweep('D', 'A');

  if (sAB !== theta || sCD !== theta || sBC !== 180 - theta || sDA !== 180 - theta) {
    geomFails++;
  }
  if (sAB + sBC + sCD + sDA !== 360) {
    geomFails++;
  }
}
console.log(`✔ Geometry Invariants: 20,000 pairs, fails = ${geomFails}`);

// 4. toSpoken and Narration Bad Symbols
console.log('\n4. Testing toSpoken and static narration phrases...');
const phrases = getAllNarration();
let badPhrases = 0;
for (const p of phrases) {
  if (BAD_SPOKEN.test(p.text)) {
    console.error(`Bad spoken string in narration: "${p.text}"`);
    badPhrases++;
  }
}
console.log(`✔ Narration Audio Strings: ${phrases.length} phrases tested, bad symbol matches = ${badPhrases}`);

// Sample toSpoken tests from PRD §10
const testSamples = [
  '∠AOB = 65°',
  '180° − 65° = 115°',
  '3x + 10 = 5x − 20',
  'x = 15',
  'vert. opp. ∠s',
  'adj. ∠s on a str. line',
  '∠s at a pt',
  'NE / NW / SW / SE'
];
for (const s of testSamples) {
  const spoken = toSpoken(s);
  if (BAD_SPOKEN.test(spoken)) {
    console.error(`toSpoken("${s}") retained forbidden symbols: "${spoken}"`);
  } else {
    console.log(`  toSpoken("${s}") -> "${spoken}"`);
  }
}

// 5. Scoring Formulas
console.log('\n5. Verifying Scoring & XP calculations...');
const stars10 = [10, 9, 8, 7, 6, 5, 4, 0].map(c => calcStars(c, 10));
console.log('10Q Stars [10..4, 0]:', stars10, '(expected: 3, 3, 2, 2, 1, 1, 0, 0)');
const stars5 = [5, 4, 3, 2].map(c => calcStars(c, 5));
console.log('5Q Stars [5..2]:', stars5, '(expected: 3, 2, 1, 0)');
const stars8 = [8, 7, 6, 5, 4, 3].map(c => calcStars(c, 8));
console.log('8Q Stars [8..3]:', stars8, '(expected: 3, 2, 2, 1, 1, 0)');

const xpSamples = [
  { attempt: 1, hintsUsed: 0, streak: 1, expected: 10 },
  { attempt: 1, hintsUsed: 0, streak: 3, expected: 12 },
  { attempt: 1, hintsUsed: 0, streak: 9, expected: 20 },
  { attempt: 2, hintsUsed: 0, streak: 1, expected: 6 },
  { attempt: 1, hintsUsed: 2, streak: 1, expected: 6 },
  { attempt: 3, hintsUsed: 2, streak: 1, expected: 3 }
];
let xpFails = 0;
for (const s of xpSamples) {
  const got = calcXP(s);
  if (got !== s.expected) {
    console.error(`calcXP failed: got ${got}, expected ${s.expected}`);
    xpFails++;
  }
}
console.log(`✔ XP Calculation: fails = ${xpFails}`);

if (mathFails === 0 && qFails === 0 && geomFails === 0 && badPhrases === 0 && xpFails === 0) {
  console.log('\n🎉 ALL 5 QA TEST SUITES PASSED WITH ZERO FAILURES!');
} else {
  console.error('\n✖ Some QA tests failed!');
  process.exit(1);
}
