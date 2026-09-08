/** 공간 씬을 구성하는 SVG 픽셀 파츠 (viewBox 320 x 200 기준) */
import type { ReactNode } from 'react';
import { PixelSprite } from './PixelSprite';
import { TEAMMATE_ROWS, TEAMMATE_STYLES, teammatePalette } from './zunSprite';

const R = ({ x, y, w, h, c, className, style, rx, opacity }: { x: number; y: number; w: number; h: number; c: string; className?: string; style?: React.CSSProperties; rx?: number; opacity?: number }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} className={className} style={style} rx={rx} opacity={opacity} />
);

export interface SceneTheme {
  wallTop: string;
  wallBottom: string;
  trim: string;
  trimLight: string;
  floorFar: string;
  floorNear: string;
  floorLine: string;
  grid?: string;
  ambient: string;
  ambientOpacity: number;
}

/** 스테이지별 색/조명 테마 */
export const SCENE_THEMES: Record<number, SceneTheme> = {
  1: { wallTop: '#f3e3c6', wallBottom: '#e3cda8', trim: '#b8956b', trimLight: '#d8bd93', floorFar: '#b8834f', floorNear: '#8f5f34', floorLine: '#7d5029', ambient: '#ffcf8a', ambientOpacity: 0.16 },
  2: { wallTop: '#e8edf7', wallBottom: '#ccd5e6', trim: '#9aa6c0', trimLight: '#c3cddf', floorFar: '#4a5170', floorNear: '#2f3450', floorLine: '#252a44', ambient: '#7fa8ff', ambientOpacity: 0.14 },
  3: { wallTop: '#1e2450', wallBottom: '#121736', trim: '#2c3670', trimLight: '#3c4a92', floorFar: '#181e42', floorNear: '#0c1026', floorLine: '#212a58', grid: '#2a3468', ambient: '#6ea8ff', ambientOpacity: 0.2 },
  4: { wallTop: '#f6f8fc', wallBottom: '#dfe5f1', trim: '#c3cbdd', trimLight: '#eef1f8', floorFar: '#d7dde9', floorNear: '#b6bfd2', floorLine: '#a3adc4', ambient: '#ffe6b8', ambientOpacity: 0.14 },
  5: { wallTop: '#111739', wallBottom: '#080c1e', trim: '#1b2450', trimLight: '#2b3878', floorFar: '#101637', floorNear: '#060a1a', floorLine: '#1a2350', grid: '#18204a', ambient: '#5ee0ff', ambientOpacity: 0.18 },
};

