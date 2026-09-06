import { memo } from 'react';
import { PixelSprite } from './PixelSprite';
import { MINI_ROBOT_ROWS, ROBOT_ROWS, WING_ROWS, robotPalette } from './sprites';

interface Props {
  tier: number;
  color: string;
  x: number;
  y: number;
  working: boolean;
  scale?: number;
}

const WING_PALETTE = { W: '#dbe7ff' };
const HALO = '#ffd166';

/** 씬 안에서 떠다니는 AI 로봇 (티어별 외형 변화) */
export const AiRobot = memo(function AiRobot({ tier, color, x, y, working, scale = 2 }: Props) {
  const palette = robotPalette(color);
  const w = 12 * scale;
  const h = 14 * scale;
  const hasWings = tier >= 4;
  const hasHalo = tier >= 6;
  const minis = tier >= 6 ? 3 : tier >= 5 ? 2 : 0;
  return (
    <g className={`orb-anim ${working ? '' : ''}`} style={{ transformBox: 'fill-box' }}>
      {/* 빛 */}
      <ellipse cx={x + w / 2} cy={y + h + 4} rx={w * 0.55} ry={3} fill={color} opacity={0.25} className="anim-pulse-glow svg-anim" />
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
          <rect x={x + 2 * scale} y={y - 3 * scale} width={8 * scale} height={scale} fill={HALO} />
          <rect x={x + scale} y={y - 2 * scale} width={scale} height={scale} fill={HALO} />
          <rect x={x + 10 * scale} y={y - 2 * scale} width={scale} height={scale} fill={HALO} />
        </g>
      )}
      <PixelSprite inline rows={ROBOT_ROWS} palette={palette} scale={scale} x={x} y={y} />
      {working && (
        <g>
          <rect x={x + 4 * scale} y={y + 6 * scale} width={4 * scale} height={scale} fill="#7cf0ff" className="anim-blink" />
        </g>
      )}
      {Array.from({ length: minis }).map((_, i) => (
        <g key={i} className="orb-anim" style={{ animationDelay: `${0.5 + i * 0.4}s`, transformBox: 'fill-box' }}>
          <PixelSprite
            inline
            rows={MINI_ROBOT_ROWS}
            palette={robotPalette(i % 2 ? '#c792ea' : color)}
            scale={Math.max(1, scale - 1)}
            x={x - 10 - i * 12}
            y={y + 18 + (i % 2) * 10}
          />
        </g>
      ))}
    </g>
  );
});
