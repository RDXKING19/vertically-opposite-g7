import React from 'react';
import { crossGeometry, hubGeometry } from '../engine/angleMath.js';

export function AngleDiagram({
  figure = {},
  size = 240,
  accent = '#38bdf8',
  ariaLabel,
  className = ''
}) {
  const {
    type = 'cross',
    theta = 65,
    rotation = 0,
    labels = ['A', 'B', 'C', 'D'],
    showAngles = ['AOB', 'COD'],
    unknown = 'COD',
    values = {},
    bent = false,
    bendAngle = 20,
    hubAngles = { a: 40, b: 65, c: 75 }
  } = figure;

  const R = 85;
  const cx = size / 2;
  const cy = size / 2;

  // Prepare description for screen readers
  const descriptiveLabel =
    ariaLabel ||
    (type === 'hub'
      ? `Three-line junction with angles ${hubAngles.a} degrees, ${hubAngles.b} degrees, and ${hubAngles.c} degrees meeting at vertex O.`
      : `Two straight lines crossing at vertex O at an angle of ${theta} degrees.`);

  if (type === 'hub') {
    const { a, b, c } = hubAngles;
    const geom = hubGeometry(a, b, c, rotation, R);
    const sectors = [
      { key: 'AOB', from: 'A', to: 'B', deg: a, label: values.AOB ?? `${a}°` },
      { key: 'BOC', from: 'B', to: 'C', deg: b, label: values.BOC ?? `${b}°` },
      { key: 'COD', from: 'C', to: 'D', deg: c, label: values.COD ?? `${c}°` },
      { key: 'DOE', from: 'D', to: 'E', deg: a, label: values.DOE ?? (unknown === 'DOE' ? '?' : `${a}°`) },
      { key: 'EOF', from: 'E', to: 'F', deg: b, label: values.EOF ?? (unknown === 'EOF' ? '?' : `${b}°`) },
      { key: 'FOA', from: 'F', to: 'A', deg: c, label: values.FOA ?? (unknown === 'FOA' ? '?' : `${c}°`) }
    ];

    const rayNames = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <svg
          role="img"
          aria-label={descriptiveLabel}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-md"
        >
          <defs>
            <filter id="hubGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform={`translate(${cx}, ${cy})`}>
            {/* The 3 straight lines AD, BE, CF */}
            {[
              ['A', 'D'],
              ['B', 'E'],
              ['C', 'F']
            ].map(([r1, r2], idx) => {
              const [x1, y1] = geom.pt(geom.rays[r1], R * 1.05);
              const [x2, y2] = geom.pt(geom.rays[r2], R * 1.05);
              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Sector Arcs and Values */}
            {sectors.map((s, idx) => {
              const shouldShow = showAngles.includes(s.key) || s.key === unknown || values[s.key] != null;
              if (!shouldShow) return null;

              const isUnknown = s.key === unknown;
              const rFrom = geom.rays[s.from];
              const rTo = geom.rays[s.to];
              const arcPath = geom.arc(rFrom, rTo, 36);
              const mid = geom.midRay(rFrom, rTo);
              const [tx, ty] = geom.pt(mid, 54);

              return (
                <g key={idx}>
                  <path
                    d={arcPath}
                    fill="none"
                    stroke={isUnknown ? '#facc15' : accent}
                    strokeWidth={isUnknown ? '3' : '2.5'}
                    strokeDasharray={isUnknown ? '4 2' : 'none'}
                    filter="url(#hubGlow)"
                  />
                  <text
                    x={tx}
                    y={ty + 4}
                    textAnchor="middle"
                    fill={isUnknown ? '#facc15' : '#ffffff'}
                    fontSize={isUnknown ? '16' : '12'}
                    fontWeight="900"
                    fontFamily="Fredoka One, Nunito, sans-serif"
                    className="drop-shadow"
                  >
                    {isUnknown ? '?' : s.label}
                  </text>
                </g>
              );
            })}

            {/* Central Vertex O */}
            <circle cx="0" cy="0" r="5" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
            <text
              x="0"
              y="16"
              textAnchor="middle"
              fill="#facc15"
              fontSize="12"
              fontWeight="900"
              fontFamily="Fredoka One, Nunito, sans-serif"
            >
              O
            </text>

            {/* Ray Endpoint Labels A..F */}
            {rayNames.map(name => {
              const rayDeg = geom.rays[name];
              const [lx, ly] = geom.pt(rayDeg, R * 1.25);
              return (
                <text
                  key={name}
                  x={lx}
                  y={ly + 4}
                  textAnchor="middle"
                  fill="#93c5fd"
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="Fredoka One, Nunito, sans-serif"
                >
                  {name}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }

  // Two-line Crossing (Cross)
  const geom = crossGeometry(theta, rotation, R);
  const [lblA = 'A', lblB = 'B', lblC = 'C', lblD = 'D'] = labels;

  // Bent line geometry support
  let rayD = geom.rays.D;
  if (bent) {
    rayD = (rayD + bendAngle) % 360;
  }

  const sectors = [
    { key: 'AOB', from: geom.rays.A, to: geom.rays.B, deg: theta, label: values.AOB ?? `${theta}°` },
    { key: 'BOC', from: geom.rays.B, to: geom.rays.C, deg: 180 - theta, label: values.BOC ?? `${180 - theta}°` },
    { key: 'COD', from: geom.rays.C, to: rayD, deg: theta, label: values.COD ?? (unknown === 'COD' ? '?' : `${theta}°`) },
    { key: 'DOA', from: rayD, to: geom.rays.A, deg: 180 - theta, label: values.DOA ?? (unknown === 'DOA' ? '?' : `${180 - theta}°`) }
  ];

  const [ax, ay] = geom.pt(geom.rays.A, R * 1.05);
  const [cxLine, cyLine] = geom.pt(geom.rays.C, R * 1.05);
  const [bx, by] = geom.pt(geom.rays.B, R * 1.05);
  const [dx, dy] = geom.pt(rayD, R * 1.05);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        role="img"
        aria-label={descriptiveLabel}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none drop-shadow-lg"
      >
        <defs>
          <filter id="crossGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g transform={`translate(${cx}, ${cy})`}>
          {/* Line 1: AC */}
          <line
            x1={ax}
            y1={ay}
            x2={cxLine}
            y2={cyLine}
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Line 2: BD (or separate rays if bent) */}
          {bent ? (
            <>
              <line
                x1={0}
                y1={0}
                x2={bx}
                y2={by}
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={0}
                y1={0}
                x2={dx}
                y2={dy}
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          ) : (
            <line
              x1={bx}
              y1={by}
              x2={dx}
              y2={dy}
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Sector Arcs and Values */}
          {sectors.map((s, idx) => {
            const shouldShow = showAngles.includes(s.key) || s.key === unknown || values[s.key] != null;
            if (!shouldShow) return null;

            const isUnknown = s.key === unknown;
            const arcRadius = 38;
            const arcPath = geom.arc(s.from, s.to, arcRadius);
            const mid = geom.midRay(s.from, s.to);
            const [tx, ty] = geom.pt(mid, 58);

            const isVOA = s.key === 'AOB' || s.key === 'COD';
            const sectorColor = isUnknown ? '#facc15' : isVOA ? accent : '#fb923c';

            return (
              <g key={idx}>
                <path
                  d={arcPath}
                  fill="none"
                  stroke={sectorColor}
                  strokeWidth={isUnknown ? '3.5' : '3'}
                  strokeDasharray={isUnknown ? '4 2' : 'none'}
                  filter="url(#crossGlow)"
                />
                <text
                  x={tx}
                  y={ty + 4}
                  textAnchor="middle"
                  fill={isUnknown ? '#facc15' : '#ffffff'}
                  fontSize={isUnknown ? '18' : '14'}
                  fontWeight="900"
                  fontFamily="Fredoka One, Nunito, sans-serif"
                  className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {isUnknown ? '?' : s.label}
                </text>
              </g>
            );
          })}

          {/* Central Vertex O */}
          <circle cx="0" cy="0" r="5.5" fill="#facc15" stroke="#ffffff" strokeWidth="2" filter="url(#crossGlow)" />
          <text
            x="0"
            y="-10"
            textAnchor="middle"
            fill="#facc15"
            fontSize="13"
            fontWeight="900"
            fontFamily="Fredoka One, Nunito, sans-serif"
          >
            O
          </text>

          {/* Ray Labels */}
          {[
            { name: lblA, deg: geom.rays.A },
            { name: lblB, deg: geom.rays.B },
            { name: lblC, deg: geom.rays.C },
            { name: lblD, deg: rayD }
          ].map(({ name, deg }) => {
            const [lx, ly] = geom.pt(deg, R * 1.25);
            return (
              <text
                key={name}
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                fill="#93c5fd"
                fontSize="14"
                fontWeight="900"
                fontFamily="Fredoka One, Nunito, sans-serif"
                className="drop-shadow"
              >
                {name}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