/** 씬 전체가 공유하는 그라디언트/필터 정의 */
export function SceneDefs({ uid, theme, accent }: { uid: string; theme: SceneTheme; accent: string }) {
  return (
    <defs>
      <linearGradient id={`zw${uid}`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor={theme.wallTop} />
        <stop offset="100%" stopColor={theme.wallBottom} />
      </linearGradient>
      <linearGradient id={`zf${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.floorFar} />
        <stop offset="100%" stopColor={theme.floorNear} />
      </linearGradient>
      <radialGradient id={`za${uid}`} cx="0.5" cy="0.45" r="0.62">
        <stop offset="0%" stopColor={theme.ambient} stopOpacity={theme.ambientOpacity} />
        <stop offset="100%" stopColor={theme.ambient} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`zv${uid}`} cx="0.5" cy="0.5" r="0.75">
        <stop offset="62%" stopColor="#000000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000814" stopOpacity="0.34" />
      </radialGradient>
      <radialGradient id={`zg${uid}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
        <stop offset="100%" stopColor={accent} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`zs${uid}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#6fb4ff" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#6fb4ff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** 바닥 접지 그림자 */
export function Shadow({ x, y, rx, ry = 3, opacity = 0.3 }: { x: number; y: number; rx: number; ry?: number; opacity?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000814" opacity={opacity} />;
}

/** 화면 앞의 은은한 발광 */
export function Glow({ x, y, r, uid }: { x: number; y: number; r: number; uid: string }) {
  return <circle cx={x} cy={y} r={r} fill={`url(#zg${uid})`} className="core-anim svg-anim" style={{ pointerEvents: 'none' }} />;
}

export function Vignette({ uid }: { uid: string }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={0} y={0} width={320} height={200} fill={`url(#za${uid})`} />
      <rect x={0} y={0} width={320} height={200} fill={`url(#zv${uid})`} />
    </g>
  );
}

// ───────── 배경 ─────────
export function Wall({ uid, theme }: { uid: string; theme: SceneTheme }) {
  return (
    <g>
      <rect x={0} y={0} width={320} height={132} fill={`url(#zw${uid})`} />
      {theme.grid && (
        <g opacity={0.55}>
          {Array.from({ length: 11 }).map((_, i) => <R key={`v${i}`} x={i * 32} y={0} w={1} h={132} c={theme.grid!} />)}
          {Array.from({ length: 5 }).map((_, i) => <R key={`h${i}`} x={0} y={i * 30 + 6} w={320} h={1} c={theme.grid!} />)}
        </g>
      )}
      {/* 벽 아래쪽 그림자 */}
      <R x={0} y={110} w={320} h={18} c="#000814" opacity={0.1} />
      {/* 걸레받이 */}
      <R x={0} y={126} w={320} h={2} c={theme.trimLight} />
      <R x={0} y={128} w={320} h={6} c={theme.trim} />
      {/* 바닥 */}
      <rect x={0} y={134} width={320} height={66} fill={`url(#zf${uid})`} />
      {Array.from({ length: 6 }).map((_, i) => <R key={i} x={0} y={146 + i * 11} w={320} h={1} c={theme.floorLine} opacity={0.6} />)}
      {Array.from({ length: 9 }).map((_, i) => <R key={`p${i}`} x={i * 40 + (i % 2) * 20} y={134} w={1} h={66} c={theme.floorLine} opacity={0.45} />)}
      {/* 벽-바닥 접지선 */}
      <R x={0} y={134} w={320} h={3} c="#000814" opacity={0.22} />
    </g>
  );
}

export function Window({ x, y, w, h, night = true, city }: { x: number; y: number; w: number; h: number; night?: boolean; city?: boolean }) {
  return (
    <g>
      <R x={x - 4} y={y - 4} w={w + 8} h={h + 8} c="#0a0d1a" />
      <R x={x - 3} y={y - 3} w={w + 6} h={h + 6} c="#f4f6fb" />
      <R x={x - 3} y={y + h} w={w + 6} h={3} c="#c9d1e2" />
      <R x={x} y={y} w={w} h={h} c={night ? '#131b3c' : '#a9d4ff'} />
      {night && (
        <>
          <R x={x} y={y} w={w} h={Math.round(h * 0.55)} c="#1b2452" />
          {[[8, 8], [22, 16], [38, 6], [50, 20], [14, 30], [44, 34], [30, 26], [60, 12]].map(([sx, sy], i) => (
            <R key={i} x={x + (sx % w)} y={y + (sy % h)} w={2} h={2} c="#fff6c8" className="star-anim" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
          <circle cx={x + w - 14} cy={y + 12} r={6} fill="#fff1b0" />
          <circle cx={x + w - 11} cy={y + 10} r={5} fill="#1b2452" />
        </>
      )}
      {city && (
        <g>
          {[0, 10, 22, 30, 44, 56, 66, 80, 92, 104, 118, 130].map((bx, i) => {
            if (bx > w - 6) return null;
            const bh = 10 + ((i * 7) % 20);
            return (
              <g key={i}>
                <R x={x + bx} y={y + h - bh} w={Math.min(8 + (i % 3) * 2, w - bx)} h={bh} c={i % 2 ? '#39497a' : '#2a3765'} />
                <R x={x + bx + 2} y={y + h - bh + 3} w={2} h={2} c="#ffe08a" className="anim-blink-2" style={{ animationDelay: `${i * 0.3}s` }} />
                <R x={x + bx + 5} y={y + h - bh + 8} w={2} h={2} c="#ffe08a" opacity={0.7} />
              </g>
            );
          })}
        </g>
      )}
      {/* 창틀 + 유리 반사 */}
      <R x={x + w / 2 - 1} y={y} w={2} h={h} c="#f4f6fb" />
      <R x={x} y={y + h / 2 - 1} w={w} h={2} c="#f4f6fb" />
      <polygon points={`${x},${y} ${x + w * 0.36},${y} ${x},${y + h * 0.55}`} fill="#ffffff" opacity={0.07} />
    </g>
  );
}

export function Poster({ x, y, w, h, bg, children }: { x: number; y: number; w: number; h: number; bg: string; children?: ReactNode }) {
  return (
    <g>
      <R x={x - 1} y={y - 1} w={w + 4} h={h + 4} c="#000814" opacity={0.25} />
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#f4f6fb" />
      <R x={x} y={y} w={w} h={h} c={bg} />
      {children}
    </g>
  );
}

// ───────── 가구 ─────────
export function Desk({ x, w, color = '#7a4d24', top = '#a8703a', legs = '#5c3a1a', y = 118 }: { x: number; w: number; color?: string; top?: string; legs?: string; y?: number }) {
  return (
    <g>
      {/* 상판 하이라이트 → 상판 → 앞면 그림자 */}
      <R x={x} y={y} w={w} h={2} c={top} />
      <R x={x} y={y + 2} w={w} h={3} c={color} />
      <R x={x} y={y + 5} w={w} h={4} c="#000814" opacity={0.22} />
      <R x={x} y={y + 5} w={w} h={4} c={color} opacity={0.85} />
      <R x={x + 3} y={y + 9} w={5} h={42} c={legs} />
      <R x={x + w - 8} y={y + 9} w={5} h={42} c={legs} />
      <R x={x + 3} y={y + 9} w={2} h={42} c={color} opacity={0.5} />
      <Shadow x={x + w / 2} y={y + 52} rx={w * 0.4} ry={2.5} opacity={0.14} />
    </g>
  );
}

export function Keyboard({ x, y, w = 34, rgb }: { x: number; y: number; w?: number; rgb?: boolean }) {
  return (
    <g>
      <R x={x} y={y} w={w} h={2} c="#3c4258" />
      <R x={x} y={y + 2} w={w} h={4} c="#22273a" />
      <R x={x + 2} y={y + 2} w={w - 4} h={2} c={rgb ? '#4f8dff' : '#5b607a'} className={rgb ? 'anim-blink-2' : ''} />
      {rgb && <R x={x - 1} y={y + 6} w={w + 2} h={2} c="#4f8dff" opacity={0.3} />}
    </g>
  );
}

export function Hands({ x, y, typing }: { x: number; y: number; typing: boolean }) {
  return (
    <g>
      <g className={typing ? 'hand-anim' : ''}>
        <R x={x} y={y} w={7} h={4} c="#fbdcbb" />
        <R x={x} y={y} w={7} h={2} c="#fff1de" />
        <R x={x} y={y + 4} w={7} h={1} c="#151a2b" opacity={0.55} />
      </g>
      <g className={typing ? 'hand-anim' : ''} style={{ animationDelay: '0.12s' }}>
        <R x={x + 13} y={y} w={7} h={4} c="#fbdcbb" />
        <R x={x + 13} y={y} w={7} h={2} c="#fff1de" />
        <R x={x + 13} y={y + 4} w={7} h={1} c="#151a2b" opacity={0.55} />
      </g>
    </g>
  );
}

const CODE_COLORS = ['#7cc2ff', '#c792ea', '#ffd166', '#89ddff', '#5ee596', '#ff9d7a'];

export function Monitor({ x, y, w, h, bezel = '#171b2c', active, idleColor = '#0d1424', thin, stand = true, ultrawide, uid }: { x: number; y: number; w: number; h: number; bezel?: string; active: boolean; idleColor?: string; thin?: boolean; stand?: boolean; ultrawide?: boolean; uid: string }) {
  const b = thin ? 2 : 3;
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
          <R x={x + w / 2 - 13} y={y + h + 5} w={26} h={2} c={bezel} />
          <R x={x + w / 2 - 13} y={y + h + 7} w={26} h={1} c="#000814" opacity={0.4} />
        </g>
      )}
      <R x={x - 1} y={y - 1} w={w + 2} h={h + 2} c="#0a0d1a" />
      <R x={x} y={y} w={w} h={h} c={bezel} />
      <R x={x} y={y} w={w} h={1} c="#ffffff" opacity={0.16} />
      <R x={sx} y={sy} w={sw} h={sh} c={active ? '#0b1226' : idleColor} />
      {active ? (
        <>
          {Array.from({ length: lines }).map((_, i) => {
            const indent = (i % 3) * 4;
            const lw = Math.max(6, (sw - indent - 4) * (0.35 + ((i * 37) % 60) / 100));
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
        </>
      ) : ultrawide ? (
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <R key={i} x={sx + 6 + i * ((sw - 12) / 8)} y={sy + sh - 6 - 4 * (1 + (i % 4))} w={(sw - 12) / 8 - 3} h={4 * (1 + (i % 4))} c={['#4f8dff', '#8b6cff', '#5ee596', '#ff9d7a'][i % 4]} className="bar-anim" style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </g>
      ) : (
        <g>
          <R x={sx + sw / 2 - 5} y={sy + sh / 2 - 3} w={10} h={2} c="#4f8dff" opacity={0.9} />
          <R x={sx + sw / 2 - 3} y={sy + sh / 2 + 1} w={6} h={2} c="#8b6cff" opacity={0.7} />
          <R x={sx + 3} y={sy + sh - 4} w={3} h={2} c="#ffffff" className="anim-blink" />
        </g>
      )}
      {/* 화면 반사 + 앞으로 새는 빛 */}
      <polygon points={`${sx},${sy} ${sx + sw * 0.42},${sy} ${sx},${sy + sh * 0.6}`} fill="#ffffff" opacity={0.06} />
      <rect x={x - 8} y={y - 6} width={w + 16} height={h + 14} fill={`url(#zs${uid})`} opacity={active ? 1 : 0.55} style={{ pointerEvents: 'none' }} />
    </g>
  );
}

export function PcTower({ x, y, w = 14, h = 30, color = '#cfc7b2', rgb }: { x: number; y: number; w?: number; h?: number; color?: string; rgb?: boolean }) {
  return (
    <g>
      <R x={x - 1} y={y - 1} w={w + 2} h={h + 2} c="#0a0d1a" />
      <R x={x} y={y} w={w} h={h} c={color} />
      <R x={x} y={y} w={2} h={h} c="#ffffff" opacity={0.14} />
      <R x={x + 3} y={y + 4} w={w - 6} h={2} c={rgb ? '#4f8dff' : '#8a8578'} />
      <R x={x + 3} y={y + 8} w={w - 6} h={2} c={rgb ? '#8b6cff' : '#8a8578'} />
      <R x={x + w - 5} y={y + h - 6} w={2} h={2} c={rgb ? '#5ee596' : '#7fbf7f'} className="anim-blink" />
      {rgb && (
        <>
          <R x={x + 2} y={y + 14} w={w - 4} h={h - 20} c="#0d1226" />
          <R x={x + 4} y={y + 16} w={w - 8} h={h - 24} c="#4f8dff" opacity={0.55} className="anim-pulse-glow svg-anim" />
        </>
      )}
    </g>
  );
}

export function Cup({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y} w={8} h={9} c="#f4f6fb" />
      <R x={x} y={y} w={2} h={9} c="#ffffff" />
      <R x={x + 6} y={y} w={2} h={9} c="#c9d1e2" />
      <R x={x + 8} y={y + 2} w={2} h={4} c="#f4f6fb" />
      <R x={x + 1} y={y + 1} w={6} h={2} c="#5c3a1a" />
      <R x={x + 2} y={y - 5} w={1} h={4} c="#cfd4e0" className="anim-drift" />
      <R x={x + 5} y={y - 6} w={1} h={4} c="#cfd4e0" className="anim-drift" style={{ animationDelay: '0.7s' }} />
    </g>
  );
}

export function Books({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x} y={y + 6} w={18} h={4} c="#3b6cff" />
      <R x={x} y={y + 6} w={18} h={1} c="#7ba4ff" />
      <R x={x + 1} y={y + 3} w={16} h={3} c="#ff7a59" />
      <R x={x + 1} y={y + 3} w={16} h={1} c="#ffa48c" />
      <R x={x + 2} y={y} w={14} h={3} c="#22c55e" />
      <R x={x + 2} y={y} w={14} h={1} c="#5ee596" />
    </g>
  );
}

export function Lamp({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g>
      {on && <polygon points={`${x - 1},${y + 6} ${x + 11},${y + 6} ${x + 17},${y + 26} ${x - 7},${y + 26}`} fill="#ffe6a8" opacity={0.1} />}
      <R x={x + 4} y={y + 6} w={2} h={11} c="#4a5068" />
      <R x={x + 1} y={y + 16} w={8} h={2} c="#4a5068" />
      <R x={x - 1} y={y - 1} w={12} h={8} c="#0a0d1a" />
      <R x={x} y={y} w={10} h={6} c="#f5b733" />
      <R x={x} y={y} w={10} h={2} c="#ffd88a" />
      {on && <R x={x + 1} y={y + 6} w={8} h={2} c="#fff1b0" />}
    </g>
  );
}

export function Plant({ x, y, big }: { x: number; y: number; big?: boolean }) {
  const s = big ? 1.6 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <R x={2} y={11} w={13} h={2} c="#8f5636" />
      <R x={3} y={13} w={11} h={9} c="#c47b52" />
      <R x={3} y={13} w={3} h={9} c="#d9926a" />
      <R x={6} y={2} w={4} h={11} c="#2f9e57" />
      <R x={1} y={5} w={5} h={4} c="#3cb56a" />
      <R x={10} y={4} w={5} h={4} c="#3cb56a" />
      <R x={4} y={0} w={8} h={3} c="#4bd183" />
      <R x={4} y={0} w={8} h={1} c="#6ee59d" />
    </g>
  );
}

export function Bed({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x + 44} y={y + 34} rx={46} ry={4} opacity={0.22} />
      <R x={x} y={y + 6} w={88} h={28} c="#7a4d24" />
      <R x={x} y={y + 6} w={88} h={2} c="#a8703a" />
      <R x={x + 2} y={y + 2} w={84} h={12} c="#f0ead9" />
      <R x={x + 2} y={y + 2} w={84} h={2} c="#fdfaf2" />
      <R x={x + 2} y={y + 12} w={84} h={13} c="#6a99e4" />
      <R x={x + 2} y={y + 12} w={84} h={2} c="#8db4f0" />
      <R x={x + 6} y={y + 4} w={20} h={8} c="#ffffff" />
      <R x={x - 2} y={y - 8} w={7} h={42} c="#5c3a1a" />
      <R x={x - 2} y={y - 8} w={2} h={42} c="#7a4d24" />
      <R x={x + 85} y={y - 3} w={7} h={37} c="#5c3a1a" />
    </g>
  );
}

export function Shelf({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <R x={x} y={y + 3} w={w} h={2} c="#000814" opacity={0.3} />
      <R x={x} y={y} w={w} h={3} c="#5f677f" />
      <R x={x} y={y} w={w} h={1} c="#8a92a8" />
      <R x={x + 4} y={y - 10} w={8} h={10} c="#ff7a59" />
      <R x={x + 4} y={y - 10} w={2} h={10} c="#ffa48c" />
      <R x={x + 14} y={y - 7} w={6} h={7} c="#22c55e" />
      <R x={x + 24} y={y - 12} w={5} h={12} c="#3b6cff" />
      <R x={x + 31} y={y - 12} w={5} h={12} c="#8b6cff" />
      <R x={x + w - 16} y={y - 9} w={12} h={9} c="#e2e6f0" />
      <R x={x + w - 14} y={y - 7} w={8} h={5} c="#171b2c" />
    </g>
  );
}

export function ServerRack({ x, y, w = 30, h = 60, color = '#232a45', lights = 6, accent = '#22c55e' }: { x: number; y: number; w?: number; h?: number; color?: string; lights?: number; accent?: string }) {
  const unit = (h - 10) / lights;
  return (
    <g>
      <R x={x - 1} y={y - 1} w={w + 2} h={h + 2} c="#0a0d1a" />
      <R x={x} y={y} w={w} h={h} c={color} />
      <R x={x} y={y} w={2} h={h} c="#ffffff" opacity={0.1} />
      <R x={x + 2} y={y + 2} w={w - 4} h={h - 4} c="#12172c" />
      {Array.from({ length: lights }).map((_, i) => (
        <g key={i}>
          <R x={x + 4} y={y + 5 + i * unit} w={w - 8} h={unit - 2} c="#1e2440" />
          <R x={x + 4} y={y + 5 + i * unit} w={w - 8} h={1} c="#2c3456" />
          <R x={x + 6} y={y + 7 + i * unit} w={2} h={2} c={accent} className="anim-blink" style={{ animationDelay: `${(i * 0.37) % 1.1}s` }} />
          <R x={x + 9} y={y + 7 + i * unit} w={2} h={2} c="#4f8dff" className="anim-blink-2" style={{ animationDelay: `${(i * 0.53) % 1.7}s` }} />
          <R x={x + 13} y={y + 7 + i * unit} w={w - 19} h={1} c="#39426a" />
        </g>
      ))}
    </g>
  );
}

export function Hologram({ x, y, color = '#7cc2ff' }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <R x={x - 11} y={y + 26} w={22} h={4} c="#0a0d1a" />
      <R x={x - 10} y={y + 26} w={20} h={2} c="#2f3a6b" />
      <R x={x - 6} y={y + 24} w={12} h={2} c={color} className="anim-blink-2" />
      <polygon points={`${x - 10},${y + 24} ${x + 10},${y + 24} ${x + 4},${y} ${x - 4},${y}`} fill={color} opacity={0.16} />
      <g className="holo-anim">
        <R x={x - 6} y={y + 2} w={12} h={12} c={color} opacity={0.35} />
        <R x={x - 6} y={y + 2} w={12} h={2} c={color} />
        <R x={x - 6} y={y + 12} w={12} h={2} c={color} />
        <R x={x - 6} y={y + 2} w={2} h={12} c={color} />
        <R x={x + 4} y={y + 2} w={2} h={12} c={color} />
        <R x={x - 2} y={y + 6} w={4} h={4} c="#ffffff" />
      </g>
      {[0, 1, 2].map((i) => (
        <R key={i} x={x - 12 + i * 10} y={y - 3 - (i % 2) * 4} w={2} h={2} c={color} className="anim-sparkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

export function WallScreen({ x, y, w, h, bars = 6, colors = ['#4f8dff', '#8b6cff', '#5ee596', '#ff9d7a'] }: { x: number; y: number; w: number; h: number; bars?: number; colors?: string[] }) {
  const bw = (w - 8) / bars;
  return (
    <g>
      <R x={x - 3} y={y - 3} w={w + 6} h={h + 6} c="#0a0d1a" />
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#1a2140" />
      <R x={x} y={y} w={w} h={h} c="#101733" />
      {Array.from({ length: bars }).map((_, i) => {
        const bh = 6 + ((i * 11) % Math.max(8, h - 10));
        return <R key={i} x={x + 4 + i * bw} y={y + h - 3 - bh} w={bw - 2} h={bh} c={colors[i % colors.length]} className="bar-anim" style={{ animationDelay: `${i * 0.3}s` }} />;
      })}
      <R x={x + 4} y={y + 3} w={w * 0.4} h={2} c="#ffffff" opacity={0.7} />
      <polygon points={`${x},${y} ${x + w * 0.4},${y} ${x},${y + h * 0.7}`} fill="#ffffff" opacity={0.05} />
    </g>
  );
}

export function ProjectBoard({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const notes = ['#ffd166', '#ff9d7a', '#7cc2ff', '#5ee596', '#c792ea', '#ffd166', '#7cc2ff', '#ff9d7a', '#5ee596'];
  const cols = 3;
  const cw = (w - 8) / cols;
  return (
    <g>
      <R x={x - 1} y={y - 1} w={w + 5} h={h + 5} c="#000814" opacity={0.2} />
      <R x={x - 2} y={y - 2} w={w + 4} h={h + 4} c="#b7bfd2" />
      <R x={x} y={y} w={w} h={h} c="#fbfcfe" />
      {Array.from({ length: cols }).map((_, c) => (
        <R key={c} x={x + 4 + c * cw} y={y + 3} w={cw - 4} h={2} c="#141a2e" opacity={0.55} />
      ))}
      {notes.map((n, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <g key={i}>
            <R x={x + 5 + c * cw + (i % 2)} y={y + 8 + r * 9} w={cw - 7} h={7} c={n} />
            <R x={x + 5 + c * cw + (i % 2)} y={y + 8 + r * 9} w={cw - 7} h={1} c="#ffffff" opacity={0.45} />
          </g>
        );
      })}
    </g>
  );
}

export function Teammate({ x, y, index, typing }: { x: number; y: number; index: number; typing: boolean }) {
  const [hair, shirt] = TEAMMATE_STYLES[index % TEAMMATE_STYLES.length];
  return (
    <g className={typing ? 'anim-typing svg-bottom' : 'anim-bob svg-bottom'} style={{ animationDelay: `${index * 0.35}s` }}>
      <PixelSprite inline rows={TEAMMATE_ROWS} palette={teammatePalette(hair, shirt)} scale={1} x={x} y={y} />
    </g>
  );
}

export function SmallDesk({ x, y, w, active, dark, uid }: { x: number; y: number; w: number; active: boolean; dark?: boolean; uid: string }) {
  return (
    <g>
      <Monitor x={x + w / 2 - 8} y={y - 14} w={16} h={11} active={active} thin bezel={dark ? '#0b0f1e' : '#171b2c'} uid={uid} />
      <Desk x={x} w={w} y={y} color={dark ? '#232a45' : '#dbe1ee'} top={dark ? '#333d63' : '#f4f6fb'} legs={dark ? '#151a30' : '#b7bfd2'} />
    </g>
  );
}

export function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <R x={x - 1} y={y - 1} w={18} h={24} c="#0a0d1a" />
      <R x={x} y={y} w={16} h={22} c="#272c3d" />
      <R x={x} y={y} w={2} h={22} c="#3d4459" />
      <R x={x + 3} y={y + 3} w={10} h={5} c="#ff7a59" />
      <R x={x + 5} y={y + 10} w={6} h={6} c="#f4f6fb" />
      <R x={x + 6} y={y + 16} w={4} h={2} c="#5c3a1a" />
    </g>
  );
}

export function AiCore({ x, y, color, stand = true }: { x: number; y: number; color: string; stand?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={32} fill={color} opacity={0.09} className="core-anim" />
      <circle cx={x} cy={y} r={21} fill={color} opacity={0.2} className="core-anim" style={{ animationDelay: '0.4s' }} />
      <g className="anim-spin-slow svg-anim">
        <circle cx={x} cy={y} r={25} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.75} />
      </g>
      <g className="anim-spin-slow svg-anim" style={{ animationDirection: 'reverse', animationDuration: '12s' }}>
        <circle cx={x} cy={y} r={16} fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="3 5" opacity={0.6} />
      </g>
      <g className="core-anim">
        <R x={x - 7} y={y - 7} w={14} h={14} c="#0a0d1a" />
        <R x={x - 6} y={y - 6} w={12} h={12} c={color} />
        <R x={x - 3} y={y - 3} w={6} h={6} c="#ffffff" />
      </g>
      {stand && (
        <>
          <R x={x - 2} y={y + 30} w={4} h={38} c="#161d3c" />
          <R x={x - 13} y={y + 66} w={26} h={5} c="#0a0d1a" />
          <R x={x - 12} y={y + 66} w={24} h={3} c="#252e58" />
        </>
      )}
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
      <R x={x} y={y + 2} w={w} h={7} c={color} opacity={0.2} />
      <R x={x} y={y + 9} w={w} h={4} c={color} opacity={0.08} />
    </g>
  );
}

export function CeilingLight({ x, w, color = '#ffffff' }: { x: number; w: number; color?: string }) {
  return (
    <g>
      <R x={x} y={0} w={w} h={3} c={color} opacity={0.95} />
      <R x={x} y={3} w={w} h={1} c={color} opacity={0.5} />
      <polygon points={`${x},4 ${x + w},4 ${x + w + 18},48 ${x - 18},48`} fill={color} opacity={0.07} />
    </g>
  );
}
