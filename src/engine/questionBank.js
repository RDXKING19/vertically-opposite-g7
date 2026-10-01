import { WORLDS } from '../data/worlds.js';
import {
  makeRng,
  randInt,
  straightPartner,
  isCleanAngle,
  pickCrossAngle,
  makeVoaEquation,
  makeHub,
  exprText
} from './angleMath.js';
import { buildOptions, misconceptionCandidates } from './distractors.js';

// =========================================================================
// WORLD 0: NAMING TEMPLATES
// =========================================================================
function tNameVertex(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Lines AC and BD cross at point O. Which point is the vertex of angle AOB?',
    correct: 'Point O',
    distractorCandidates: ['Point A', 'Point B', 'Point C', 'Point D'],
    explanation: 'The vertex is the common meeting point where the rays meet. For angle AOB, the middle letter O is the vertex.',
    hint1: 'Look at the letter in the middle of angle AOB.',
    hint2: 'Both straight lines intersect at the central point O.',
    ruleTag: 'Naming Angles',
    figure: { type: 'cross', theta, rotation: 15, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: null }
  };
}

function tNameAngle(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Lines PR and QS cross at point X. What is another name for angle PXQ?',
    correct: '∠QXP',
    distractorCandidates: ['∠PXR', '∠SXQ', '∠QXR', '∠SXP'],
    explanation: 'Angle PXQ and angle QXP describe the exact same angle. The vertex X remains in the middle, while the outside rays are reversed.',
    hint1: 'The vertex must always remain in the middle position.',
    hint2: 'Reading the rays in reverse order from Q to X to P gives ∠QXP.',
    ruleTag: 'Angle Notation',
    figure: { type: 'cross', theta, rotation: 30, labels: ['P', 'Q', 'R', 'S'], showAngles: ['AOB'], unknown: null }
  };
}

function tCountAngles(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'When two straight lines cross at a single point, how many angles are formed around that vertex?',
    correct: 4,
    distractorCandidates: [2, 6, 8, 3],
    fmt: v => String(v),
    explanation: 'Two crossing straight lines divide the plane into exactly 4 angles around the central vertex.',
    hint1: 'Count the four corners created around the intersection point.',
    hint2: 'There are two pairs of vertically opposite angles, making 4 angles in total.',
    ruleTag: 'Crossing Basics',
    figure: { type: 'cross', theta, rotation: 25, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'BOC', 'COD', 'DOA'], unknown: null }
  };
}

function tOppositeRay(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Line AC passes straight through O. Which ray forms a straight line in the opposite direction to ray OA?',
    correct: 'Ray OC',
    distractorCandidates: ['Ray OB', 'Ray OD', 'Ray OA', 'Ray BD'],
    explanation: 'Because AC is a straight line through O, ray OC continues directly opposite to ray OA (180° in the opposite direction).',
    hint1: 'Look along the continuous straight line AC.',
    hint2: 'Starting at O and going opposite to A leads along ray OC.',
    ruleTag: 'Straight Line Rays',
    figure: { type: 'cross', theta, rotation: 20, labels: ['A', 'B', 'C', 'D'], showAngles: [], unknown: null }
  };
}

// =========================================================================
// WORLD 1: IDENTIFY TEMPLATES
// =========================================================================
function tWhichIsOpposite(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'In the diagram, which angle is vertically opposite to ∠AOB?',
    correct: '∠COD',
    distractorCandidates: ['∠BOC', '∠DOA', '∠AOC', '∠BOD'],
    explanation: 'Angle COD faces angle AOB directly across the vertex O. They are formed by opposite rays along lines AC and BD.',
    hint1: 'Look directly across the vertex O from angle AOB.',
    hint2: 'The opposite angle uses the opposite rays: ray OC and ray OD, forming ∠COD.',
    ruleTag: 'Identify VOA',
    figure: { type: 'cross', theta, rotation: 10, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'COD' }
  };
}

