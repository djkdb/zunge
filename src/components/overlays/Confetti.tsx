import { useMemo } from 'react';

const COLORS = ['#ffd06a', '#5b9dff', '#5ee596', '#ff8a3d', '#b9a6ff', '#ff8aa1'];

export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.4 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      w: 4 + Math.random() * 5,
      h: 6 + Math.random() * 8,
    })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
