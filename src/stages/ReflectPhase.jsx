import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { reflectQuestionNarration, reflectCompleteNarration, celebrationNarration } from '../utils/narration.js';
import { WORLDS } from '../data/worlds.js';
import { BADGES, TROPHIES } from '../data/badges.js';

export function ReflectPhase({
  progress = {},
  muted = false,
  onComplete
}) {
  const {
    xp = 0,
    bestStreak = 0,
    worldStars = [],
    boss = [],
    badges = {}
  } = progress;

  const totalStars = worldStars.reduce((a, b) => a + (b || 0), 0);

  // 3 Fixed Recap Questions
  const recapQuestions = [
    {
      id: 1,
      q: 'Two straight lines cross. One angle is 72°. What is the angle vertically opposite it?',
      options: ['72°', '108°', '18°', '288°'],
      correct: '72°',
      explanation: 'Vertically opposite angles are equal! So the opposite angle is exactly 72°.'
    },
    {
      id: 2,
      q: 'AC and BD are straight lines crossing at O. Which reason explains why ∠AOB = ∠COD?',
      options: [
        'Vertically opposite angles are equal',
        'Adjacent angles on a straight line add up to 180°',
        'Angles at a point add up to 360°',
        'Alternate angles are equal'
      ],
      correct: 'Vertically opposite angles are equal',
      explanation: 'Angles facing across the vertex on two straight crossing lines are vertically opposite angles.'
    },
    {
      id: 3,
      q: '(2x + 15)° and 65° are vertically opposite angles. What is x?',
      options: ['x = 25', 'x = 50', 'x = 40', 'x = 65'],
      correct: 'x = 25',
      explanation: '2x + 15 = 65  →  2x = 50  →  x = 25.'
    }
  ];

  const [recapIdx, setRecapIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [recapDone, setRecapDone] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    narrate(reflectQuestionNarration(0), !muted);
    return () => stopNarration();
  }, [muted]);

  const handleRecapSelect = (ans) => {
    const nextAnswers = { ...selectedAnswers, [recapIdx]: ans };
    setSelectedAnswers(nextAnswers);

    if (recapIdx < recapQuestions.length - 1) {
      setRecapIdx(i => i + 1);
    } else {
      setRecapDone(true);
    }
  };

  const handleFinishLesson = () => {
    narrate(reflectCompleteNarration(), !muted);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
    onComplete();
  };

  const currentRecapQ = recapQuestions[recapIdx];

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      <div className="w-full max-w-4xl max-h-[94vh] bg-[#160b38]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-y-auto">
        {/* Accent Bar */}
        <div className="w-24 h-2 bg-purple-400 rounded-full mb-3 shadow-[0_0_18px_rgba(168,85,247,0.85)] shrink-0" />

        {/* Title */}
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-white mb-4 flex items-center gap-2.5 shrink-0">
          <span className="text-3xl sm:text-4xl">🏆</span>
          <span>Reflect & Scoreboard</span>
        </h2>

        {/* Step 1: Quick Recap (3 Questions) */}
        {!recapDone ? (
          <div className="w-full max-w-2xl bg-[#1b0d42] border-2 border-purple-400/35 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 shrink-0">
            <div className="w-full flex items-center justify-between text-xs font-display font-900 text-amber-300">
              <span>Quick Recap · Question {recapIdx + 1} of 3</span>
              <span>{Math.round(((recapIdx + 1) / 3) * 100)}%</span>
            </div>

            <p className="text-sm sm:text-base font-display font-900 text-white text-center mt-1 leading-snug">
              {currentRecapQ.q}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-2">
              {currentRecapQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleRecapSelect(opt)}
                  className="p-3 rounded-xl border-2 border-white/15 bg-white/10 hover:bg-white/20 hover:border-amber-400 text-slate-100 font-display font-900 text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Scoreboard & Shelves */
          <div className="w-full flex flex-col gap-4">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-3 w-full shrink-0">
              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-1">✨</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{xp}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">Total XP</span>
              </div>
              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-1">⭐</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{totalStars} / 30</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">Total Stars</span>
              </div>
              <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center shadow-lg">
                <span className="text-2xl mb-1">🔥</span>
                <span className="font-display font-900 text-2xl sm:text-3xl text-amber-400">{bestStreak}x</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200">Best Streak</span>
              </div>
            </div>

            {/* Boss Trophies Shelf (10 slots) */}
            <div className="bg-[#14082c] border border-amber-400/30 rounded-2xl p-3 flex flex-col items-start w-full">
              <span className="text-xs font-display font-900 text-amber-300 uppercase tracking-wider mb-2">
                👑 Boss Trophies (10 Worlds)
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 w-full">
                {TROPHIES.map(t => {
                  const won = Boolean(boss[t.worldIndex]);
                  return (
                    <div
                      key={t.worldIndex}
                      title={won ? `${t.reward} (Defeated ${t.bossName})` : `Locked (${t.bossName})`}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center min-h-[52px] ${
                        won
                          ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-md'
                          : 'bg-white/5 border-white/10 opacity-40 text-slate-400'
                      }`}
                    >
                      <span className="text-xl">{won ? t.bossEmoji : '🔒'}</span>
                      <span className="text-[10px] font-black truncate max-w-full">
                        {won ? t.reward.split(' ')[0] : `W${t.worldIndex + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badge Shelf (8 slots) */}
            <div className="bg-[#14082c] border border-purple-400/30 rounded-2xl p-3 flex flex-col items-start w-full">
              <span className="text-xs font-display font-900 text-purple-300 uppercase tracking-wider mb-2">
                🎖️ Badge Shelf (8 Badges)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {BADGES.map(b => {
                  const unlocked = Boolean(badges[b.id]);
                  return (
                    <div
                      key={b.id}
                      className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                        unlocked
                          ? 'bg-[#1e1047] border-purple-400 text-white shadow'
                          : 'bg-white/5 border-white/10 opacity-40 text-slate-400'
                      }`}
                    >
                      <span className="text-2xl">{unlocked ? b.emoji : '🔒'}</span>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-display font-900 truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* World Results 10 Tiles */}
            <div className="bg-[#14082c] border border-white/10 rounded-2xl p-3 flex flex-col items-start w-full">
              <span className="text-xs font-display font-900 text-emerald-300 uppercase tracking-wider mb-2">
                🌍 World Stars (10 Worlds)
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 w-full">
                {WORLDS.map((w, idx) => {
                  const stars = worldStars[idx];
                  return (
                    <div
                      key={w.id}
                      className="bg-[#1a0e42]/80 border border-white/15 rounded-xl p-1.5 flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-[10px] font-black text-slate-300">W{idx + 1}</span>
                      <span className="text-xs font-black text-amber-400 mt-0.5">
                        {stars != null && stars > 0 ? `${stars}★` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Reflection with Tally */}
            <div className="w-full flex items-start gap-3 bg-[#130728] border border-purple-400/30 rounded-2xl p-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-2xl shadow shrink-0">
                🦉
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-display font-900 text-sm text-white mb-1">
                  Optional Reflection for Tally:
                </h4>
                <p className="text-xs text-slate-300 mb-2 font-medium">
                  Explain to Tally why vertically opposite angles are equal — use a diagram or an example!
                </p>
                <textarea
                  rows="2"
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="Dear Tally, vertically opposite angles are equal because straight lines make 180°..."
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none font-sans"
                />
              </div>
            </div>

            {/* Complete Lesson Button */}
            <button
              onClick={handleFinishLesson}
              className="btn-gold font-display font-900 text-base py-3 px-8 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition cursor-pointer mx-auto mt-1"
            >
              Complete Lesson! 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   CELEBRATION SCREEN
   ========================================================================= */
export function CelebrationScreen({ progress = {}, muted = false, onRestart }) {
  const { xp = 0, worldStars = [] } = progress;
  const totalStars = worldStars.reduce((a, b) => a + (b || 0), 0);

  useEffect(() => {
    narrate(celebrationNarration(), !muted);
    try {
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
    } catch (e) {}
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden select-none z-20 bg-[#0c0424]">
      <BgSymbols />

      <div className="w-full max-w-md glass-card flex flex-col items-center text-center fade-in-up z-30 my-auto py-6 px-6">
        <span className="text-5xl mb-2 animate-bounce">🎓🏆</span>

        <div className="bg-[#1c0d38] border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-2">
          Grade 7 Geometry Mastered!
        </div>

        <h1 className="font-display font-900 text-2xl sm:text-3xl text-white mb-2">
          CrossQuest Complete!
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed font-semibold">
          Congratulations! You've mastered vertically opposite angles, adjacent angles on a straight line, and multi-line junction geometry!
        </p>

        <div className="w-full bg-[#14082c] border border-white/10 rounded-2xl p-4 flex justify-around items-center mb-5">
          <div className="flex flex-col items-center">
            <span className="text-amber-400 font-display font-900 text-lg">{xp} XP</span>
            <span className="text-slate-400 text-[10px]">Total Score</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-amber-300 font-display font-900 text-lg">{totalStars} ⭐</span>
            <span className="text-slate-400 text-[10px]">Stars Earned</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="btn-gold text-xs px-8 py-3 rounded-full cursor-pointer hover:scale-105 transition"
        >
          🔄 Play Module Again
        </button>
      </div>
    </div>
  );
}