function tWhichPairIsVOA(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Lines AC and BD cross at O. Which of the following is a pair of vertically opposite angles?',
    correct: '∠BOC and ∠DOA',
    distractorCandidates: ['∠AOB and ∠BOC', '∠COD and ∠DOA', '∠BOC and ∠COD', '∠AOB and ∠DOA'],
    explanation: '∠BOC and ∠DOA face each other directly across vertex O. The others are adjacent pairs sharing a common side.',
    hint1: 'Adjacent angles share an arm; vertically opposite angles face each other across the vertex.',
    hint2: '∠BOC and ∠DOA share only vertex O and have opposite rays.',
    ruleTag: 'Spotting Pairs',
    figure: { type: 'cross', theta, rotation: 35, labels: ['A', 'B', 'C', 'D'], showAngles: ['BOC', 'DOA'], unknown: null }
  };
}

function tAdjacentVsOpposite(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Which angle is ADJACENT (next to) ∠AOB on the straight line AC?',
    correct: '∠BOC',
    distractorCandidates: ['∠COD', '∠DOA', '∠AOC', '∠BOD'],
    explanation: '∠BOC shares the arm OB with ∠AOB and lies on the straight line AC, making them adjacent supplementary angles.',
    hint1: 'Adjacent means "side-by-side" sharing a common ray.',
    hint2: 'On line AC, ∠AOB and ∠BOC sit side by side.',
    ruleTag: 'Adjacent vs Opposite',
    figure: { type: 'cross', theta, rotation: 15, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'BOC'], unknown: null }
  };
}

function tBentLineTrap(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Line PQ is straight, but line RS bends at vertex O. Are ∠POR and ∠QOS vertically opposite angles?',
    correct: 'No — both lines must be perfectly straight',
    distractorCandidates: [
      'Yes — they face each other across O',
      'Yes — they always equal each other',
      'No — only right angles can be vertically opposite'
    ],
    explanation: 'Vertically opposite angles require TWO straight intersecting lines. Because RS bends at O, the angles are not vertically opposite and are not equal!',
    hint1: 'Check if both lines form uninterrupted straight lines through the vertex.',
    hint2: 'If a line bends at the crossing, the vertically opposite angle property fails.',
    ruleTag: 'Bent Line Trap',
    figure: { type: 'cross', theta, rotation: 20, labels: ['P', 'R', 'Q', 'S'], bent: true, bendAngle: 25, showAngles: ['AOB', 'COD'], unknown: null }
  };
}

// =========================================================================
// WORLD 2: EQUAL TEMPLATES
// =========================================================================
function tFindOppositeAcute(rng, slotIndex) {
  const mult5 = slotIndex < 6;
  const theta = pickCrossAngle(rng, { multipleOf5: mult5 });
  const candidates = misconceptionCandidates(theta);
  return {
    prompt: `Lines AC and BD cross at O. If ∠AOB = ${theta}°, what is the size of its vertically opposite angle ∠COD?`,
    correct: theta,
    distractorCandidates: candidates,
    explanation: `Vertically opposite angles are equal! Therefore, ∠COD = ∠AOB = ${theta}°.`,
    hint1: 'Angles facing each other across the vertex are vertically opposite.',
    hint2: 'Vertically opposite angles are always equal in size.',
    ruleTag: 'Opposite Angles are Equal',
    figure: { type: 'cross', theta, rotation: 10, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'COD', values: { AOB: `${theta}°` } }
  };
}

function tFindOppositeObtuse(rng, slotIndex) {
  const mult5 = slotIndex < 6;
  const acute = pickCrossAngle(rng, { multipleOf5: mult5 });
  const obtuse = 180 - acute;
  const candidates = misconceptionCandidates(obtuse);
  return {
    prompt: `In the crossing, ∠BOC = ${obtuse}°. Find the size of ∠DOA.`,
    correct: obtuse,
    distractorCandidates: candidates,
    explanation: `∠BOC and ∠DOA are vertically opposite angles. Since vertically opposite angles are equal, ∠DOA = ${obtuse}°.`,
    hint1: 'Look at the position of ∠DOA relative to ∠BOC.',
    hint2: 'They face each other directly across the vertex O, so their measures are equal.',
    ruleTag: 'Obtuse Angle Twins',
    figure: { type: 'cross', theta: acute, rotation: 25, labels: ['A', 'B', 'C', 'D'], showAngles: ['BOC'], unknown: 'DOA', values: { BOC: `${obtuse}°` } }
  };
}

