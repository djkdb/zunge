import { memo } from 'react';
import { PixelSprite } from './PixelSprite';
import { MINI_ROBOT_ROWS, ROBOT_ROWS, WING_PALETTE, WING_ROWS, robotPalette } from './sprites';

interface Props {
  tier: number;
  color: string;
  x: number;
  y: number;
  working: boolean;
  scale?: number;
}

const HALO = '#ffd166';

/** 씬 안에서 떠다니는 AI 로봇 (티어가 오를수록 날개·후광·보조 에이전트가 늘어난다) */
export const AiRobot = memo(function AiRobot({ tier, color, x, y, working, scale = 2 }: Props) {
  const palette = robotPalette(color);
  const w = 16 * scale;
  const h = 18 * scale;
  const hasWings = tier >= 4;
  const hasHalo = tier >= 6;
  const minis = tier >= 6 ? 2 : tier >= 5 ? 1 : 0;
  return (
    <g className="orb-anim" style={{ transformBox: 'fill-box' }}>
      {/* 발광 + 접지 그림자 */}
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.7} ry={h * 0.6} fill={color} opacity={0.06} className="core-anim svg-anim" />
      {hasWings && (
        <g className={working ? 'hand-anim' : ''}>
          <PixelSprite inline rows={WING_ROWS} palette={WING_PALETTE} scale={scale} x={x - 8 * scale + 2} y={y + 3 * scale} />
          <g transform={`translate(${x + w + 8 * scale - 2} ${y + 3 * scale}) scale(-1 1)`}>
            <PixelSprite inline rows={WING_ROWS} palette={WING_PALETTE} scale={scale} />
          </g>
        </g>
      )}
      {hasHalo && (
        <g>
          <rect x={x + 4 * scale} y={y - 4 * scale} width={8 * scale} height={scale} fill={HALO} />
          <rect x={x + 3 * scale} y={y - 3 * scale} width={scale} height={scale} fill={HALO} />
          <rect x={x + 12 * scale} y={y - 3 * scale} width={scale} height={scale} fill={HALO} />
        </g>
      )}
      <PixelSprite inline rows={ROBOT_ROWS} palette={palette} scale={scale} x={x} y={y} />
      {working && <rect x={x + 5 * scale} y={y + 9 * scale} width={6 * scale} height={scale} fill="#7cf0ff" className="anim-blink" />}
      {Array.from({ length: minis }).map((_, i) => (
        <g key={i} className="orb-anim" style={{ animationDelay: `${0.5 + i * 0.5}s`, transformBox: 'fill-box' }}>
          <PixelSprite
            inline
            rows={MINI_ROBOT_ROWS}
            palette={robotPalette(i % 2 ? '#c792ea' : color)}
            scale={Math.max(1, scale - 1)}
            x={x - 14 - i * 4}
            y={y + 26 + i * 14}
          />
        </g>
      ))}
    </g>
  );
});
