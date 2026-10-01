import React from 'react';

export function BgSymbols() {
  const symbols = [
    { text: "∠AOB", top: "12%", left: "8%", size: "36px" },
    { text: "a = c", top: "25%", left: "82%", size: "38px" },
    { text: "180° − θ", top: "72%", left: "10%", size: "32px" },
    { text: "✖️", top: "80%", left: "75%", size: "48px" },
    { text: "360°", top: "45%", left: "92%", size: "32px" },
    { text: "3x + 10 = 5x − 20", top: "16%", left: "42%", size: "26px" },
    { text: "vert. opp. ∠s", top: "62%", left: "48%", size: "26px" },
    { text: "x = 15", top: "88%", left: "36%", size: "34px" },
    { text: "α + β + γ = 180°", top: "35%", left: "6%", size: "24px" }
  ];

  return (
    <div className="floating-bg-container">
      {symbols.map((s, idx) => (
        <span
          key={idx}
          className="floating-bg-item"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            animationDelay: `${idx * 2.2}s`
          }}
        >
          {s.text}
        </span>
      ))}
    </div>
  );
}

export function TopNav({
  phase,
  completed = {},
  muted,
  onToggleMute,
  onHome,
  onGoPhase,
  slideInfo,
  navRef
}) {
  const phases = [
    { num: '01', key: 'wonder', label: 'Wonder', icon: '🧙' },
    { num: '02', key: 'story', label: 'Story', icon: '📖' },
    { num: '03', key: 'simulate', label: 'Simulate', icon: '🧪' },
    { num: '04', key: 'practice', label: 'Practice', icon: '🎮' },
    { num: '05', key: 'reflect', label: 'Reflect', icon: '📝' }
  ];

  return (
    <header
      ref={navRef}
      className="w-full fixed top-0 left-0 right-0 px-4 sm:px-6 py-3 flex flex-col items-center z-50 pointer-events-none transition-all duration-200"
    >
      {/* Top Navbar Main Row */}
      <div className="w-full flex items-center justify-between pointer-events-none max-w-7xl">
        {/* Top Left: Home Button Pill */}
        <button
          onClick={onHome}
          className="pointer-events-auto bg-[#180c3c]/90 hover:bg-[#25145b] border border-white/25 text-white font-display font-800 text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105"
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </button>

        {/* Top Center: Capsule Progress Bar */}
        <nav className="pointer-events-auto bg-[#160a36]/95 border border-white/20 rounded-full px-2.5 sm:px-3.5 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-1 sm:gap-2">
          {phases.map((p, idx) => {
            const isActive = phase === p.key;

            return (
              <React.Fragment key={p.key}>
                {idx > 0 && <span className="w-2 sm:w-3.5 h-[1.5px] bg-white/25 shrink-0" />}

                <button
                  onClick={() => onGoPhase(p.key)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full font-display font-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#3b1c8c] text-white border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.45)] scale-105'
                      : 'bg-transparent text-slate-300 hover:text-white border border-transparent hover:border-white/10'
                  }`}
                >
                  {/* Number Pill Badge */}
                  <span
                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-black flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-white/15 text-slate-200'
                    }`}
                  >
                    {p.num}
                  </span>

                  {/* Icon & Label */}
                  <span className="text-xs sm:text-sm">{p.icon}</span>
                  <span className="hidden md:inline tracking-tight">{p.label}</span>
                </button>
              </React.Fragment>
            );
          })}

          {/* Separator before Audio Toggle */}
          <span className="w-2 sm:w-3.5 h-[1.5px] bg-white/25 shrink-0" />

          {/* Audio Mute/Unmute Pill */}
          <button
            onClick={onToggleMute}
            className={`px-3 py-1.5 rounded-full font-display font-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer border ${
              muted
                ? 'bg-rose-950/80 border-rose-400/50 text-rose-300'
                : 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300'
            }`}
          >
            <span className="text-sm">{muted ? "🔇" : "🔊"}</span>
            <span className="hidden sm:inline">{muted ? "Muted" : "Unmuted"}</span>
          </button>
        </nav>

        {/* Top Right: Close (X) / Reset Button */}
        <button
          onClick={onHome}
          title="Restart Module"
          className="pointer-events-auto w-9 h-9 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
        >
          ✕
        </button>
      </div>

      {/* Centered Slide Progress Track Bar (Appears below Navbar Capsule during Story Phase) */}
      {slideInfo && (
        <div className="pointer-events-auto mt-2.5 w-full max-w-xl flex items-center gap-3 fade-in-up">
          <div className="flex-1 bg-white/15 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/10">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
              style={{ width: `${(slideInfo.current / slideInfo.total) * 100}%` }}
            />
          </div>
          <span className="font-display font-900 text-xs sm:text-sm text-white shrink-0">
            {slideInfo.current} / {slideInfo.total}
          </span>
        </div>
      )}
    </header>
  );
}