// =========================================================================
// WORLD 3: SUPPLEMENT TEMPLATES
// =========================================================================
function tStraightPartner(rng, slotIndex) {
  const mult5 = slotIndex < 6;
  const theta = pickCrossAngle(rng, { multipleOf5: mult5 });
  const partner = 180 - theta;
  const candidates = [theta, 90 - theta, 360 - theta, theta + 20];
  return {
    prompt: `AOC is a straight line. If ∠AOB = ${theta}°, find the adjacent angle ∠BOC.`,
    correct: partner,
    distractorCandidates: candidates,
    explanation: `Adjacent angles on a straight line add up to 180°. Therefore, ∠BOC = 180° − ${theta}° = ${partner}°.`,
    hint1: 'Angles side by side on a straight line make a half turn.',
    hint2: 'Subtract the known angle from 180°: 180° − ' + theta + '°.',
    ruleTag: 'Angles on a Straight Line',
    figure: { type: 'cross', theta, rotation: 0, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'BOC', values: { AOB: `${theta}°` } }
  };
}

function tSumOfAdjacentPair(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Two angles ∠AOB and ∠BOC lie side by side on a straight line. What is their sum?',
    correct: 180,
    distractorCandidates: [90, 360, 270, 100],
    explanation: 'Adjacent angles on a straight line always sum to 180° (a half turn).',
    hint1: 'A straight line represents half of a full turn (360° / 2).',
    hint2: 'The sum is always exactly 180°.',
    ruleTag: 'Linear Pair Sum',
    figure: { type: 'cross', theta, rotation: 0, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'BOC'], unknown: null }
  };
}

// =========================================================================
// WORLD 4: ALL-FOUR TEMPLATES
// =========================================================================
function tOneToAnother(rng, slotIndex) {
  const mult5 = slotIndex < 6;
  const theta = pickCrossAngle(rng, { multipleOf5: mult5 });
  const partner = 180 - theta;
  return {
    prompt: `Lines AC and BD cross at O. Given ∠AOB = ${theta}°, find the measure of ∠DOA.`,
    correct: partner,
    distractorCandidates: [theta, 90 - theta, 360 - theta, theta * 2],
    explanation: `∠AOB and ∠DOA lie along straight line BD, so they are adjacent supplementary angles: ∠DOA = 180° − ${theta}° = ${partner}°.`,
    hint1: 'Check if ∠DOA is vertically opposite or adjacent to ∠AOB.',
    hint2: 'They share the ray OA on straight line BD, so they add to 180°.',
    ruleTag: 'Full Intersection',
    figure: { type: 'cross', theta, rotation: 10, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'DOA', values: { AOB: `${theta}°` } }
  };
}

function tRightAngleCross() {
  return {
    prompt: 'Two straight lines cross at right angles (90°). If ∠AOB = 90°, what is the size of ∠BOC?',
    correct: 90,
    distractorCandidates: [180, 45, 270, 60],
    explanation: 'Adjacent angles on a line add to 180°. Here 180° − 90° = 90°. When lines are perpendicular, all four angles are 90°!',
    hint1: 'Subtract 90° from 180° on the straight line.',
    hint2: '180° − 90° = 90°.',
    ruleTag: 'Perpendicular Crossing',
    figure: { type: 'cross', theta: 90, rotation: 0, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'BOC', values: { AOB: '90°' } }
  };
}

