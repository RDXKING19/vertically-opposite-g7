import React, { useState, useEffect } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { simulateIntro, simDoneNarration } from '../utils/narration.js';
import {
  ScissorLab,
  LaserJunction,
  StarHub
} from '../components/SimActivities.jsx';

const STATIONS = [
  {
    id: 1,
    icon: '✂️',
    name: '1. Spot the Twins',
    sub: 'Opposite Angles are Equal!',
    desc: 'Move the scissor blades and see why angles facing each other are ALWAYS identical twins!',
    Comp: ScissorLab
  },
  {
    id: 2,
    icon: '📏',
    name: '2. The 180° Road',
    sub: 'Straight Line Partners',
    desc: 'A straight road is a 180° half-turn. Find the missing piece to make 180°!',
    Comp: LaserJunction
  },
  {
    id: 3,
    icon: '💡',
    name: '3. 4-Corner Puzzle',
    sub: 'Solve the Entire Crossing!',
    desc: 'Use your opposite twin rule and straight-line rule to unlock all 4 corners!',
    Comp: StarHub
  }
];

export function SimulatePhase({ muted, onNext, simStationsDone = [false, false, false], onStationComplete }) {
  const [station, setStation] = useState(1);

  const currentStation = STATIONS[station - 1];
  const ActivityComp = currentStation.Comp;
  const isCurrentDone = Boolean(simStationsDone[station - 1]);
  const isAllDone = simStationsDone.slice(0, 3).every(Boolean);

  useEffect(() => {
    narrate(simulateIntro(station), !muted);
    return () => stopNarration();
  }, [station, muted]);

  const handleStationFinished = () => {
    if (onStationComplete) {
      onStationComplete(station - 1);
    }
    narrate(simDoneNarration(station), !muted);
  };

  const nextStation = () => {
    if (station < 3) {
      setStation(s => s + 1);
    } else {
      onNext();
    }
  };

  const prevStation = () => {
    if (station > 1) {
      setStation(s => s - 1);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Simulation Stations Glass Card */}
      <div className="w-full max-w-6xl max-h-[94vh] sim-card bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Cyan Accent Bar */}
        <div className="sim-accent w-28 h-2.5 bg-cyan-400 rounded-full mb-2 shadow-[0_0_18px_rgba(56,189,248,0.85)] shrink-0" />

        {/* Card Header Title */}
        <h2 className="sim-title font-display font-900 text-2xl sm:text-3xl md:text-4xl text-white flex items-center gap-3 mb-3.5 shrink-0">
          <span className="text-3xl sm:text-4xl">🧪</span>
          <span>Simulation Stations</span>
        </h2>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 w-full items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Station Sidebar Tabs */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-3.5">
              {STATIONS.map((st, idx) => {
                const isUnlocked = idx === 0 || simStationsDone[idx - 1];
                const isCompleted = simStationsDone[idx];
                const isActive = station === st.id;

                return (
                  <button
                    key={st.id}
                    disabled={!isUnlocked}
                    onClick={() => setStation(st.id)}
                    className={`p-4 sm:p-4.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 ${
                      !isUnlocked
                        ? 'opacity-40 border-white/10 bg-[#100724]/40 cursor-not-allowed'
                        : isActive
                          ? 'border-cyan-400 bg-[#1e2852] text-white shadow-[0_0_22px_rgba(56,189,248,0.4)] scale-[1.02] cursor-pointer'
                          : 'border-purple-500/25 bg-[#13082b]/80 text-slate-200 hover:border-cyan-400/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                          isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-white'
                        }`}
                      >
                        {st.icon}
                      </div>
                      <div>
                        <p className="font-display font-black text-base sm:text-lg leading-tight text-white">{st.name}</p>
                        <p className="text-xs sm:text-sm font-extrabold text-amber-300 mt-0.5">{st.sub}</p>
                      </div>
                    </div>
                    <span className="text-xl">
                      {isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Left CTA */}
            <button
              onClick={onNext}
              disabled={!isAllDone}
              className="btn-gold font-display font-black text-base sm:text-lg py-4 px-6 shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition mt-2 w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Go to Practice Phase!</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Column: Interactive Simulation Pane */}
          <div className="sim-right md:col-span-8 bg-[#13092e]/95 border-2 border-purple-400/35 rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-inner flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 justify-between">
              {/* Header Row */}
              <div className="sim-head flex items-center justify-between border-b border-white/15 pb-3 mb-3 shrink-0">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{currentStation.icon}</span>
                  <span>{currentStation.name}</span>
                </h3>
                <span className="font-display font-black text-sm sm:text-base text-amber-300 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/40">
                  Station {station} of 3
                </span>
              </div>

              {/* Station Description */}
              <p className="sim-desc text-white text-base sm:text-lg leading-relaxed font-extrabold mb-3 shrink-0">
                {currentStation.desc}
              </p>

              {/* Interactive Station Activity Component */}
              <div className="sim-body flex-1 min-h-0 flex flex-col overflow-y-auto">
                <ActivityComp
                  key={station}
                  onComplete={handleStationFinished}
                />
              </div>
            </div>

            {/* Footer Navigation Buttons */}
            <div className="sim-foot flex items-center justify-between border-t border-white/15 pt-3.5 mt-3 shrink-0">
              <button
                onClick={prevStation}
                disabled={station === 1}
                className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/25 text-white font-display font-black text-sm sm:text-base px-6 py-2.5 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                ← Previous Station
              </button>

              <button
                onClick={nextStation}
                disabled={!isCurrentDone}
                className="btn-gold text-base sm:text-lg font-black px-8 py-3 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>
                  {station === 3 && isAllDone ? 'Go to Practice Phase' : 'Next Station'}
                </span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
