const ABBR = [
  [/vert\.?\s*opp\.?\s*∠?s?/gi, 'vertically opposite angles'],
  [/vertically opposite angles are equal/gi, 'vertically opposite angles are equal'],
  [/adj\.?\s*∠?s?\s*on\s*a\s*str\.?\s*line/gi, 'adjacent angles on a straight line'],
  [/adjacent angles on a straight line add up to 180°/gi, 'adjacent angles on a straight line add up to one hundred and eighty degrees'],
  [/∠?s?\s*at\s*a\s*pt\.?/gi, 'angles at a point'],
  [/angles at a point add up to 360°/gi, 'angles at a point add up to three hundred and sixty degrees'],
  [/\balt\.?\s*∠?s?\b/gi, 'alternate angles'],
  [/\bcorr\.?\s*∠?s?\b/gi, 'corresponding angles']
];

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberToWords(n) {
  const num = Math.round(Number(n));
  if (num < 0) return 'minus ' + numberToWords(-num);
  if (num < 20) return ONES[num];
  if (num < 100) return TENS[Math.floor(num / 10)] + (num % 10 ? '-' + ONES[num % 10] : '');
  if (num < 1000) {
    const rem = num % 100;
    return ONES[Math.floor(num / 100)] + ' hundred' + (rem ? ' and ' + numberToWords(rem) : '');
  }
  return String(num);
}

const numTok = s => {
  if (s.includes('.')) {
    const [i, d] = s.split('.');
    return numberToWords(+i) + ' point ' + [...d].map(c => ONES[+c] || c).join(' ');
  }
  return numberToWords(+s);
};

/**
 * Converts mathematical and geometric notation into warm, natural English speech for ElevenLabs.
 */
export function toSpoken(t) {
  if (!t) return '';
  let s = String(t);

  // Abbreviations first
  for (const [re, w] of ABBR) s = s.replace(re, w);

  // Geometry notation
  s = s.replace(/∠s\b/g, 'angles');
  s = s.replace(/∠([A-Z])([A-Z])([A-Z])/g, (_, a, b, c) => `angle ${a} ${b} ${c}`);
  s = s.replace(/∠([A-Za-z])/g, (_, a) => `angle ${a}`);

  // Compass directions
  s = s.replace(/\b(NE|NW|SW|SE)\b/g, m => ({
    NE: 'north-east',
    NW: 'north-west',
    SW: 'south-west',
    SE: 'south-east'
  }[m]));

  // Question mark in missing sector
  s = s.replace(/\?/g, ' the missing angle ');

  // Algebra coefficients: e.g. 3x -> three x
  s = s.replace(/(\d+(?:\.\d+)?)\s*x(?![A-Za-z])/g, (_, n) => `${numTok(n)} x`);

  // Hyphenated degree adjectives e.g. 40° angle -> forty-degree angle
  s = s.replace(/(\d+(?:\.\d+)?)°(?= (?:angle|corner|turn|split)\b)/g, (_, n) => `${numTok(n)}-degree`);

  // Standard degrees
  s = s.replace(/(\d+(?:\.\d+)?)°/g, (_, n) => `${numTok(n)} ${+n === 1 ? 'degree' : 'degrees'}`);
  s = s.replace(/°/g, ' degrees');

  // Math operators & arrows
  s = s.replace(/\s*→\s*/g, ' so ');
  s = s.replace(/\s*=\s*/g, ' equals ');
  s = s.replace(/\s*\+\s*/g, ' plus ');
  s = s.replace(/\s*[−–]\s*/g, ' minus ');
  s = s.replace(/\s+-\s+/g, ' minus ');
  s = s.replace(/\s*×\s*/g, ' times ');
  s = s.replace(/\s*÷\s*/g, ' divided by ');
  s = s.replace(/\s*\/\s*/g, ', ');
  s = s.replace(/[()]/g, ' ');
  s = s.replace(/%/g, ' percent');

  // Any remaining bare numbers
  s = s.replace(/(?<!\w|\d\.)(\d+(?:\.\d+)?)(?!\w|\.\d)/g, (_, n) => numTok(n));

  // Clean up punctuation and multiple spaces
  s = s.replace(/\s+([,.!?:;])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  return s;
}

export const BAD_SPOKEN = /[\d°∠=+−×÷→()%]/;
