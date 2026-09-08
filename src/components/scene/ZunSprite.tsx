import { memo, useId } from 'react';
import type { DevStrategy, Mood } from '../../game/types';
import {
  FULL_POSE, MOTION_CLASS, POSE_MOTION, POSE_NUMBER, ROOM_POSE, type ZunPose, bundledPoseSrc, roomPose,
} from '../../game/data/zunPoses';
import poseMeta from '../../game/data/zunPoseMeta.json';
import { characterStore } from '../../game/characterAssets';
import { useStore } from '../../game/createStore';
import { PixelSprite } from './PixelSprite';
import { ZUN_BUST_ROWS, ZUN_PALETTE, zunRows } from './zunFallbackSprite';

/**
 * ZUN 캐릭터 렌더러.
 *
 * `public/characters/zun/NN.png` 이미지를 그대로 쓴다. 도형으로 다시 그리지 않는다.
 * 이미지가 아직 없으면 폴백 픽셀 스프라이트로 자동 전환해 화면이 비지 않게 한다.
 */

interface PoseSize { w: number; h: number }
const BUNDLED = poseMeta as { refHeight?: number; poses?: Record<string, PoseSize> };

interface Resolved {
  /** 그릴 이미지 URL. null 이면 폴백 스프라이트를 쓴다 */
  src: string | null;
  size: PoseSize;
  refHeight: number;
}

/** 사용자가 넣은 이미지 → 저장소 포함 이미지 → 폴백 순서로 고른다 */
function useResolvedPose(pose: ZunPose): Resolved {
  const assets = useStore(characterStore, (s) => s);
  const num = POSE_NUMBER[pose];
  const key = String(num).padStart(2, '0');
  if (assets.source === 'imported' && assets.urls[num]) {
    return { src: assets.urls[num], size: assets.sizes[num] ?? { w: 1, h: 1 }, refHeight: assets.refHeight || 1 };
  }
  if (assets.source === 'bundled') {
    const size = BUNDLED.poses?.[key] ?? { w: 1, h: 1 };
    return { src: bundledPoseSrc(pose), size, refHeight: BUNDLED.refHeight || size.h };
  }
  return { src: null, size: { w: 1, h: 1 }, refHeight: 1 };
}

// ───────────── SVG(방 안)용 ─────────────

interface SceneProps {
  pose: ZunPose;
  /** 캐릭터 가로 중심 (씬 좌표) */
  cx: number;
  /** 캐릭터 발이 닿는 바닥 (씬 좌표) */
  bottom: number;
  /** 기준 키 (씬 좌표). 포즈별 실제 높이 비율을 곱해 자연스럽게 키가 맞는다 */
  height: number;
  /** 이 y 아래는 잘라낸다 (책상 뒤에 서 있는 표현) */
  clipBottom?: number;
}

/**
 * 방 안의 ZUN.
 * 발밑(x, y)을 기준점으로 삼기 때문에 포즈가 바뀌어도 바닥선이 흔들리지 않는다.
 */
export const ZunInScene = memo(function ZunInScene({ pose, cx, bottom, height, clipBottom }: SceneProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { src, size, refHeight } = useResolvedPose(pose);
  if (!src) return null;
  const { w: pw, h: ph } = size;
  const ref = refHeight || ph;
  // 포즈마다 그림 높이가 다르므로 기준 높이 대비 비율로 키를 정하고, 가로는 원본 종횡비를 지킨다
  const drawH = height * (ph / ref);
  const drawW = drawH * (pw / ph);
  const left = cx - drawW / 2;
  const top = bottom - drawH;
  const visibleH = clipBottom === undefined ? drawH : Math.max(0, Math.min(drawH, clipBottom - top));
  if (visibleH <= 0) return null;
  return (
    <g className={MOTION_CLASS[POSE_MOTION[pose]]}>
      <defs>
        <clipPath id={`zun${uid}`}>
          <rect x={left} y={top} width={drawW} height={visibleH} />
        </clipPath>
      </defs>
      <image
        href={src}
        x={left}
        y={top}
        width={drawW}
        height={drawH}
        preserveAspectRatio="xMidYMax meet"
        clipPath={`url(#zun${uid})`}
        style={{ imageRendering: 'pixelated' }}
      />
    </g>
  );
});

/** 방 안에서 게임 상태에 맞는 포즈를 골라 그린다 */
export function ZunRoomFigure(props: Omit<SceneProps, 'pose'> & { mood: Mood; typing: boolean; bugged: boolean; strategy?: DevStrategy }) {
  const { mood, typing, bugged, strategy, ...rest } = props;
  const source = useStore(characterStore, (s) => s.source);
  if (source === 'none' || source === 'loading') {
    return (
      <g className={MOTION_CLASS[POSE_MOTION[ROOM_POSE[mood]]]}>
        <PixelSprite
          inline
          rows={zunRows(mood).slice(0, ZUN_BUST_ROWS)}
          palette={ZUN_PALETTE}
          scale={1}
          x={rest.cx - 24}
          y={rest.bottom - 64}
        />
      </g>
    );
  }
  return <ZunInScene pose={roomPose(mood, typing, bugged, strategy)} {...rest} />;
}

// ───────────── HTML(모달·튜토리얼)용 ─────────────

interface PortraitProps {
  /** 직접 포즈를 지정하거나 */
  pose?: ZunPose;
  /** mood 로 자동 선택 */
  mood?: Mood;
  /** 표시 높이 (px) */
  height: number;
  className?: string;
}

export function ZunPortrait({ pose, mood = 'idle', height, className = '' }: PortraitProps) {
  const p = pose ?? FULL_POSE[mood];
  const { src } = useResolvedPose(p);
  if (!src) {
    return (
      <div className={`inline-block ${MOTION_CLASS[POSE_MOTION[p]]} ${className}`} style={{ transformOrigin: '50% 100%' }}>
        <PixelSprite rows={zunRows(mood)} palette={ZUN_PALETTE} scale={Math.max(1, Math.round(height / 64))} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`${MOTION_CLASS[POSE_MOTION[p]]} ${className}`}
      style={{ height, width: 'auto', imageRendering: 'pixelated', transformOrigin: '50% 100%' }}
    />
  );
}