function tSumAllFour(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'What is the sum of all four angles formed at the intersection of two straight lines?',
    correct: 360,
    distractorCandidates: [180, 720, 90, 540],
    explanation: 'The four angles make a complete rotation around the central vertex O. Angles at a point always add up to 360°.',
    hint1: 'Think of turning all the way around a point in a full circle.',
    hint2: 'Two straight lines give two half-turns: 180° + 180° = 360°.',
    ruleTag: 'Angles at a Point',
    figure: { type: 'cross', theta, rotation: 20, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'BOC', 'COD', 'DOA'], unknown: null }
  };
}

// =========================================================================
// WORLD 5: REASONING TEMPLATES
// =========================================================================
function tReasonForStep(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Lines AC and BD cross at O. Which geometric reason explains why ∠AOB = ∠COD?',
    correct: 'Vertically opposite angles are equal',
    distractorCandidates: [
      'Adjacent angles on a straight line add up to 180°',
      'Angles at a point add up to 360°',
      'Alternate angles are equal'
    ],
    explanation: '∠AOB and ∠COD are opposite each other across vertex O. The correct reason is "vertically opposite angles are equal".',
    hint1: 'What is the special geometric relationship between opposite angles?',
    hint2: 'Angles across the vertex from each other are vertically opposite angles.',
    ruleTag: 'Geometric Reasoning',
    figure: { type: 'cross', theta, rotation: 15, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'COD'], unknown: null }
  };
}

function tSpotWeiMingsFlaw(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'Wei Ming claims: "Because ∠AOB and ∠COD face each other, ∠AOB + ∠COD = 180°." What is his error?',
    correct: 'Vertically opposite angles are equal, not supplementary',
    distractorCandidates: [
      'They add up to 90°, not 180°',
      'They add up to 360°, not 180°',
      'Wei Ming is correct — opposite angles always add up to 180°'
    ],
    explanation: 'Wei Ming mixed up vertically opposite angles with adjacent angles on a straight line! Opposite angles are equal (∠AOB = ∠COD).',
    hint1: 'Do opposite angles add up to 180°, or are they equal?',
    hint2: 'Opposite angles are identical twins; adjacent angles on a line add to 180°.',
    ruleTag: 'Spot the Error',
    figure: { type: 'cross', theta, rotation: 25, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'COD'], unknown: null }
  };
}

function tMissingProofLine(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: 'In the proof that opposite angles a and c are equal: a + b = 180° and c + b = 180°. What follows?',
    correct: 'Both a and c equal 180° − b, so a = c',
    distractorCandidates: [
      'a + c = 180°',
      'a + b + c = 360°',
      'b must equal 90°'
    ],
    explanation: 'Subtracting b from both equations gives a = 180° − b and c = 180° − b. Since both equal the same quantity, a = c.',
    hint1: 'If two things are both equal to (180° − b), how do they compare?',
    hint2: 'Things equal to the same thing are equal to each other (a = c).',
    ruleTag: 'Proof of VOA',
    figure: { type: 'cross', theta, rotation: 10, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'BOC', 'COD'], unknown: null, values: { AOB: 'a', BOC: 'b', COD: 'c' } }
  };
}

// =========================================================================
// WORLD 6: ALGEBRA TEMPLATES
// =========================================================================
function tVoaSimple(rng) {
  const x = randInt(rng, 5, 25);
  const b = randInt(rng, 10, 45);
  const angle = x + b;
  const theta = isCleanAngle(angle) ? angle : 65;
  const actualX = theta - b;

  return {
    prompt: `∠AOB = (x + ${b})° and its vertically opposite angle ∠COD = ${theta}°. Find the value of x.`,
    correct: actualX,
    distractorCandidates: [actualX + 5, actualX - 5, theta, 180 - theta],
    fmt: v => `x = ${v}`,
    explanation: `Since vertically opposite angles are equal: x + ${b} = ${theta}. Subtract ${b} from both sides to get x = ${actualX}.`,
    hint1: 'Set the algebraic expression equal to the known opposite angle.',
    hint2: `Solve: x + ${b} = ${theta} by subtracting ${b}.`,
    ruleTag: 'Algebraic VOA',
    figure: { type: 'cross', theta, rotation: 20, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'COD', values: { AOB: `(x + ${b})°`, COD: `${theta}°` } }
  };
}

