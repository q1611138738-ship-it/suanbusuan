import type { CSSProperties } from 'react';

const stars = [
  [8, 18, 1.3, 0.2, 7.5],
  [14, 38, 1, 1.4, 8.8],
  [18, 12, 1.6, 2.5, 9.8],
  [24, 24, 1.1, 3.3, 7.2],
  [28, 54, 1.5, 0.8, 8.4],
  [33, 18, 1, 2.1, 7.8],
  [39, 33, 1.4, 3.8, 9.2],
  [43, 9, 1.1, 1.2, 8.2],
  [48, 26, 1.8, 2.8, 10.5],
  [53, 15, 1.2, 4.1, 7.9],
  [59, 40, 1, 0.7, 8.7],
  [63, 22, 1.5, 2.2, 9.1],
  [68, 11, 1, 3.6, 7.4],
  [72, 36, 1.6, 1.7, 8.9],
  [78, 17, 1.2, 2.9, 9.6],
  [84, 31, 1.4, 0.5, 8.1],
  [91, 20, 1, 3.4, 7.7],
  [6, 61, 1.2, 4.2, 10],
  [12, 75, 1, 1.9, 8],
  [22, 68, 1.7, 0.3, 9.4],
  [35, 72, 1.1, 3.1, 8.6],
  [46, 62, 1.3, 1.1, 9],
  [57, 76, 1, 2.7, 7.6],
  [67, 64, 1.5, 4.4, 8.5],
  [76, 72, 1.1, 1.6, 9.7],
  [88, 62, 1.4, 3.9, 8.3],
] as const;

type StarStyle = CSSProperties & {
  '--star-size': string;
  '--star-delay': string;
  '--star-duration': string;
};

export function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      {stars.map(([left, top, size, delay, duration], index) => (
        <span
          key={`${left}-${top}-${index}`}
          className="star-field-dot"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              '--star-size': `${size}px`,
              '--star-delay': `${delay}s`,
              '--star-duration': `${duration}s`,
            } as StarStyle
          }
        />
      ))}
    </div>
  );
}
