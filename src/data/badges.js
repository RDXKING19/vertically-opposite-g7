import { WORLDS } from './worlds.js';

export const BADGES = [
  {
    id: 'first-crossing',
    name: 'First Crossing',
    emoji: '✖️',
    description: 'Score your first correct answer in Practice mode',
    trigger: p => p.questionsAnsweredInPractice >= 1
  },
  {
    id: 'five-lane',
    name: 'Five-Lane Streak',
    emoji: '🛣️',
    description: 'Build a streak of 5 correct answers in a row',
    trigger: p => p.streak >= 5
  },
  {
    id: 'perfect-intersect',
    name: 'Perfect Intersection',
    emoji: '🎯',
    description: 'Build an incredible streak of 10 correct answers in a row',
    trigger: p => p.streak >= 10
  },
  {
    id: 'master-surveyor',
    name: 'Master Surveyor',
    emoji: '📐',
    description: 'Complete all 3 interactive Simulate stations',
    trigger: p => p.simStationsDone.every(Boolean)
  },
  {
    id: 'three-star',
    name: 'Three-Star Surveyor',
    emoji: '⭐',
    description: 'Earn a 3-star rating on any game world',
    trigger: p => p.worldStars.some(s => s === 3)
  },
  {
    id: 'boss-of-crossroads',
    name: 'Boss of the Crossroads',
    emoji: '👑',
    description: 'Defeat any World Boss in Boss Battle mode',
    trigger: p => p.boss.some(Boolean)
  },
  {
    id: 'road-warrior',
    name: 'Road Warrior',
    emoji: '🚧',
    description: 'Answer 20 or more questions in Practice',
    trigger: p => p.questionsAnsweredInPractice >= 20
  },
  {
    id: 'voa-master',
    name: 'Opposite Angles Master',
    emoji: '🏆',
    description: 'Complete the entire 5-phase CrossQuest journey',
    trigger: (p, done) => Boolean(done)
  }
];

export const TROPHIES = WORLDS.map((w, idx) => ({
  worldIndex: idx,
  worldName: w.name,
  bossName: w.boss.name,
  bossEmoji: w.boss.emoji,
  reward: w.boss.reward
}));
