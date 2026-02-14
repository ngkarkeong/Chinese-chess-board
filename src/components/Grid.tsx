import React from 'react';

const Grid: React.FC = () => {
  const horizontals = Array.from({ length: 10 }, (_, i) => i);
  const verticals = Array.from({ length: 9 }, (_, i) => i);

  // Cross markers positions
  const markers = [
    [1, 2], [7, 2], [1, 7], [7, 7],
    [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
    [0, 6], [2, 6], [4, 6], [6, 6], [8, 6]
  ];

  return (
    <svg viewBox="0 0 900 1000" className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none">
      {/* Border */}
      <rect x="45" y="45" width="810" height="910" fill="none" stroke="#5c4033" strokeWidth="5" />

      {/* Horizontals */}
      {horizontals.map(i => (
        <line key={`h-${i}`} x1="50" y1={50 + i * 100} x2="850" y2={50 + i * 100} stroke="#5c4033" strokeWidth="2" />
      ))}

      {/* Verticals (Split for River) */}
      {verticals.map(i => (
        <React.Fragment key={`v-${i}`}>
          <line x1={50 + i * 100} y1="50" x2={50 + i * 100} y2="450" stroke="#5c4033" strokeWidth="2" />
          <line x1={50 + i * 100} y1="550" x2={50 + i * 100} y2="950" stroke="#5c4033" strokeWidth="2" />
        </React.Fragment>
      ))}

      {/* Palaces */}
      <line x1="350" y1="50" x2="550" y2="250" stroke="#5c4033" strokeWidth="2" />
      <line x1="550" y1="50" x2="350" y2="250" stroke="#5c4033" strokeWidth="2" />
      <line x1="350" y1="950" x2="550" y2="750" stroke="#5c4033" strokeWidth="2" />
      <line x1="550" y1="950" x2="350" y2="750" stroke="#5c4033" strokeWidth="2" />

      {/* River Text */}
      <text x="250" y="515" fontSize="40" fontFamily="serif" fill="#5c4033" textAnchor="middle" dominantBaseline="middle">楚 河</text>
      <text x="650" y="515" fontSize="40" fontFamily="serif" fill="#5c4033" textAnchor="middle" dominantBaseline="middle">漢 界</text>

      {/* Markers */}
      {markers.map(([c, r], idx) => {
        const x = 50 + c * 100;
        const y = 50 + r * 100;
        const o = 5; // offset
        const l = 15; // length
        const paths = [];
        if (c > 0) {
            paths.push(`M ${x - o} ${y - o - l} L ${x - o} ${y - o} L ${x - o - l} ${y - o}`); // TL
            paths.push(`M ${x - o} ${y + o + l} L ${x - o} ${y + o} L ${x - o - l} ${y + o}`); // BL
        }
        if (c < 8) {
            paths.push(`M ${x + o} ${y - o - l} L ${x + o} ${y - o} L ${x + o + l} ${y - o}`); // TR
            paths.push(`M ${x + o} ${y + o + l} L ${x + o} ${y + o} L ${x + o + l} ${y + o}`); // BR
        }
        return (
          <g key={`m-${idx}`} stroke="#5c4033" strokeWidth="2" fill="none">
            {paths.map((d, i) => <path key={i} d={d} />)}
          </g>
        );
      })}
    </svg>
  );
};

export default Grid;