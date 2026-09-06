/** 공간 씬을 구성하는 SVG 픽셀 파츠 (viewBox 320 x 200 기준) */
import type { ReactNode } from 'react';
import { PixelSprite } from './PixelSprite';
import { TEAMMATE_ROWS, TEAMMATE_STYLES, teammatePalette } from './zunSprite';

const R = ({ x, y, w, h, c, className, style, rx, opacity }: { x: number; y: number; w: number; h: number; c: string; className?: string; style?: React.CSSProperties; rx?: number; opacity?: number }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} className={className} style={style} rx={rx} opacity={opacity} />
);

// ───────── 배경 ─────────
export function Wall({ color, trim, floor, floorLine, grid }: { color: string; trim: string; floor: string; floorLine: string; grid?: string }) {
  return (
    <g>
      <R x={0} y={0} w={320} h={132} c={color} />
      {grid && (
        <g opacity={0.5}>
          {Array.from({ length: 10 }).map((_, i) => <R key={`v${i}`} x={i * 34} y={0} w={1} h={132} c={grid} />)}
          {Array.from({ length: 5 }).map((_, i) => <R key={`h${i}`} x={0} y={i * 30} w={320} h={1} c={grid} />)}
        </g>
      )}
      <R x={0} y={128} w={320} h={6} c={trim} />
      <R x={0} y={134} w={320} h={66} c={floor} />
      {Array.from({ length: 6 }).map((_, i) => <R key={i} x={0} y={146 + i * 11} w={320} h={1} c={floorLine} />)}
      {Array.from({ length: 9 }).map((_, i) => <R key={`p${i}`} x={i * 40 + (i % 2) * 20} y={134} w={1} h={66} c={floorLine} />)}
    </g>
  );
}