function tVoaTwoSided(rng) {
  const eq = makeVoaEquation(rng);
  const expr1Str = exprText(eq.e1);
  const expr2Str = exprText(eq.e2);

  return {
    prompt: `Angles (${expr1Str})° and (${expr2Str})° are vertically opposite. What is the value of x?`,
    correct: eq.x,
    distractorCandidates: [eq.x + 3, eq.x - 2, eq.angle, Math.round(eq.angle / 2)],
    fmt: v => `x = ${v}`,
    explanation: `Because vertically opposite angles are equal, ${expr1Str} = ${expr2Str}. Solving this linear equation gives x = ${eq.x}. (Each angle is ${eq.angle}°).`,
    hint1: 'Set both expressions equal to each other: ' + expr1Str + ' = ' + expr2Str,
    hint2: 'Collect the x terms on one side and the constant terms on the other side.',
    ruleTag: 'Two-Sided Equations',
    figure: { type: 'cross', theta: eq.angle, rotation: 15, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'COD'], unknown: null, values: { AOB: `(${expr1Str})°`, COD: `(${expr2Str})°` } }
  };
}

function tVoaFindAngleNotX(rng) {
  const eq = makeVoaEquation(rng);
  const expr1Str = exprText(eq.e1);
  const expr2Str = exprText(eq.e2);

  return {
    prompt: `Angles (${expr1Str})° and (${expr2Str})° are vertically opposite. Find the size of the angle (NOT just x).`,
    correct: eq.angle,
    distractorCandidates: [eq.x, 180 - eq.angle, eq.angle + 10, eq.angle - 15],
    explanation: `First solve ${expr1Str} = ${expr2Str} to find x = ${eq.x}. Then substitute x back: ${eq.e1.a}(${eq.x}) + (${eq.e1.b}) = ${eq.angle}°.`,
    hint1: 'First find x, then substitute x back into either expression to find the angle!',
    hint2: `x = ${eq.x}. Substitute into ${expr1Str} to get the angle in degrees.`,
    ruleTag: 'Find Angle Size',
    figure: { type: 'cross', theta: eq.angle, rotation: 25, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'COD', values: { AOB: `(${expr1Str})°`, COD: `(${expr2Str})°` } }
  };
}

// =========================================================================
// WORLD 7: CONTEXT (REAL WORLD) TEMPLATES
// =========================================================================
function tRoadScenario(rng) {
  const theta = pickCrossAngle(rng, { multipleOf5: true });
  return {
    prompt: `Two straight roads cross in Crossroads City. The north-east corner measures ${theta}°. What is the size of the south-west corner?`,
    correct: theta,
    distractorCandidates: [180 - theta, 90 - theta, 360 - theta, theta + 15],
    explanation: `The south-west corner is vertically opposite to the north-east corner across the junction. Therefore, it is exactly ${theta}°.`,
    hint1: 'North-east and south-west face directly across the intersection.',
    hint2: 'Vertically opposite angles are equal, so the angle is unchanged.',
    ruleTag: 'Road Intersection',
    figure: { type: 'cross', theta, rotation: 45, labels: ['N', 'E', 'S', 'W'], showAngles: ['AOB'], unknown: 'COD', values: { AOB: `${theta}°` } }
  };
}

function tScissorsScenario(rng) {
  const theta = 5 * randInt(rng, 6, 16); // 30° - 80°
  return {
    prompt: `Priya opens a pair of shears so the blades make a ${theta}° angle. What angle do the handles make?`,
    correct: theta,
    distractorCandidates: [180 - theta, 90 - theta, theta * 2, theta - 10],
    explanation: `The pivot of the shears is the vertex where two straight steel arms cross. The handles form a vertically opposite angle to the blades, so they make ${theta}°.`,
    hint1: 'The blades and handles are formed by two rigid lines crossing at the central pivot pin.',
    hint2: 'Angles across the pivot are vertically opposite and equal.',
    ruleTag: 'Scissor Blades',
    figure: { type: 'cross', theta, rotation: 10, labels: ['B1', 'H1', 'B2', 'H2'], showAngles: ['AOB'], unknown: 'COD', values: { AOB: `${theta}°` } }
  };
}

