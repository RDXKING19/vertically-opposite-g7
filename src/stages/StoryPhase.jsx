import React, { useState, useEffect, useRef } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { getStoryNarration } from '../utils/narration.js';
import { STORY_PANELS } from '../data/story.js';

export function StoryPhase({ muted, onDone, onSlideChange }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = STORY_PANELS[slideIdx];

  const slideChangeRef = useRef(onSlideChange);
  slideChangeRef.current = onSlideChange;

  useEffect(() => {
    if (slideChangeRef.current) {
      slideChangeRef.current(slideIdx + 1, STORY_PANELS.length);
    }
  }, [slideIdx]);

  useEffect(() => {
    if (!muted) narrate(getStoryNarration(slideIdx), true);
    return () => stopNarration();
  }, [slideIdx, muted]);

  const goNext = () => {
    if (slideIdx < STORY_PANELS.length - 1) {
      setSlideIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const goPrev = () => {
    if (slideIdx > 0) setSlideIdx(i => i - 1);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Story Card */}
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Left Column: Image Illustration */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 h-64 sm:h-[380px] md:h-[420px] w-full bg-gradient-to-br from-[#24134e] to-[#0c0524] flex items-center justify-center shrink-0 group">
          <img
            src={slide.image}
            alt={slide.title}
            onError={e => {
              // Graceful placeholder fallback if image file not loaded yet
              e.target.style.display = 'none';
            }}
            className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-500"
          />
          {/* Decorative visual container with panel number */}
          <div className="absolute top-4 left-4 bg-purple-950/80 border border-purple-400/40 rounded-full px-3.5 py-1 text-xs font-display font-900 text-amber-300 shadow">
            Panel {slideIdx + 1} of 6
          </div>
        </div>

        {/* Right Column: Typography & Callout Pills */}
        <div className="flex flex-col items-start text-left justify-center gap-3.5 overflow-y-auto max-h-full py-1">
          {/* Slide Title */}
          <h2 className="font-display font-900 text-2xl sm:text-3xl md:text-4xl text-amber-400 leading-tight drop-shadow-md">
            {slide.title}
          </h2>

          {/* Body Narrative */}
          <p className="text-slate-100 text-base sm:text-lg md:text-xl leading-relaxed font-bold drop-shadow-sm">
            {slide.body}
          </p>

          {/* Pull-Quote Sparkle Pill */}
          <div className="w-full bg-[#1e0e45] border-2 border-amber-400/60 rounded-2xl px-5 py-3 text-center text-amber-300 font-display font-900 text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg">
            <span className="shrink-0 text-xl">✨</span>
            <span className="leading-snug">"{slide.quote}"</span>
            <span className="shrink-0 text-xl">✨</span>
          </div>

          {/* Tally Speech Bubble Pill */}
          <div className="flex items-center gap-3.5 w-full mt-1">
            <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
              🦉
            </div>
            <div className="bg-white text-[#0c031d] rounded-2xl px-5 py-2.5 font-display font-900 text-sm sm:text-base shadow-xl flex-1 text-left leading-snug">
              {slide.bubble}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Row: Back, Dots, Next */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-3 z-20 shrink-0">
        <button
          onClick={goPrev}
          disabled={slideIdx === 0}
          className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/30 text-white font-display font-900 text-base sm:text-lg px-8 py-3 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xl hover:scale-105"
        >
          ← Back
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-3">
          {STORY_PANELS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all cursor-pointer ${
                i === slideIdx
                  ? 'w-4 h-4 bg-amber-400 shadow-[0_0_16px_rgba(250,204,21,0.9)]'
                  : 'w-3 h-3 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="btn-gold text-base sm:text-lg px-9 py-3 font-900 flex items-center gap-2 shadow-[0_0_35px_rgba(250,204,21,0.85)] hover:scale-105"
        >
          <span>{slideIdx === STORY_PANELS.length - 1 ? 'Enter Lab 🧪' : 'Next'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