export function Window({ x, y, w, h, night = true, city }: { x: number; y: number; w: number; h: number; night?: boolean; city?: boolean }) {
  return (
    <g>
      <R x={x - 3} y={y - 3} w={w + 6} h={h + 6} c="#ffffff" />
      <R x={x} y={y} w={w} h={h} c={night ? '#1b2547' : '#bfe0ff'} />
      {night && (
        <g>
          {[[8, 8], [22, 16], [38, 6], [50, 20], [14, 30], [44, 34], [30, 26]].map(([sx, sy], i) => (
            <R key={i} x={x + (sx % w)} y={y + (sy % h)} w={2} h={2} c="#fff6c8" className="star-anim" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
          <circle cx={x + w - 14} cy={y + 12} r={6} fill="#fff1b0" />
          <circle cx={x + w - 11} cy={y + 10} r={5} fill={night ? '#1b2547' : '#bfe0ff'} />
        </g>
      )}
      {city && (
        <g>
          {[0, 10, 22, 30, 44, 56, 66, 80, 92, 104].map((bx, i) => {
            const bh = 10 + ((i * 7) % 18);
            return (
              <g key={i}>
                <R x={x + bx} y={y + h - bh} w={8 + (i % 3) * 2} h={bh} c={i % 2 ? '#3a4a78' : '#2c3a63'} />
                <R x={x + bx + 2} y={y + h - bh + 3} w={2} h={2} c="#ffe08a" className="anim-blink-2" style={{ animationDelay: `${i * 0.3}s` }} />
                <R x={x + bx + 5} y={y + h - bh + 7} w={2} h={2} c="#ffe08a" />
              </g>
            );
          })}
        </g>
      )}
      <R x={x + w / 2 - 1} y={y} w={2} h={h} c="#ffffff" />
      <R x={x} y={y + h / 2 - 1} w={w} h={2} c="#ffffff" />
    </g>
  );
}

export function Poster({ x, y, w, h, bg, children }: { x: number; y: number; w: number; h: number; bg: string; children?: ReactNode }) {
  return (
    <g>
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#ffffff" />
      <R x={x} y={y} w={w} h={h} c={bg} />
      {children}
    </g>
  );
}

// ───────── 가구 ─────────
export function Desk({ x, w, color = '#8b5a2b', top = '#a86f3a', legs = '#6e4520', y = 118 }: { x: number; w: number; color?: string; top?: string; legs?: string; y?: number }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={4} c={top} />
      <R x={x} y={y + 4} w={w} h={5} c={color} />
      <R x={x + 3} y={y + 9} w={5} h={40} c={legs} />
      <R x={x + w - 8} y={y + 9} w={5} h={40} c={legs} />
    </g>
  );
}

export function Keyboard({ x, y, w = 34, rgb }: { x: number; y: number; w?: number; rgb?: boolean }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={5} c="#2b2f3f" />
      <R x={x + 2} y={y + 1} w={w - 4} h={3} c={rgb ? '#3b6cff' : '#5b607a'} className={rgb ? 'anim-blink-2' : ''} />
    </g>
  );
}

export function Hands({ x, y, typing }: { x: number; y: number; typing: boolean }) {
  return (
    <g className={typing ? 'hand-anim' : ''}>
      <R x={x} y={y} w={7} h={4} c="#f7d3b1" />
      <R x={x + 16} y={y} w={7} h={4} c="#f7d3b1" className={typing ? 'hand-anim' : ''} style={{ animationDelay: '0.12s' }} />
    </g>
  );
}

const CODE_COLORS = ['#7cc2ff', '#c792ea', '#ffd166', '#89ddff', '#22c55e', '#ff7a59'];

export function Monitor({ x, y, w, h, bezel = '#1f2233', active, idleColor = '#111827', thin, stand = true, ultrawide }: { x: number; y: number; w: number; h: number; bezel?: string; active: boolean; idleColor?: string; thin?: boolean; stand?: boolean; ultrawide?: boolean }) {
  const b = thin ? 2 : 4;
  const sx = x + b;
  const sy = y + b;
  const sw = w - b * 2;
  const sh = h - b * 2;
  const lines = Math.max(3, Math.floor(sh / 5));
  return (
    <g>
      {stand && (
        <g>
          <R x={x + w / 2 - 3} y={y + h} w={6} h={5} c={bezel} />
          <R x={x + w / 2 - 12} y={y + h + 5} w={24} h={2} c={bezel} />
        </g>
      )}
      <R x={x} y={y} w={w} h={h} c={bezel} />
      <R x={sx} y={sy} w={sw} h={sh} c={active ? '#0f1729' : idleColor} />
      {active ? (
        <g>
          {Array.from({ length: lines }).map((_, i) => {
            const indent = (i % 3) * 4;
            const lw = Math.max(6, ((sw - indent - 4) * (0.35 + ((i * 37) % 60) / 100)));
            return (
              <R
                key={i}
                x={sx + 2 + indent}
                y={sy + 2 + i * 5}
                w={lw}
                h={2}
                c={CODE_COLORS[i % CODE_COLORS.length]}
                className="code-line"
                style={{ animationDelay: `${(i * 0.22) % 2.6}s` }}
              />
            );
          })}
          <R x={sx + sw - 6} y={sy + sh - 4} w={3} h={2} c="#ffffff" className="anim-blink" />
        </g>
      ) : (
        <g>
          {ultrawide ? (
            <g>
              {Array.from({ length: 8 }).map((_, i) => (
                <R key={i} x={sx + 6 + i * ((sw - 12) / 8)} y={sy + sh - 6 - 4 * (1 + (i % 4))} w={(sw - 12) / 8 - 3} h={4 * (1 + (i % 4))} c={['#3b6cff', '#7c5cff', '#22c55e', '#ff7a59'][i % 4]} className="bar-anim" style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </g>
          ) : (
            <g>
              <R x={sx + sw / 2 - 5} y={sy + sh / 2 - 3} w={10} h={2} c="#3b6cff" opacity={0.9} />
              <R x={sx + sw / 2 - 3} y={sy + sh / 2 + 1} w={6} h={2} c="#7c5cff" opacity={0.7} />
              <R x={sx + 3} y={sy + sh - 4} w={3} h={2} c="#ffffff" className="anim-blink" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

export function PcTower({ x, y, w = 14, h = 30, color = '#d8d0bd', rgb }: { x: number; y: number; w?: number; h?: number; color?: string; rgb?: boolean }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={h} c={color} />
      <R x={x + 3} y={y + 4} w={w - 6} h={2} c={rgb ? '#3b6cff' : '#8a8578'} />
      <R x={x + 3} y={y + 8} w={w - 6} h={2} c={rgb ? '#7c5cff' : '#8a8578'} />
      <R x={x + w - 5} y={y + h - 6} w={2} h={2} c={rgb ? '#22c55e' : '#7fbf7f'} className="anim-blink" />
      {rgb && <R x={x + 2} y={y + 14} w={w - 4} h={h - 18} c="#1b2140" />}
      {rgb && <R x={x + 4} y={y + 16} w={w - 8} h={h - 22} c="#3b6cff" opacity={0.5} className="anim-pulse-glow svg-anim" />}
    </g>
  );
}

export function Cup({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y} w={7} h={8} c="#ffffff" />
      <R x={x + 7} y={y + 2} w={2} h={4} c="#ffffff" />
      <R x={x + 1} y={y + 1} w={5} h={2} c="#6b4a2b" />
      <R x={x + 2} y={y - 4} w={1} h={3} c="#cfd4e0" className="anim-drift" />
      <R x={x + 4} y={y - 5} w={1} h={3} c="#cfd4e0" className="anim-drift" style={{ animationDelay: '0.7s' }} />
    </g>
  );
}

export function Books({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y + 6} w={16} h={3} c="#3b6cff" />
      <R x={x + 1} y={y + 3} w={14} h={3} c="#ff7a59" />
      <R x={x + 2} y={y} w={12} h={3} c="#22c55e" />
    </g>
  );
}

export function Lamp({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      <R x={x + 4} y={y + 6} w={2} h={14} c="#5b607a" />
      <R x={x + 1} y={y + 19} w={8} h={2} c="#5b607a" />
      <R x={x} y={y} w={10} h={6} c="#ffd166" />
      {on && <R x={x - 2} y={y + 6} w={14} h={5} c="#fff1b0" opacity={0.35} />}
    </g>
  );
}

export function Plant({ x, y, big }: { x: number; y: number; big?: boolean }) {
  const s = big ? 1.6 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <R x={3} y={14} w={10} h={8} c="#c9805a" />
      <R x={2} y={12} w={12} h={2} c="#a86842" />
      <R x={6} y={2} w={4} h={11} c="#2f9e57" />
      <R x={1} y={5} w={5} h={4} c="#3cb56a" />
      <R x={10} y={4} w={5} h={4} c="#3cb56a" />
      <R x={4} y={0} w={8} h={3} c="#46c97a" />
    </g>
  );
}

export function Bed({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y + 6} w={86} h={26} c="#8b5a2b" />
      <R x={x + 2} y={y + 2} w={82} h={12} c="#efe9dd" />
      <R x={x + 2} y={y + 12} w={82} h={12} c="#6f9ee6" />
      <R x={x + 6} y={y + 4} w={18} h={7} c="#ffffff" />
      <R x={x - 2} y={y - 6} w={6} h={40} c="#6e4520" />
      <R x={x + 84} y={y - 2} w={6} h={36} c="#6e4520" />
    </g>
  );
}

export function Shelf({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={3} c="#5b607a" />
      <R x={x + 4} y={y - 9} w={8} h={9} c="#ff7a59" />
      <R x={x + 14} y={y - 6} w={6} h={6} c="#22c55e" />
      <R x={x + 24} y={y - 11} w={5} h={11} c="#3b6cff" />
      <R x={x + 31} y={y - 11} w={5} h={11} c="#7c5cff" />
      <R x={x + w - 14} y={y - 8} w={10} h={8} c="#e8eaf2" />
      <R x={x + w - 12} y={y - 6} w={6} h={4} c="#1f2233" />
    </g>
  );
}

export function ServerRack({ x, y, w = 30, h = 60, color = '#2a2f45', lights = 6, accent = '#22c55e' }: { x: number; y: number; w?: number; h?: number; color?: string; lights?: number; accent?: string }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={h} c={color} />
      <R x={x + 2} y={y + 2} w={w - 4} h={h - 4} c="#1a1e30" />
      {Array.from({ length: lights }).map((_, i) => (
        <g key={i}>
          <R x={x + 4} y={y + 5 + i * ((h - 10) / lights)} w={w - 8} h={(h - 10) / lights - 2} c="#242a42" />
          <R x={x + 6} y={y + 7 + i * ((h - 10) / lights)} w={2} h={2} c={accent} className="anim-blink" style={{ animationDelay: `${(i * 0.37) % 1.1}s` }} />
          <R x={x + 9} y={y + 7 + i * ((h - 10) / lights)} w={2} h={2} c="#3b6cff" className="anim-blink-2" style={{ animationDelay: `${(i * 0.53) % 1.7}s` }} />
          <R x={x + 13} y={y + 7 + i * ((h - 10) / lights)} w={w - 19} h={1} c="#3a4160" />
        </g>
      ))}
    </g>
  );
}

export function Hologram({ x, y, color = '#7cc2ff' }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <R x={x - 10} y={y + 26} w={20} h={3} c="#2f3a6b" />
      <R x={x - 6} y={y + 24} w={12} h={2} c={color} opacity={0.8} className="anim-blink-2" />
      <polygon points={`${x - 9},${y + 24} ${x + 9},${y + 24} ${x + 4},${y + 2} ${x - 4},${y + 2}`} fill={color} opacity={0.14} />
      <g className="holo-anim">
        <R x={x - 6} y={y + 2} w={12} h={12} c={color} opacity={0.35} />
        <R x={x - 6} y={y + 2} w={12} h={2} c={color} />
        <R x={x - 6} y={y + 12} w={12} h={2} c={color} />
        <R x={x - 6} y={y + 2} w={2} h={12} c={color} />
        <R x={x + 4} y={y + 2} w={2} h={12} c={color} />
        <R x={x - 2} y={y + 6} w={4} h={4} c="#ffffff" />
      </g>
      {[0, 1, 2].map((i) => (
        <R key={i} x={x - 12 + i * 10} y={y - 2 - (i % 2) * 4} w={2} h={2} c={color} className="anim-sparkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

export function WallScreen({ x, y, w, h, bars = 6, colors = ['#3b6cff', '#7c5cff', '#22c55e', '#ff7a59'] }: { x: number; y: number; w: number; h: number; bars?: number; colors?: string[] }) {
  const bw = (w - 8) / bars;
  return (
    <g>
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#0d1020" />
      <R x={x} y={y} w={w} h={h} c="#141a33" />
      {Array.from({ length: bars }).map((_, i) => {
        const bh = 6 + ((i * 11) % (h - 10));
        return <R key={i} x={x + 4 + i * bw} y={y + h - 3 - bh} w={bw - 2} h={bh} c={colors[i % colors.length]} className="bar-anim" style={{ animationDelay: `${i * 0.3}s` }} />;
      })}
      <R x={x + 4} y={y + 3} w={w * 0.4} h={2} c="#ffffff" opacity={0.7} />
    </g>
  );
}

export function ProjectBoard({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const notes = ['#ffd166', '#ff7a59', '#7cc2ff', '#22c55e', '#c792ea', '#ffd166', '#7cc2ff', '#ff7a59', '#22c55e'];
  const cols = 3;
  const cw = (w - 8) / cols;
  return (
    <g>
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#c9cfdd" />
      <R x={x} y={y} w={w} h={h} c="#ffffff" />
      {Array.from({ length: cols }).map((_, c) => (
        <R key={c} x={x + 4 + c * cw} y={y + 3} w={cw - 4} h={2} c="#141a2e" opacity={0.6} />
      ))}
      {notes.map((n, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return <R key={i} x={x + 5 + c * cw + (i % 2)} y={y + 8 + r * 9} w={cw - 7} h={7} c={n} />;
      })}
    </g>
  );
}

export function Teammate({ x, y, index, typing }: { x: number; y: number; index: number; typing: boolean }) {
  const [hair, shirt] = TEAMMATE_STYLES[index % TEAMMATE_STYLES.length];
  return (
    <g className={typing ? 'anim-typing svg-bottom' : 'anim-bob svg-bottom'} style={{ animationDelay: `${index * 0.35}s` }}>
      <PixelSprite inline rows={TEAMMATE_ROWS} palette={teammatePalette(hair, shirt)} scale={2} x={x} y={y} />
    </g>
  );
}

export function SmallDesk({ x, y, w, active, dark }: { x: number; y: number; w: number; active: boolean; dark?: boolean }) {
  return (
    <g>
      <Monitor x={x + w / 2 - 12} y={y - 22} w={24} h={16} active={active} thin bezel={dark ? '#0d1020' : '#1f2233'} />
      <Desk x={x} w={w} y={y} color={dark ? '#2a2f45' : '#e6e9f2'} top={dark ? '#3a4160' : '#f6f7fb'} legs={dark ? '#1a1e30' : '#c9cfdd'} />
    </g>
  );
}

export function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y} w={16} h={22} c="#2b2f3f" />
      <R x={x + 3} y={y + 3} w={10} h={5} c="#ff7a59" />
      <R x={x + 5} y={y + 10} w={6} h={6} c="#ffffff" />
      <R x={x + 6} y={y + 16} w={4} h={2} c="#6b4a2b" />
    </g>
  );
}

export function AiCore({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={30} fill={color} opacity={0.08} className="core-anim" />
      <circle cx={x} cy={y} r={20} fill={color} opacity={0.18} className="core-anim" style={{ animationDelay: '0.4s' }} />
      <g className="anim-spin-slow svg-anim">
        <circle cx={x} cy={y} r={24} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.7} />
      </g>
      <g className="anim-spin-slow svg-anim" style={{ animationDirection: 'reverse', animationDuration: '12s' }}>
        <circle cx={x} cy={y} r={16} fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="3 5" opacity={0.6} />
      </g>
      <g className="core-anim">
        <R x={x - 6} y={y - 6} w={12} h={12} c={color} />
        <R x={x - 3} y={y - 3} w={6} h={6} c="#ffffff" />
      </g>
      <R x={x - 2} y={y + 28} w={4} h={40} c="#1a2140" />
      <R x={x - 12} y={y + 66} w={24} h={4} c="#2a3260" />
    </g>
  );
}

export function PixelText({ x, y, text, color, scale = 1 }: { x: number; y: number; text: string; color: string; scale?: number }) {
  return (
    <text x={x} y={y} fill={color} fontFamily="Silkscreen, monospace" fontSize={8 * scale} fontWeight={700} textAnchor="middle" letterSpacing={1}>
      {text}
    </text>
  );
}

export function LedStrip({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={2} c={color} className="anim-blink-2" />
      <R x={x} y={y + 2} w={w} h={6} c={color} opacity={0.18} />
    </g>
  );
}

export function CeilingLight({ x, w, color = '#ffffff' }: { x: number; w: number; color?: string }) {
  return (
    <g>
      <R x={x} y={0} w={w} h={3} c={color} opacity={0.9} />
      <polygon points={`${x},3 ${x + w},3 ${x + w + 14},40 ${x - 14},40`} fill={color} opacity={0.06} />
    </g>
  );
}