// =========================================================================
// WORLD 8: THREE-LINE HUB TEMPLATES
// =========================================================================
function tHubFindGamma(rng) {
  const hub = makeHub(rng);
  const { a, b, c } = hub;
  return {
    prompt: `Three straight lines AD, BE, and CF meet at vertex O. If ∠AOB = ${a}° and ∠BOC = ${b}°, find ∠COD.`,
    correct: c,
    distractorCandidates: [180 - c, a + b, 360 - (a + b), Math.abs(a - b)],
    explanation: `Line AD is a straight line, so the three angles on one side add up to 180°: ∠COD = 180° − (${a}° + ${b}°) = ${c}°.`,
    hint1: 'Line AD is straight. The three angles sitting along it must sum to 180°.',
    hint2: `Calculate 180° − ${a}° − ${b}°.`,
    ruleTag: 'Three-Line Hub',
    figure: { type: 'hub', hubAngles: { a, b, c }, rotation: 0, showAngles: ['AOB', 'BOC'], unknown: 'COD' }
  };
}

function tHubFindTwin(rng) {
  const hub = makeHub(rng);
  const { a, b, c } = hub;
  return {
    prompt: `Three lines AD, BE, CF intersect at O. If ∠AOB = ${a}°, which sector is its vertically opposite angle, and what is its size?`,
    correct: `${a}° (∠DOE)`,
    distractorCandidates: [
      `${b}° (∠EOF)`,
      `${c}° (∠FOA)`,
      `${180 - a}° (∠BOD)`
    ],
    explanation: `Lines AD and BE make ∠AOB. Their opposite rays OD and OE form ∠DOE. Vertically opposite angles are equal, so ∠DOE = ${a}°.`,
    hint1: 'Trace rays OA and OB through the vertex O to their opposite rays OD and OE.',
    hint2: `Ray OA continues to OD, and ray OB continues to OE, forming ∠DOE = ${a}°.`,
    ruleTag: 'Hub Opposite Twins',
    figure: { type: 'hub', hubAngles: { a, b, c }, rotation: 0, showAngles: ['AOB'], unknown: 'DOE' }
  };
}

