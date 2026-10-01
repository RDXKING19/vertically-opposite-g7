import { say, ask, cheer, emphasize, think, celebrate, instruct } from './audio.js';

export function wonderNarration() {
  return [
    say('Priya opens a pair of scissors so the blades make a forty-degree angle.'),
    say('Wei Ming says the angle between the handles is exactly forty degrees too, and he did not measure!'),
    ask('What secret do two crossing straight lines hide?')
  ];
}

const STORY_NARRATIONS = [
  // Panel 1: Where Two Roads Cross
  [
    say('Welcome to Crossroads City! Priya and Wei Ming design road junctions.'),
    say('Whenever two straight roads cross, four corners appear. The point where the roads meet is called the vertex.'),
    think('Look closely: every crossing hides a secret!')
  ],
  // Panel 2: Meet the Opposite Twins
  [
    say('Priya names each corner with three letters, like angle A O B, with the vertex O in the middle.'),
    say('Two angles directly across the vertex from each other are called vertically opposite angles.'),
    emphasize('Vertical comes from vertex, not from up and down!'),
    ask('Opposite corners look like twins. But are they really equal?')
  ],
  // Panel 3: The Straight-Line Secret
  [
    say('Wei Ming remembers a fact: a straight line is a half-turn, so angles side by side on a straight line add up to one hundred and eighty degrees.'),
    say('If angle A O B is sixty-five degrees, then angle B O C is one hundred and eighty minus sixty-five, which equals one hundred and fifteen degrees.'),
    instruct('Keep one hundred and eighty degrees in your pocket. You will need it in a moment!')
  ],
  // Panel 4: Why Opposite Angles Are Equal
  [
    say('Let angle A O B equal a, angle B O C equal b, and angle C O D equal c.'),
    say('On straight line A C, a plus b equals one hundred and eighty degrees.'),
    say('On straight line B D, c plus b equals one hundred and eighty degrees.'),
    say('So a and c both equal one hundred and eighty minus b. That means a equals c!'),
    cheer('No measuring needed. The straight line does the work!')
  ],
  // Panel 5: Solving Junction Puzzles
  [
    say('At Priya\'s crossing, angle A O B is sixty-five degrees.'),
    say('Its vertically opposite angle C O D is also sixty-five degrees. The other two angles are one hundred and fifteen degrees each.'),
    say('Then Wei Ming tries algebra: three x plus ten degrees and five x minus twenty degrees are vertically opposite, so three x plus ten equals five x minus twenty. That gives x equals fifteen.'),
    instruct('Always give a reason: vertically opposite angles are equal.')
  ],
  // Panel 6: Bigger Hubs, Bigger Missions
  [
    say('Some junctions have three lines through one point.'),
    say('Angles at a point add up to three hundred and sixty degrees, and every angle still has a vertically opposite twin.'),
    celebrate('You are ready for the lab! Enter the lab and show what you know!')
  ]
];

export function getStoryNarration(idx) {
  return STORY_NARRATIONS[idx] || STORY_NARRATIONS[0];
}

export function simulateIntro(stationIdx) {
  switch (stationIdx) {
    case 1:
      return [
        say('Welcome to Spot the Twins! Move the scissor blades to test how crossing angles change.'),
        ask('Watch the opposite angles: do they always stay equal?')
      ];
    case 2:
      return [
        say('Welcome to The One Hundred and Eighty Degree Road! A straight road is a half-turn.'),
        instruct('Find the missing angle to complete one hundred and eighty degrees!')
      ];
    case 3:
      return [
        say('Welcome to the Four-Corner Puzzle! One angle is given.'),
        instruct('Use your opposite twin rule and straight-line rule to unlock all four corners!')
      ];
    default:
      return [say('Explore the simulation station!')];
  }
}

export function simDoneNarration(stationIdx) {
  const names = ['one', 'two', 'three'];
  const name = names[stationIdx - 1] || 'one';
  return [
    celebrate(`Station ${name} completed! Excellent work!`)
  ];
}

export function practiceCorrectNarration(correctCount) {
  if (correctCount === 1) {
    return [cheer('Brilliant start! Vertically opposite angles are equal!')];
  }
  if (correctCount === 5) {
    return [cheer('Five correct in a row! You are navigating Crossroads City like a pro!')];
  }
  if (correctCount === 10) {
    return [celebrate('Ten out of ten! Outstanding geometric reasoning!')];
  }
  const cheers = [
    'Correct! Opposite angles match perfectly!',
    'Spot on! The straight line property holds true!',
    'Great job! Exactly right!',
    'Well reasoned! You cracked that angle puzzle!'
  ];
  return [cheer(cheers[correctCount % cheers.length])];
}

export function practiceWrongNarration(qIndex) {
  const nudges = [
    'Not quite. Remember, angles facing each other across the vertex are equal!',
    'Careful! Adjacent angles on a straight line add to one hundred and eighty degrees, but opposite angles are equal.',
    'Take another look at the diagram. Check which lines are straight!',
    'Think about the reason: are the angles vertically opposite or side by side?'
  ];
  return [say(nudges[qIndex % nudges.length])];
}

export function reflectQuestionNarration(idx = 0) {
  if (idx === 0) {
    return [
      say('Time to reflect on your journey through Crossroads City! Let us recap the big ideas.')
    ];
  }
  return [say('Consider how straight lines and opposite angles connect.')];
}

export function reflectCompleteNarration() {
  return [
    celebrate('Lesson complete! You have mastered vertically opposite angles!')
  ];
}

export function celebrationNarration() {
  return [
    celebrate('Congratulations! You are officially an Opposite Angles Master in Crossroads City! Outstanding work!')
  ];
}

/**
 * Returns a deduplicated array of all static narration segments for scripts/generate_audio.js.
 */
export function getAllNarration() {
  const all = [
    ...wonderNarration(),
    ...STORY_NARRATIONS.flat(),
    ...simulateIntro(1),
    ...simulateIntro(2),
    ...simulateIntro(3),
    ...simDoneNarration(1),
    ...simDoneNarration(2),
    ...simDoneNarration(3),
    ...practiceCorrectNarration(1),
    ...practiceCorrectNarration(5),
    ...practiceCorrectNarration(10),
    ...practiceWrongNarration(0),
    ...practiceWrongNarration(1),
    ...practiceWrongNarration(2),
    ...practiceWrongNarration(3),
    ...reflectQuestionNarration(0),
    ...reflectCompleteNarration(),
    ...celebrationNarration()
  ];

  const seen = new Set();
  const deduped = [];
  for (const s of all) {
    if (s && s.text && !seen.has(s.text)) {
      seen.add(s.text);
      deduped.push(s);
    }
  }
  return deduped;
}
