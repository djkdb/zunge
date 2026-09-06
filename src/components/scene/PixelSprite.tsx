import { memo, useMemo } from 'react';

export type Palette = Record<string, string>;

interface Props {
  rows: string[];
  palette: Palette;
  /** 픽셀 1칸의 크기 (px 또는 SVG 단위) */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  x?: number;
  y?: number;
  /** true면 <g>로 렌더링 (다른 SVG 안에 포함) */
  inline?: boolean;
}

interface Run { x: number; y: number; w: number; c: string }

/** 가로로 이어진 같은 색 픽셀을 하나의 rect로 병합 */
function toRuns(rows: string[], palette: Palette): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const color = palette[ch];
      if (!color) { x += 1; continue; }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w += 1;
      runs.push({ x, y, w, c: color });
      x += w;
    }
  });
  return runs;
}

export const PixelSprite = memo(function PixelSprite({ rows, palette, scale = 1, className = '', style, x = 0, y = 0, inline }: Props) {
  const runs = useMemo(() => toRuns(rows, palette), [rows, palette]);
  const width = Math.max(...rows.map((r) => r.length));
  const height = rows.length;
  const rects = runs.map((r, i) => (
    <rect key={i} x={r.x * scale} y={r.y * scale} width={r.w * scale} height={scale} fill={r.c} />
  ));
  if (inline) {
    return (
      <g transform={`translate(${x} ${y})`} className={className} style={style} shapeRendering="crispEdges">
        {rects}
      </g>
    );
  }
  return (
    <svg
      viewBox={`0 0 ${width * scale} ${height * scale}`}
      width={width * scale}
      height={height * scale}
      className={`pixel ${className}`}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
});