// =========================================================================
// WORLD 9: GRAND FINALE TEMPLATES
// =========================================================================
function tFinaleMixed(rng, slotIndex) {
  // Rotate through hardest problem archetypes
  const subType = slotIndex % 3;
  if (subType === 0) {
    // Two-sided algebra + straight line adjacent angle
    const eq = makeVoaEquation(rng);
    const adjacent = 180 - eq.angle;
    const expr1Str = exprText(eq.e1);
    const expr2Str = exprText(eq.e2);
    return {
      prompt: `(${expr1Str})° and (${expr2Str})° are vertically opposite angles. Find the size of an ADJACENT angle on a straight line.`,
      correct: adjacent,
      distractorCandidates: [eq.angle, eq.x, 360 - eq.angle, eq.angle + 20],
      explanation: `Set ${expr1Str} = ${expr2Str} to find x = ${eq.x}, which makes each opposite angle ${eq.angle}°. The adjacent angle on the straight line is 180° − ${eq.angle}° = ${adjacent}°.`,
      hint1: 'First find the angle itself by equating the expressions, then subtract from 180°!',
      hint2: `The angle is ${eq.angle}°. Now calculate 180° − ${eq.angle}°.`,
      ruleTag: 'Grand Finale Challenge',
      figure: { type: 'cross', theta: eq.angle, rotation: 20, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB'], unknown: 'BOC', values: { AOB: `(${expr1Str})°`, COD: `(${expr2Str})°` } }
    };
  }

  if (subType === 1) {
    // Complex hub finding opposite sector
    const hub = makeHub(rng);
    const { a, b, c } = hub;
    return {
      prompt: `Three lines intersect at O. Given ∠AOB = ${a}° and ∠BOC = ${b}°, find ∠EOF.`,
      correct: b,
      distractorCandidates: [a, c, 180 - b, 90 - b],
      explanation: `∠EOF is vertically opposite to ∠BOC across the intersection. Because vertically opposite angles are equal, ∠EOF = ${b}°.`,
      hint1: 'Find which sector is vertically opposite to ∠EOF.',
      hint2: 'Rays OE and OF are opposite to rays OB and OC, so ∠EOF = ∠BOC = ' + b + '°.',
      ruleTag: 'Grand Finale Hub',
      figure: { type: 'hub', hubAngles: { a, b, c }, rotation: 10, showAngles: ['AOB', 'BOC'], unknown: 'EOF' }
    };
  }

  // Pure multi-step angle reasoning
  const theta = pickCrossAngle(rng, { multipleOf5: false });
  const partner = 180 - theta;
  return {
    prompt: `Two lines cross at O. If ∠AOB + ∠COD = ${theta * 2}°, what is the size of ∠BOC?`,
    correct: partner,
    distractorCandidates: [theta, theta * 2, 360 - theta * 2, 90 - theta],
    explanation: `∠AOB and ∠COD are vertically opposite and equal, so each is ${theta * 2}° ÷ 2 = ${theta}°. Adjacent angle ∠BOC = 180° − ${theta}° = ${partner}°.`,
    hint1: 'Opposite angles are equal, so divide the sum by 2 to find one angle.',
    hint2: `Each opposite angle is ${theta}°. Subtract from 180° to find ∠BOC.`,
    ruleTag: 'Grand Finale Synthesis',
    figure: { type: 'cross', theta, rotation: 30, labels: ['A', 'B', 'C', 'D'], showAngles: ['AOB', 'COD'], unknown: 'BOC' }
  };
}

// Template collection by category focus
const TEMPLATES = {
  naming: [tNameVertex, tNameAngle, tCountAngles, tOppositeRay],
  identify: [tWhichIsOpposite, tWhichPairIsVOA, tAdjacentVsOpposite, tBentLineTrap],
  equal: [tFindOppositeAcute, tFindOppositeObtuse],
  supplement: [tStraightPartner, tSumOfAdjacentPair],
  'all-four': [tOneToAnother, tSumAllFour, tRightAngleCross],
  reasoning: [tReasonForStep, tSpotWeiMingsFlaw, tMissingProofLine],
  algebra: [tVoaSimple, tVoaTwoSided, tVoaFindAngleNotX],
  context: [tRoadScenario, tScissorsScenario],
  'three-lines': [tHubFindGamma, tHubFindTwin],
  finale: [tFinaleMixed]
};

/**
 * Generate question object for a given worldIndex and slotIndex.
 */
export function makeQuestion(worldIndex, slotIndex = 0, rng = makeRng()) {
  const world = WORLDS[worldIndex] || WORLDS[0];
  const templatesForWorld = TEMPLATES[world.conceptFocus] || TEMPLATES.naming;
  const template = templatesForWorld[slotIndex % templatesForWorld.length];
  const q = template(rng, slotIndex);

  const { options, correctAnswer } = buildOptions(rng, q.correct, q.distractorCandidates, { fmt: q.fmt });

  return {
    id: `${worldIndex}-${slotIndex}`,
    worldId: worldIndex,
    category: world.conceptFocus,
    visual: q.figure?.type ?? 'cross',
    questionText: q.prompt,
    options,
    correctAnswer,
    correctIndex: options.indexOf(correctAnswer),
    explanation: q.explanation,
    hint1: q.hint1,
    hint2: q.hint2,
    visualData: q.figure ?? null,
    ruleTag: q.ruleTag
  };
}

export function buildWorldBank(worldIndex, rng = makeRng()) {
  return Array.from({ length: 10 }, (_, slot) => makeQuestion(worldIndex, slot, rng));
}
