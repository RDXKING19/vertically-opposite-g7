import React, { useState } from 'react';
import confetti from 'canvas-confetti';

/* =========================================================================
   GEOMETRY HELPERS (0° = East, 90° = North, 180° = West, 270° = South)
   ========================================================================= */
const toRad = deg => (deg * Math.PI) / 180;

function ptOnCircle(cx, cy, r, deg) {
  return {
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg))
  };
}

function makeWedgePath(cx, cy, r, startDeg, endDeg) {
  const p1 = ptOnCircle(cx, cy, r, startDeg);
  const p2 = ptOnCircle(cx, cy, r, endDeg);
  let span = (endDeg - startDeg + 360) % 360;
  if (span === 0) span = 360;
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${largeArc} 0 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`;
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });
  } catch (e) {
    /* ignore */
  }
}

/* =========================================================================
   STATION 1: ✂️ SPOT THE TWINS (Opposite Angles Are Always Equal!)
   Super simple, visual & fun: Move the slider, see Angle A and Angle C match 100%!
   ========================================================================= */
export function ScissorLab({ onComplete }) {
  const [angle, setAngle] = useState(60);
  const [spinActive, setSpinActive] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const angleA = angle;
  const angleC = angle; // Opposite twin!

  // Spin 180° animation
  const handleSpin = () => {
    setSpinActive(true);
    triggerConfetti();
    setTimeout(() => setSpinActive(false), 1600);
  };

  const handleAngleChange = (newAngle) => {
    setAngle(newAngle);
    setQuizAnswer(null); // Reset quiz answer on angle change to prevent stale state
  };

  const handleQuiz = (ans) => {
    setQuizAnswer(ans);
    if (ans === angle) {
      triggerConfetti();
      if (!isDone) {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }
  };

  // Guaranteed distinct 3 options (fixes angle === 90 duplicate key bug)
  const opt1 = angle;
  const opt2 = 180 - angle !== angle ? 180 - angle : (angle + 30 <= 135 ? angle + 30 : angle - 30);
  let opt3 = 90;
  if (opt3 === opt1 || opt3 === opt2) {
    opt3 = angle <= 60 ? angle + 45 : angle - 25;
  }
  const quizOptions = Array.from(new Set([opt1, opt2, opt3])).sort((a, b) => a - b);

  // SVG Geometry
  const cx = 135;
  const cy = 135;
  const r = 110;
  const arcR = 48;

  const pEast = ptOnCircle(cx, cy, r, 0);
  const pWest = ptOnCircle(cx, cy, r, 180);
  const pBladeTop = ptOnCircle(cx, cy, r, angle);
  const pHandleBottom = ptOnCircle(cx, cy, r, 180 + angle);

  return (
    <div className="flex flex-col gap-3 w-full text-slate-100 select-none">
      {/* Friendly Rule Banner */}
      <div className="bg-[#1c0c42] border-2 border-cyan-400 p-3 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✂️</span>
          <div>
            <h4 className="font-display font-black text-lg sm:text-xl text-cyan-300 leading-tight">
              Rule 1: Vertically Opposite Angles are EQUAL TWINS!
            </h4>
            <p className="text-sm font-extrabold text-white mt-0.5">
              The angle facing directly across the vertex is ALWAYS the exact same size!
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Playground */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#13072e]/95 p-4 sm:p-6 rounded-3xl border-2 border-purple-500/30 shadow-2xl">
        {/* Left: Illustrated Scissor Crossing */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 270 270" className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-2xl">
            <circle cx={cx} cy={cy} r="122" fill="#09031c" stroke="#2c145e" strokeWidth="2" />

            {/* Top Angle A (Cyan) */}
            <path
              d={makeWedgePath(cx, cy, arcR, 0, angle)}
              fill="rgba(34, 211, 238, 0.45)"
              stroke="#22d3ee"
              strokeWidth="3.5"
            />

            {/* Bottom Angle C (Cyan - Opposite Twin!) */}
            <path
              d={makeWedgePath(cx, cy, arcR, 180, 180 + angle)}
              fill="rgba(34, 211, 238, 0.45)"
              stroke="#22d3ee"
              strokeWidth="3.5"
            />

            {/* Crossing Lines */}
            <line x1={pWest.x} y1={pWest.y} x2={pEast.x} y2={pEast.y} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1={pHandleBottom.x} y1={pHandleBottom.y} x2={pBladeTop.x} y2={pBladeTop.y} stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

            {/* Scissor Finger Loops */}
            <circle cx={pWest.x - 6} cy={pWest.y} r="10" fill="none" stroke="#ffffff" strokeWidth="3" />
            <circle cx={pHandleBottom.x - 5} cy={pHandleBottom.y + 5} r="10" fill="none" stroke="#38bdf8" strokeWidth="3" />

            {/* 180° Spin Ghost Angle Animation */}
            {spinActive && (
              <g className="animate-spin origin-[135px_135px]">
                <circle cx={cx} cy={cy} r={arcR + 12} fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="8 6" />
              </g>
            )}

            {/* Center Pivot O */}
            <circle cx={cx} cy={cy} r="8" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
            <text x={cx} y={cy + 22} textAnchor="middle" fill="#fde047" fontSize="13" fontWeight="900">
              Vertex O
            </text>

            {/* High-Contrast Bold Angle Badges */}
            <text x={cx + 38} y={cy - 14} fill="#22d3ee" fontSize="18" fontWeight="900">
              A: {angleA}°
            </text>
            <text x={cx - 70} y={cy + 30} fill="#22d3ee" fontSize="18" fontWeight="900">
              C: {angleC}°
            </text>
          </svg>

          {/* Simple Slider: Drag to change angle */}
          <div className="flex flex-col items-center gap-1.5 mt-2 w-full max-w-[280px]">
            <div className="flex items-center justify-between w-full text-xs font-black text-cyan-300">
              <span>Drag slider to open/close:</span>
              <span className="text-base text-yellow-300">{angle}°</span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => handleAngleChange(Math.max(30, angle - 5))}
                className="w-9 h-9 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-black text-base border border-cyan-400/40 transition active:scale-95 cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              <input
                type="range"
                min="30"
                max="135"
                value={angle}
                onChange={e => handleAngleChange(+e.target.value)}
                className="flex-1 accent-cyan-400 cursor-pointer h-3.5 bg-purple-950 rounded-lg"
              />
              <button
                onClick={() => handleAngleChange(Math.min(135, angle + 5))}
                className="w-9 h-9 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-black text-base border border-cyan-400/40 transition active:scale-95 cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right: Easy-To-Understand Discovery Card */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {/* Real-time Match Banner */}
          <div className="bg-[#1b0a42] p-4 rounded-2xl border-2 border-cyan-400/50 text-center shadow-lg">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Live Observation</span>
            <p className="font-display font-black text-2xl sm:text-3xl text-yellow-300 mt-1">
              Angle A ({angleA}°) = Angle C ({angleC}°)
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-300 mt-1.5">
              ✨ As you move the slider, both angles stay 100% EQUAL!
            </p>
          </div>

          {/* Fun 180° Spin Test Button */}
          <button
            onClick={handleSpin}
            className="py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-base sm:text-lg transition cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Spin 180° to Prove They Match!</span>
          </button>

          {/* Quick 1-Click Check */}
          <div className="bg-[#0f0426] p-4 rounded-2xl border-2 border-purple-400/40 flex flex-col gap-2.5">
            <p className="font-display font-black text-sm sm:text-base text-white">
              Quick Question: If Angle A is {angle}°, what is Angle C?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quizOptions.map(val => (
                <button
                  key={val}
                  onClick={() => handleQuiz(val)}
                  className={`py-2.5 rounded-xl font-display font-black text-base sm:text-lg border-2 transition cursor-pointer ${
                    quizAnswer === val
                      ? val === angle
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.7)]'
                        : 'bg-rose-600 text-white border-rose-400'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:scale-105'
                  }`}
                >
                  {val}° {val === angle && quizAnswer === angle ? '👯' : ''}
                </button>
              ))}
            </div>

            {/* Clear positive or instructive error feedback */}
            {quizAnswer === angle && (
              <div className="bg-emerald-950 border border-emerald-400/80 p-2.5 rounded-xl text-emerald-200 font-black text-xs sm:text-sm text-center animate-bounce mt-1">
                🎉 Correct! Opposite angles are ALWAYS EQUAL! Because Angle A = {angle}°, Angle C = {angle}°! Station 1 Complete!
              </div>
            )}
            {quizAnswer !== null && quizAnswer !== angle && (
              <div className="bg-rose-950/90 border border-rose-400/80 p-2.5 rounded-xl text-rose-200 font-extrabold text-xs sm:text-sm text-center mt-1">
                ❌ Not quite! Angle C faces directly across from Angle A ({angle}°). Vertically opposite angles are equal twins, so Angle C must be {angle}°!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STATION 2: 📏 THE 180° ROAD (Straight Line Partners Add to 180°!)
   Super simple: A straight line is 180°. You see 50°. Tap the missing piece!
   ========================================================================= */
export function LaserJunction({ onComplete }) {
  const [givenAngle, setGivenAngle] = useState(50);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const missingAngle = 180 - givenAngle; // e.g. 130°

  const handleSelect = (ans) => {
    setSelectedAnswer(ans);
    if (ans === missingAngle) {
      triggerConfetti();
      if (!isDone) {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }
  };

  // Distinct options sorted numerically so correct answer is not trivially always first
  const junctionOptions = Array.from(new Set([givenAngle, missingAngle, 180])).sort((a, b) => a - b);

  // SVG Geometry for straight road
  const cx = 135;
  const cy = 135;
  const r = 110;
  const arcR = 52;

  const pEast = ptOnCircle(cx, cy, r, 0);
  const pWest = ptOnCircle(cx, cy, r, 180);
  const pDivider = ptOnCircle(cx, cy, r, givenAngle);

  return (
    <div className="flex flex-col gap-3 w-full text-slate-100 select-none">
      {/* Friendly Rule Banner */}
      <div className="bg-[#1c1204] border-2 border-amber-400 p-3 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📏</span>
          <div>
            <h4 className="font-display font-black text-lg sm:text-xl text-amber-300 leading-tight">
              Rule 2: Angles on a Straight Line Add to 180°!
            </h4>
            <p className="text-sm font-extrabold text-white mt-0.5">
              A straight road is a half-turn (180°). Side-by-side angles share the 180° total!
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Playground */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#170e06]/95 p-4 sm:p-6 rounded-3xl border-2 border-amber-500/30 shadow-2xl">
        {/* Left: 180° Half-Turn Diagram */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 270 270" className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-2xl">
            <circle cx={cx} cy={cy} r="122" fill="#0c0702" stroke="#422006" strokeWidth="2" />

            {/* Complete 180° Half-Turn Glowing Rainbow Arc */}
            <path
              d={makeWedgePath(cx, cy, arcR + 12, 0, 180)}
              fill="none"
              stroke="#facc15"
              strokeWidth="3"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Left Sector: Given Angle (e.g. 50° Cyan) */}
            <path
              d={makeWedgePath(cx, cy, arcR, 0, givenAngle)}
              fill="rgba(34, 211, 238, 0.45)"
              stroke="#22d3ee"
              strokeWidth="3.5"
            />

            {/* Right Sector: Missing Angle (Orange/Amber) */}
            <path
              d={makeWedgePath(cx, cy, arcR, givenAngle, 180)}
              fill={selectedAnswer === missingAngle ? 'rgba(250, 204, 21, 0.5)' : 'rgba(244, 63, 94, 0.25)'}
              stroke={selectedAnswer === missingAngle ? '#facc15' : '#f43f5e'}
              strokeWidth="3.5"
            />

            {/* Straight Horizontal Highway Line */}
            <line x1={pWest.x} y1={pWest.y} x2={pEast.x} y2={pEast.y} stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />

            {/* Dividing Line */}
            <line x1={cx} y1={cy} x2={pDivider.x} y2={pDivider.y} stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" />

            {/* Vertex O */}
            <circle cx={cx} cy={cy} r="8" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
            <text x={cx} y={cy + 22} textAnchor="middle" fill="#fde047" fontSize="13" fontWeight="900">
              Straight Line = 180°
            </text>

            {/* Angle Labels */}
            <text x={cx + 38} y={cy - 16} fill="#22d3ee" fontSize="18" fontWeight="900">
              {givenAngle}°
            </text>
            <text x={cx - 36} y={cy - 20} fill={selectedAnswer === missingAngle ? '#facc15' : '#f43f5e'} fontSize="20" fontWeight="900">
              {selectedAnswer === missingAngle ? `${missingAngle}°` : '?°'}
            </text>
          </svg>

          {/* Quick angle switch buttons */}
          <div className="flex items-center gap-2 mt-2">
            {[40, 50, 70].map(a => (
              <button
                key={a}
                onClick={() => { setGivenAngle(a); setSelectedAnswer(null); }}
                className={`px-3 py-1.5 rounded-xl font-display font-black text-xs border transition cursor-pointer ${
                  givenAngle === a
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                }`}
              >
                Try {a}°
              </button>
            ))}
          </div>
        </div>

        {/* Right: Interactive 180° Calculation Card */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="bg-[#241303] p-4 rounded-2xl border-2 border-amber-400/50 flex flex-col gap-2.5 shadow-lg">
            <span className="font-display font-black text-amber-300 text-base sm:text-lg">
              Find the Missing Angle on the Straight Road:
            </span>
            <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
              Because a straight line equals 180°, subtract the known angle:
            </p>

            {/* Giant Big Math Formula Box */}
            <div className="bg-black/60 p-3.5 rounded-2xl border-2 border-amber-400/40 text-center font-display font-black text-2xl sm:text-3xl text-yellow-300">
              180° − {givenAngle}° = <span className="text-cyan-300">{selectedAnswer === missingAngle ? missingAngle : '?'}</span>
            </div>
          </div>

          {/* Big Chunky Option Buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Tap the correct answer:</span>
            <div className="grid grid-cols-3 gap-2.5">
              {junctionOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`py-3.5 rounded-2xl font-display font-black text-xl border-2 transition cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                    selectedAnswer === opt
                      ? opt === missingAngle
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.7)]'
                        : 'bg-rose-600 text-white border-rose-400'
                      : 'bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white border-white/20'
                  }`}
                >
                  {opt}°
                </button>
              ))}
            </div>
          </div>

          {/* Educational Feedback */}
          {selectedAnswer === missingAngle && (
            <div className="bg-emerald-950 border-2 border-emerald-400 p-3 rounded-2xl text-emerald-200 font-display font-black text-sm sm:text-base text-center animate-bounce">
              🎉 180° − {givenAngle}° = {missingAngle}°! The straight line is complete! Station 2 Complete!
            </div>
          )}
          {selectedAnswer !== null && selectedAnswer !== missingAngle && (
            <div className="bg-rose-950/90 border-2 border-rose-400 p-3 rounded-2xl text-rose-200 font-extrabold text-xs sm:text-sm text-center">
              ❌ Remember: A straight road is 180° in total! Subtract the given angle: 180° − {givenAngle}° = {missingAngle}°!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const JunctionBuilder = LaserJunction;

/* =========================================================================
   STATION 3: 💡 4-CORNER JUNCTION PUZZLE (Solve All 4 Angles!)
   Super simple: Given ONE angle (65°). Tap the 3 dark corners to light them up!
   ========================================================================= */
export function StarHub({ onComplete }) {
  const [given, setGiven] = useState(65);
  const supplement = 180 - given; // e.g. 115°

  const [powered, setPowered] = useState({
    SW: false, // Twin of NE (given)
    NW: false, // Straight line neighbor (supplement)
    SE: false  // Straight line neighbor / Twin of NW (supplement)
  });

  const [activeCorner, setActiveCorner] = useState('SW'); // which corner is user clicking
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const isAllPowered = powered.SW && powered.NW && powered.SE;

  const handlePowerUp = (corner, choice) => {
    // If corner already powered, show gentle nudge
    if (powered[corner]) {
      setWrongFeedback(`This corner is already powered up (${corner === 'SW' ? given : supplement}°)! Select another corner.`);
      return;
    }

    const isCorrect =
      (corner === 'SW' && choice === given) ||
      (corner === 'NW' && choice === supplement) ||
      (corner === 'SE' && choice === supplement);

    if (isCorrect) {
      setWrongFeedback(null);
      triggerConfetti();
      const next = { ...powered, [corner]: true };
      setPowered(next);

      // Auto advance to the first remaining unpowered corner
      const remaining = ['SW', 'NW', 'SE'].filter(c => !next[c]);
      if (remaining.length > 0) {
        setActiveCorner(remaining[0]);
      }

      if (next.SW && next.NW && next.SE) {
        if (!hasCompleted) {
          setHasCompleted(true);
          if (onComplete) onComplete();
        }
      }
    } else {
      // Clear informative error feedback explaining why the choice is wrong
      if (corner === 'SW') {
        setWrongFeedback(`❌ The SW corner faces directly across from the ${given}° NE corner. Vertically opposite angles are equal twins, so SW must be ${given}°!`);
      } else if (corner === 'NW') {
        setWrongFeedback(`❌ The NW corner sits on a straight line next to ${given}°. Angles on a straight line add to 180°, so 180° − ${given}° = ${supplement}°!`);
      } else {
        setWrongFeedback(`❌ The SE corner is vertically opposite from NW (${supplement}°), and on a straight line with NE (${given}°). 180° − ${given}° = ${supplement}°!`);
      }
    }
  };

  const handleReset = (newGiven = 65) => {
    setGiven(newGiven);
    setPowered({ SW: false, NW: false, SE: false });
    setActiveCorner('SW');
    setWrongFeedback(null);
  };

  // SVG Geometry
  const cx = 135;
  const cy = 135;
  const r = 110;
  const arcR = 48;

  const pEast = ptOnCircle(cx, cy, r, 0);
  const pWest = ptOnCircle(cx, cy, r, 180);
  const pNE = ptOnCircle(cx, cy, r, given);
  const pSW = ptOnCircle(cx, cy, r, 180 + given);

  return (
    <div className="flex flex-col gap-3 w-full text-slate-100 select-none">
      {/* Friendly Rule Banner */}
      <div className="bg-[#0a1e12] border-2 border-emerald-400 p-3 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-display font-black text-lg sm:text-xl text-emerald-300 leading-tight">
              Rule 3: Solve All 4 Corners from Just ONE Angle!
            </h4>
            <p className="text-sm font-extrabold text-white mt-0.5">
              Use your Opposite Twin Rule and Straight Line 180° Rule to unlock the whole crossing!
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Playground */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#07170e]/95 p-4 sm:p-6 rounded-3xl border-2 border-emerald-500/30 shadow-2xl">
        {/* Left: 4-Way Crossing Junction */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 270 270" className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-2xl">
            <circle cx={cx} cy={cy} r="122" fill="#040d08" stroke="#14532d" strokeWidth="2" />

            {/* Corner 1: NE (Given: 65° Always Green) */}
            <path
              d={makeWedgePath(cx, cy, arcR, 0, given)}
              fill="rgba(52, 211, 153, 0.45)"
              stroke="#34d399"
              strokeWidth="3.5"
            />
            <text x={cx + 36} y={cy - 14} fill="#34d399" fontSize="17" fontWeight="900">
              {given}° 🟢
            </text>

            {/* Corner 2: SW (Twin to NE) */}
            <path
              d={makeWedgePath(cx, cy, arcR, 180, 180 + given)}
              fill={powered.SW ? 'rgba(52, 211, 153, 0.45)' : 'rgba(244, 63, 94, 0.2)'}
              stroke={powered.SW ? '#34d399' : '#f43f5e'}
              strokeWidth={activeCorner === 'SW' ? '4' : '2'}
              strokeDasharray={powered.SW ? 'none' : '4 3'}
              className="cursor-pointer"
              onClick={() => { setActiveCorner('SW'); setWrongFeedback(null); }}
            />
            <text x={cx - 65} y={cy + 30} fill={powered.SW ? '#34d399' : '#f43f5e'} fontSize={powered.SW ? '17' : '20'} fontWeight="900">
              {powered.SW ? `${given}° 🟢` : '? 🔴'}
            </text>

            {/* Corner 3: NW (180° - given) */}
            <path
              d={makeWedgePath(cx, cy, arcR - 6, given, 180)}
              fill={powered.NW ? 'rgba(250, 204, 21, 0.45)' : 'rgba(244, 63, 94, 0.2)'}
              stroke={powered.NW ? '#facc15' : '#f43f5e'}
              strokeWidth={activeCorner === 'NW' ? '4' : '2'}
              strokeDasharray={powered.NW ? 'none' : '4 3'}
              className="cursor-pointer"
              onClick={() => { setActiveCorner('NW'); setWrongFeedback(null); }}
            />
            <text x={cx - 28} y={cy - 22} fill={powered.NW ? '#facc15' : '#f43f5e'} fontSize={powered.NW ? '16' : '18'} fontWeight="900">
              {powered.NW ? `${supplement}° 🟡` : '? 🔴'}
            </text>

            {/* Corner 4: SE (Twin to NW) */}
            <path
              d={makeWedgePath(cx, cy, arcR - 6, 180 + given, 360)}
              fill={powered.SE ? 'rgba(250, 204, 21, 0.45)' : 'rgba(244, 63, 94, 0.2)'}
              stroke={powered.SE ? '#facc15' : '#f43f5e'}
              strokeWidth={activeCorner === 'SE' ? '4' : '2'}
              strokeDasharray={powered.SE ? 'none' : '4 3'}
              className="cursor-pointer"
              onClick={() => { setActiveCorner('SE'); setWrongFeedback(null); }}
            />
            <text x={cx + 18} y={cy + 36} fill={powered.SE ? '#facc15' : '#f43f5e'} fontSize={powered.SE ? '16' : '18'} fontWeight="900">
              {powered.SE ? `${supplement}° 🟡` : '? 🔴'}
            </text>

            {/* Crossing Lines */}
            <line x1={pWest.x} y1={pWest.y} x2={pEast.x} y2={pEast.y} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <line x1={pSW.x} y1={pSW.y} x2={pNE.x} y2={pNE.y} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

            {/* Center Pivot O */}
            <circle cx={cx} cy={cy} r="7" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
          </svg>

          {/* Corner Switcher Buttons */}
          <div className="flex items-center gap-2 mt-2">
            {[
              { id: 'SW', label: 'Bottom-Left (Opposite)', done: powered.SW },
              { id: 'NW', label: 'Top-Left (180°)', done: powered.NW },
              { id: 'SE', label: 'Bottom-Right (Twin)', done: powered.SE }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCorner(c.id); setWrongFeedback(null); }}
                className={`px-2.5 py-1.5 rounded-xl font-display font-black text-xs border transition cursor-pointer ${
                  activeCorner === c.id
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : c.done
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/10 text-slate-300 border-white/15'
                }`}
              >
                {c.done ? '✓' : ''} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Simple 1-Click Power-Up Action */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="bg-[#0f2919] p-4 rounded-2xl border-2 border-emerald-400/50 flex flex-col gap-2 shadow-lg">
            <span className="font-display font-black text-emerald-300 text-base sm:text-lg">
              {activeCorner === 'SW'
                ? 'Solving: Bottom-Left Corner (Opposite Twin)'
                : activeCorner === 'NW'
                  ? 'Solving: Top-Left Corner (Straight Line)'
                  : 'Solving: Bottom-Right Corner (Twin of Top-Left)'}
            </span>

            <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {activeCorner === 'SW'
                ? `It faces directly across from ${given}°. What must it be?`
                : activeCorner === 'NW'
                  ? `It sits on a straight line next to ${given}° (180° − ${given}°):`
                  : `It is the opposite twin of the ${supplement}° corner:`}
            </p>
          </div>

          {/* 2 Big Choice Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[given, supplement].map(val => (
              <button
                key={val}
                onClick={() => handlePowerUp(activeCorner, val)}
                className="py-4 px-4 rounded-2xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 font-display font-black text-2xl border-2 border-white/20 transition cursor-pointer shadow-lg hover:scale-105 active:scale-95 text-white"
              >
                {val}°
              </button>
            ))}
          </div>

          {/* Wrong feedback message banner */}
          {wrongFeedback && (
            <div className="bg-rose-950/90 border-2 border-rose-400 p-3 rounded-2xl text-rose-200 font-extrabold text-xs sm:text-sm text-center">
              {wrongFeedback}
            </div>
          )}

          {isAllPowered ? (
            <div className="flex flex-col gap-2.5">
              <div className="bg-emerald-950 border-2 border-emerald-400 p-3.5 rounded-2xl text-emerald-200 font-display font-black text-base text-center animate-bounce shadow-xl">
                🎉 ALL 4 CORNERS SOLVED! {given}° + {supplement}° + {given}° + {supplement}° = 360°! Station 3 Complete!
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleReset(given === 65 ? 50 : 65)}
                  className="px-4 py-2 rounded-xl bg-emerald-600/40 hover:bg-emerald-500 text-white hover:text-slate-950 font-display font-black text-xs border border-emerald-400/50 transition cursor-pointer"
                >
                  🔄 Practice With Another Angle ({given === 65 ? '50°' : '65°'})
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm font-extrabold text-slate-300 text-center">
              Solve all 3 dark corners to complete the station!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const HubDesigner = StarHub;
