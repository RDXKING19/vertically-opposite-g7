import React, { useState, useReducer, useEffect, useRef } from 'react';
import { setMuted } from './utils/audio.js';
import { TopNav } from './components/TopNav.jsx';
import { IntroModal } from './stages/IntroPhase.jsx';
import { WonderPhase } from './stages/WonderPhase.jsx';
import { StoryPhase } from './stages/StoryPhase.jsx';
import { SimulatePhase } from './stages/SimulatePhase.jsx';
import { PracticeWorldSelect, PracticeQuiz } from './stages/PracticePhase.jsx';
import { ReflectPhase, CelebrationScreen } from './stages/ReflectPhase.jsx';
import { progressReducer, initialProgress, evaluateBadges } from './engine/progressReducer.js';

export function App() {
  const [phase, setPhase] = useState('intro');
  const [muted, setMutedState] = useState(false);
  const [progress, dispatch] = useReducer(progressReducer, initialProgress);
  const [activeWorld, setActiveWorld] = useState(0);
  const [activeMode, setActiveMode] = useState('independent');
  const [done, setDone] = useState(false);
  const [storySlideInfo, setStorySlideInfo] = useState(null);
  const [toastBadge, setToastBadge] = useState(null);

  const navRef = useRef(null);

  // Dynamic header height measurement to prevent viewport clipping
  useEffect(() => {
    if (!navRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        document.documentElement.style.setProperty('--header-h', `${Math.round(entry.contentRect.height)}px`);
      }
    });
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [phase, storySlideInfo]);

  const showBadgeToast = (badge) => {
    setToastBadge(badge);
    setTimeout(() => {
      setToastBadge(null);
    }, 3800);
  };

  const completed = {
    wonder: phase !== 'intro' && phase !== 'wonder',
    story: !['intro', 'wonder', 'story'].includes(phase),
    simulate: progress.simStationsDone.every(Boolean) || !['intro', 'wonder', 'story', 'simulate'].includes(phase),
    practice: progress.worldStars.some(r => r != null && r > 0),
    reflect: done
  };

  const toggleMute = () => {
    setMutedState(m => {
      setMuted(!m);
      return !m;
    });
  };

  const resetAll = () => {
    dispatch({ type: 'RESET' });
    setDone(false);
    setStorySlideInfo(null);
    setActiveWorld(0);
    setActiveMode('independent');
    setPhase('intro');
  };

  const goPhase = (key) => {
    if (key !== 'story') setStorySlideInfo(null);
    if (key === 'practice') {
      setPhase('practice-worlds');
    } else {
      setPhase(key);
    }
  };

  const handleSimStationComplete = (stationIndex) => {
    dispatch({ type: 'COMPLETE_SIM_STATION', stationIndex });
    // Check for Master Surveyor badge
    evaluateBadges(
      { ...progress, simStationsDone: progress.simStationsDone.map((d, i) => i === stationIndex ? true : d) },
      {},
      dispatch,
      showBadgeToast
    );
  };

  const handleRecordAnswer = (isCorrect, xpGained = 10) => {
    if (isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', xpGained });
      evaluateBadges(
        {
          ...progress,
          streak: progress.streak + 1,
          bestStreak: Math.max(progress.bestStreak, progress.streak + 1),
          questionsAnsweredInPractice: progress.questionsAnsweredInPractice + 1
        },
        {},
        dispatch,
        showBadgeToast
      );
    } else {
      dispatch({ type: 'ANSWER_WRONG' });
    }
  };

  const finishQuiz = (worldIdx, starsEarned, { mode, wonBoss = false } = {}) => {
    if (starsEarned != null) {
      dispatch({ type: 'FINISH_WORLD', worldIndex: worldIdx, stars: starsEarned });
    }
    if (wonBoss) {
      dispatch({ type: 'WIN_BOSS', worldIndex: worldIdx });
    }

    const updatedProgress = {
      ...progress,
      worldStars: progress.worldStars.map((s, i) => i === worldIdx ? Math.max(s ?? 0, starsEarned ?? 0) : s),
      boss: wonBoss ? progress.boss.map((b, i) => i === worldIdx ? true : b) : progress.boss
    };
    evaluateBadges(updatedProgress, {}, dispatch, showBadgeToast);

    setPhase('practice-worlds');
  };

  const handleReflectComplete = () => {
    setDone(true);
    evaluateBadges(progress, { justCompletedJourney: true }, dispatch, showBadgeToast);
  };

  return (
    <div className="app-container w-screen h-screen">
      {/* Top Navbar (Hidden on Intro Phase) */}
      {phase !== 'intro' && (
        <TopNav
          navRef={navRef}
          phase={phase === 'practice-quiz' || phase === 'practice-worlds' ? 'practice' : phase}
          completed={completed}
          muted={muted}
          onToggleMute={toggleMute}
          onHome={resetAll}
          onGoPhase={goPhase}
          slideInfo={phase === 'story' ? storySlideInfo : null}
        />
      )}

      {/* Floating Badge Unlock Toast Notification */}
      {toastBadge && (
        <div className="fixed top-18 sm:top-20 z-50 left-1/2 -translate-x-1/2 bg-[#1b0a42]/95 border-2 border-amber-400 rounded-full px-6 py-2.5 shadow-[0_0_30px_rgba(250,204,21,0.7)] flex items-center gap-3 fade-in-up">
          <span className="text-3xl animate-bounce">{toastBadge.emoji}</span>
          <div className="text-left">
            <p className="text-[10px] text-amber-300 font-display font-900 uppercase tracking-widest">
              Badge Unlocked!
            </p>
            <p className="text-sm font-display font-900 text-white leading-tight">
              {toastBadge.name}
            </p>
          </div>
        </div>
      )}

      {/* Main Viewport Content Area */}
      <main className={`app-main flex-1 min-h-0 flex flex-col relative overflow-hidden`}>
        {phase === 'intro' && (
          <IntroModal
            onBegin={() => {
              dispatch({ type: 'RESET' });
              setPhase('wonder');
            }}
          />
        )}

        {phase === 'wonder' && (
          <WonderPhase
            muted={muted}
            onNext={() => setPhase('story')}
          />
        )}

        {phase === 'story' && (
          <StoryPhase
            muted={muted}
            onSlideChange={(current, total) => setStorySlideInfo({ current, total })}
            onDone={() => {
              setStorySlideInfo(null);
              setPhase('simulate');
            }}
          />
        )}

        {phase === 'simulate' && (
          <SimulatePhase
            muted={muted}
            simStationsDone={progress.simStationsDone}
            onStationComplete={handleSimStationComplete}
            onNext={() => setPhase('practice-worlds')}
          />
        )}

        {phase === 'practice-worlds' && !done && (
          <PracticeWorldSelect
            worldResults={progress.worldStars}
            onPlay={(idx, selectedMode) => {
              setActiveWorld(idx);
              setActiveMode(selectedMode || 'independent');
              setPhase('practice-quiz');
            }}
            onGoReflect={() => setPhase('reflect')}
          />
        )}

        {phase === 'practice-quiz' && (
          <PracticeQuiz
            worldIndex={activeWorld}
            mode={activeMode}
            muted={muted}
            currentStreak={progress.streak}
            onRecordAnswer={handleRecordAnswer}
            onFinish={finishQuiz}
          />
        )}

        {phase === 'reflect' && !done && (
          <ReflectPhase
            progress={progress}
            muted={muted}
            onComplete={handleReflectComplete}
          />
        )}

        {done && (
          <CelebrationScreen
            progress={progress}
            muted={muted}
            onRestart={resetAll}
          />
        )}
      </main>
    </div>
  );
}
