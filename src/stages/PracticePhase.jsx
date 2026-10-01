import React, { useState, useEffect, useRef } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { WORLDS } from '../data/worlds.js';
import { makeQuestion } from '../engine/questionBank.js';
import { AngleDiagram } from '../components/AngleDiagram.jsx';
import { narrate, say } from '../utils/audio.js';
import { practiceCorrectNarration, practiceWrongNarration } from '../utils/narration.js';
import { toSpoken } from '../engine/toSpoken.js';
import { calcStars, calcXP } from '../engine/scoring.js';

/* =========================================================================
   MODE SELECT MODAL
   ========================================================================= */
function ModeSelectModal({ world, onClose, onSelectMode }) {
  const modes = [
    {
      id: 'guided',
      title: 'Guided Practice',
      icon: '💡',
      badge: '5 Questions',
      rule: 'Step-by-step hints and second chances enabled. Perfect for learning!',
      accent: 'border-cyan-400 text-cyan-300'
    },
    {
      id: 'independent',
      title: 'Independent Practice',
      icon: '🎯',
      badge: '10 Questions',
      rule: 'Full 10-slot standard challenge. Test your mastery across all concepts!',
      accent: 'border-emerald-400 text-emerald-300'
    },
    {
      id: 'timed',
      title: 'Timed Challenge',
      icon: '⏱️',
      badge: '8 Questions · 60s/Q',
      rule: 'Speed and accuracy! 60 seconds per question to test swift deduction.',
      accent: 'border-amber-400 text-amber-300'
    },
    {
      id: 'boss',
      title: `Boss Battle: ${world.boss.name}`,
      icon: world.boss.emoji,
      badge: '5 Questions · 3 Lives',
      rule: `Defeat ${world.boss.name} to win the ${world.boss.reward} trophy!`,
      accent: 'border-rose-400 text-rose-300'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 fade-in-up">
      <div className="w-full max-w-2xl bg-[#150a36] border-2 border-purple-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{world.icon}</span>
            <div className="text-left">
              <h3 className="font-display font-900 text-xl sm:text-2xl text-white">
                {world.name}
              </h3>
              <p className="text-xs text-slate-300 font-extrabold">{world.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm font-display font-900 text-amber-300 mb-3 uppercase tracking-wider">
          Select Practice Mode
        </p>

        {/* 4 Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-4">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 bg-[#1b0f44] hover:bg-[#25155c] flex flex-col items-start text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md ${m.accent}`}
            >
              <div className="w-full flex items-center justify-between mb-1.5">
                <span className="text-2xl">{m.icon}</span>
                <span className="bg-white/10 text-white text-[11px] font-display font-900 px-2.5 py-0.5 rounded-full border border-white/15">
                  {m.badge}
                </span>
              </div>
              <h4 className="font-display font-900 text-sm sm:text-base text-white">{m.title}</h4>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">{m.rule}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PRACTICE WORLD SELECT (10 WORLDS)
   ========================================================================= */
export function PracticeWorldSelect({ worldResults = [], onPlay, onGoReflect }) {
  const [selectedWorldForModal, setSelectedWorldForModal] = useState(null);
  const totalStars = worldResults.reduce((a, b) => a + (b || 0), 0);
  const hasPlayedAny = worldResults.some(r => r != null && r > 0);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {selectedWorldForModal !== null && (
        <ModeSelectModal
          world={WORLDS[selectedWorldForModal]}
          onClose={() => setSelectedWorldForModal(null)}
          onSelectMode={mode => {
            const wIdx = selectedWorldForModal;
            setSelectedWorldForModal(null);
            onPlay(wIdx, mode);
          }}
        />
      )}

      <div className="w-full max-w-5xl max-h-[94vh] glass-card flex flex-col items-center text-center fade-in-up z-20 my-auto py-5 px-6 overflow-hidden">
        {/* Phase Band */}
        <div className="phase-band phase-band--play mb-2 shrink-0" />

        {/* Top Title & Stars Summary */}
        <div className="w-full flex items-center justify-between mb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🎮</span>
            <div className="text-left">
              <h2 className="text-section-heading text-emerald-200 text-2xl sm:text-3xl font-900">
                Crossroads Game Worlds
              </h2>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                10 Themed Worlds · Need 5/10 (1★) to Unlock Next World
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#14082c]/90 border-2 border-emerald-400/40 rounded-full px-5 py-2 flex items-center gap-2 shadow-lg">
              <span className="text-amber-400 text-lg">⭐</span>
              <span className="font-display font-900 text-white text-base sm:text-lg">
                {totalStars} / 30
              </span>
            </div>

            {hasPlayedAny && (
              <button
                onClick={onGoReflect}
                className="btn-gold text-xs sm:text-sm font-900 px-5 py-2 shadow-lg cursor-pointer"
              >
                Go to Reflect 📝
              </button>
            )}
          </div>
        </div>

        {/* 10 Worlds Grid (5 × 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 w-full my-auto flex-1 min-h-0 overflow-y-auto p-1">
          {WORLDS.map((w, idx) => {
            const isUnlocked = idx === 0 || (worldResults[idx - 1] != null && worldResults[idx - 1] > 0);
            const stars = worldResults[idx];

            return (
              <div
                key={w.id}
                onClick={() => isUnlocked && setSelectedWorldForModal(idx)}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all duration-300 h-36 sm:h-44 ${
                  isUnlocked
                    ? 'bg-[#14082c]/95 hover:scale-105 cursor-pointer shadow-xl'
                    : 'bg-[#100724]/40 border-white/10 opacity-50 cursor-not-allowed'
                }`}
                style={{
                  borderColor: isUnlocked ? w.accent : 'rgba(255,255,255,0.1)'
                }}
              >
                <div className="w-full flex items-center justify-between text-xs font-black text-slate-300">
                  <span className="bg-white/10 px-2 py-0.5 rounded-md">W{idx + 1}</span>
                  <span className="font-mono font-bold" style={{ color: w.accent }}>
                    {w.range}
                  </span>
                </div>

                <span className="text-3xl sm:text-5xl my-1 drop-shadow-md">
                  {isUnlocked ? w.icon : '🔒'}
                </span>

                <span className="font-display font-900 text-white text-sm sm:text-base leading-tight line-clamp-1">
                  {w.name}
                </span>

                <div className="mt-1">
                  {isUnlocked ? (
                    stars != null && stars > 0 ? (
                      <span className="text-amber-400 text-sm tracking-widest font-black">
                        {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-xs font-900">Play →</span>
                    )
                  ) : (
                    <span className="text-slate-400 text-[11px] font-extrabold">Need 5/10</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PRACTICE QUIZ
   ========================================================================= */
export function PracticeQuiz({
  worldIndex = 0,
  mode = 'independent',
  muted = false,
  currentStreak = 0,
  onRecordAnswer,
  onFinish
}) {
  const world = WORLDS[worldIndex] || WORLDS[0];

  // Configure question count by mode
  const totalQuestions =
    mode === 'guided' ? 5 : mode === 'timed' ? 8 : mode === 'boss' ? 5 : 10;

  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [popupState, setPopupState] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [attemptNum, setAttemptNum] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);

  // Slot indexing based on mode
  const getSlot = (idx) => {
    if (mode === 'guided') return idx;
    if (mode === 'boss') return 5 + idx;
    return idx;
  };

  const [qData, setQData] = useState(() => makeQuestion(worldIndex, getSlot(0)));
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Load question per qIndex
  useEffect(() => {
    const slot = getSlot(qIndex);
    const newQ = makeQuestion(worldIndex, slot);
    setQData(newQ);
    setSelectedIdx(null);
    setPopupState(null);
    setAttemptNum(1);
    setCurrentHintLevel(0);

    if (mode === 'timed') {
      setTimeLeft(60);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleTimeout();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [qIndex, worldIndex, mode]);

  const handleTimeout = () => {
    if (popupState != null) return;
    if (onRecordAnswer) onRecordAnswer(false, 0);
    setPopupState({
      type: 'incorrect',
      title: 'Time is up! ⏱️',
      text: `Solution: ${qData.explanation}`
    });
  };

  const handleReadQuestion = () => {
    const spoken = toSpoken(qData.questionText);
    narrate(say(spoken), true);
  };

  const handleHintClick = () => {
    if (mode !== 'guided') return;
    if (currentHintLevel === 0) {
      setCurrentHintLevel(1);
      setHintsUsed(h => h + 1);
    } else if (currentHintLevel === 1) {
      setCurrentHintLevel(2);
      setHintsUsed(h => h + 1);
    }
  };

  const handleOptionClick = (idx) => {
    if (selectedIdx != null || popupState != null) return;
    if (mode === 'boss' && lives <= 0) return;

    setSelectedIdx(idx);
    const isCorrect = idx === qData.correctIndex;

    if (isCorrect) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      const earnedXP = calcXP({ attempt: attemptNum, hintsUsed: currentHintLevel, streak: currentStreak + 1 });
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      if (onRecordAnswer) onRecordAnswer(true, earnedXP);
      narrate(practiceCorrectNarration(nextCorrect), !muted);

      setPopupState({
        type: 'correct',
        title: 'Correct! 🎉',
        text: qData.explanation
      });

      timerRef.current = setTimeout(() => {
        setPopupState(null);
        advanceNextQuestion(nextCorrect, lives);
      }, 1600);
    } else {
      // In Guided mode, allow a second attempt before locking out
      if (mode === 'guided' && attemptNum === 1) {
        setAttemptNum(2);
        setSelectedIdx(null);
        narrate(say('Not quite! Try once more or use a hint!'), !muted);
        setPopupState({
          type: 'retry',
          title: 'Try Once More! 💡',
          text: 'Second chance enabled in Guided mode. Give it another shot or use a hint!'
        });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setPopupState(null), 2500);
        return;
      }

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      const nextLives = mode === 'boss' ? lives - 1 : lives;
      if (mode === 'boss') setLives(nextLives);
      if (onRecordAnswer) onRecordAnswer(false, 0);
      narrate(practiceWrongNarration(qIndex), !muted);

      setPopupState({
        type: 'incorrect',
        title: 'Not quite!',
        text: `Solution: ${qData.explanation}`
      });
    }
  };

  const handleAcknowledgeExplanation = () => {
    setPopupState(null);
    if (mode === 'boss' && lives <= 0) {
      // Out of hearts handles its own display
      return;
    }
    advanceNextQuestion(correctCount, lives);
  };

  const advanceNextQuestion = (finalCorrect, finalLives) => {
    if (qIndex < totalQuestions - 1) {
      setQIndex(i => i + 1);
    } else {
      // Completed quiz!
      const starsEarned = calcStars(finalCorrect, totalQuestions);
      const wonBoss = mode === 'boss' && finalLives > 0;
      onFinish(worldIndex, starsEarned, { mode, wonBoss, correct: finalCorrect, total: totalQuestions });
    }
  };

  const restartQuiz = () => {
    setQIndex(0);
    setLives(3);
    setCorrectCount(0);
    setSelectedIdx(null);
    setPopupState(null);
    setAttemptNum(1);
    setCurrentHintLevel(0);
    setQData(makeQuestion(worldIndex, getSlot(0)));
  };

  const isGameOver = mode === 'boss' && lives <= 0;
  const progressPercent = Math.round(((qIndex + 1) / totalQuestions) * 100);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Persistent Feedback Explanation Modal (Stays until student clicks "Got it →") */}
      {popupState && !isGameOver && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 fade-in-up">
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center border-4 border-white/20 scale-105 transition-all duration-300 ${
              popupState.type === 'correct'
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-[0_0_50px_rgba(52,211,153,0.7)]'
                : popupState.type === 'retry'
                  ? 'bg-gradient-to-b from-amber-600 to-amber-800 text-white shadow-[0_0_50px_rgba(245,158,11,0.7)]'
                  : 'bg-gradient-to-b from-rose-600 to-rose-800 text-white shadow-[0_0_50px_rgba(244,63,94,0.7)]'
            }`}
          >
            <span className="text-6xl sm:text-7xl mb-3 drop-shadow-lg">
              {popupState.type === 'correct' ? '🎉' : '💡'}
            </span>
            <h3 className="font-display font-900 text-2xl sm:text-3xl text-white mb-2 leading-tight">
              {popupState.title}
            </h3>
            <p className="font-extrabold text-sm sm:text-base text-slate-100 leading-relaxed max-w-sm mb-4">
              {popupState.text}
            </p>
            {popupState.type === 'incorrect' && (
              <button
                onClick={handleAcknowledgeExplanation}
                className="btn-gold text-sm sm:text-base font-900 px-7 py-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105"
              >
                Got it →
              </button>
            )}
            {popupState.type === 'retry' && (
              <button
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setPopupState(null);
                }}
                className="btn-gold text-sm sm:text-base font-900 px-7 py-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105"
              >
                Try Again 💡
              </button>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl max-h-[94vh] flex flex-col items-center text-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Top Navigation Row: Back Button */}
        <div className="w-full flex items-center justify-between mb-2 shrink-0">
          <button
            onClick={() => onFinish(worldIndex, null, { mode })}
            className="bg-[#1c0e3a]/90 hover:bg-[#2e175c] border border-purple-400/40 text-slate-200 font-display font-900 text-xs sm:text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <span>← Worlds</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadQuestion}
              className="bg-[#241352] hover:bg-[#341b77] border border-cyan-400/40 text-cyan-300 font-display font-900 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span>🔊 Read Question</span>
            </button>
            {mode === 'guided' && (
              <button
                onClick={handleHintClick}
                className="bg-[#2a1a0c] hover:bg-[#3d2714] border border-amber-400/50 text-amber-300 font-display font-900 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow cursor-pointer"
              >
                <span>💡 Hint ({currentHintLevel}/2)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Quiz Card Frame */}
        <div className="w-full bg-[#150a36]/95 border-2 border-purple-400/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col items-center relative overflow-hidden">
          {/* Top World Header Pill */}
          <div
            className="text-white font-display font-900 text-base sm:text-lg px-6 py-1.5 rounded-full shadow-lg mb-3 flex items-center gap-2 shrink-0"
            style={{ backgroundColor: world.accent }}
          >
            <span>{world.icon}</span>
            <span>{world.name} ({mode.toUpperCase()})</span>
          </div>

          {/* Stats Bar */}
          <div className="w-full flex items-center justify-between px-3 sm:px-8 mb-2.5 shrink-0 text-xs sm:text-sm">
            {/* Score */}
            <div className="bg-[#10072a] border border-purple-400/30 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-inner">
              <span className="text-amber-400">⭐</span>
              <span className="font-display font-900 text-white">{correctCount * 10}</span>
            </div>

            {/* Boss Lives (Boss Mode only) */}
            {mode === 'boss' && (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map(h => (
                  <span key={h} className="text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(239,68,68,0.75)]">
                    {h <= lives ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            )}

            {/* Timed Mode Countdown Timer */}
            {mode === 'timed' && (
              <div className={`border rounded-full px-4 py-1.5 font-display font-900 text-xs sm:text-sm ${
                timeLeft <= 10 ? 'bg-rose-950 border-rose-400 text-rose-300 animate-pulse' : 'bg-[#10072a] border-cyan-400/40 text-cyan-300'
              }`}>
                ⏱️ {timeLeft}s
              </div>
            )}

            {/* Streak Counter */}
            <div className="bg-[#10072a] border border-purple-400/30 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-inner">
              <span className="text-amber-400">🔥</span>
              <span className="font-display font-900 text-amber-300">{currentStreak}x</span>
            </div>
          </div>

          {/* Progress Header Text */}
          <div className="w-full flex items-center justify-between text-xs font-display font-900 text-slate-300 px-1 mb-1 shrink-0">
            <span>Question {qIndex + 1} of {totalQuestions}</span>
            <span>{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-purple-950/80 rounded-full mb-3.5 overflow-hidden border border-purple-500/20 shrink-0">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.85)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Out of Hearts Game Over Screen (Boss Battle Mode) */}
          {isGameOver ? (
            <div className="w-full my-auto flex flex-col items-center justify-center gap-4 py-6 shrink-0 fade-in-up">
              <span className="text-6xl drop-shadow-lg">🥺</span>
              <h3 className="font-display font-900 text-rose-400 text-2xl sm:text-3xl">Out of Hearts!</h3>
              <p className="font-extrabold text-slate-200 text-xs sm:text-sm max-w-md text-center leading-relaxed">
                Tally says: "No worries! Review the opposite angle rules and try again to defeat {world.boss.name}!"
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={restartQuiz}
                  className="btn-gold font-display font-900 text-xs sm:text-sm px-5 py-2 rounded-full cursor-pointer hover:scale-105 transition"
                >
                  🔁 Retry Battle
                </button>
                <button
                  onClick={() => onFinish(worldIndex, 0, { mode, wonBoss: false })}
                  className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/20 text-white font-display font-900 text-xs sm:text-sm px-5 py-2 rounded-full cursor-pointer transition"
                >
                  Quit to Worlds
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Rule Tag Pill */}
              <div className="bg-[#1c0e3a] border border-amber-400/50 text-amber-300 font-display font-900 text-xs px-4 py-1 rounded-full shadow shrink-0">
                {qData.ruleTag || 'Vertically Opposite Angles'}
              </div>

              {/* Diagram + Question Container */}
              <div className="w-full bg-[#110729]/90 border border-purple-400/30 rounded-2xl p-3 flex flex-col items-center">
                {qData.visualData && (
                  <AngleDiagram
                    figure={qData.visualData}
                    size={170}
                    accent={world.accent}
                  />
                )}
                <h3 className="font-display font-900 text-base sm:text-lg text-white mt-1 max-w-xl text-center leading-snug">
                  {qData.questionText}
                </h3>

                {/* Guided Mode Hints Display */}
                {mode === 'guided' && currentHintLevel > 0 && (
                  <div className="mt-2 p-2 bg-[#221247] border border-amber-400/30 rounded-xl text-xs text-amber-200 max-w-lg text-left">
                    {currentHintLevel === 1 && <p><strong>Hint 1:</strong> {qData.hint1}</p>}
                    {currentHintLevel === 2 && (
                      <>
                        <p><strong>Hint 1:</strong> {qData.hint1}</p>
                        <p className="mt-1"><strong>Hint 2:</strong> {qData.hint2}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 2 × 2 Option Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                {qData.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={selectedIdx != null}
                      className={`min-h-[56px] p-3 rounded-2xl border-2 font-display font-900 text-sm sm:text-base transition-all duration-200 flex items-center justify-center text-center cursor-pointer shadow-md ${
                        isSelected
                          ? idx === qData.correctIndex
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-rose-600 text-white border-rose-400'
                          : 'bg-[#1b0d40] hover:bg-[#28145e] border-white/20 text-slate-100 hover:border-cyan-400/60 hover:scale-[1.02]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
