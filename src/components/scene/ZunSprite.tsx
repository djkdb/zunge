import { memo, useEffect, useId, useState } from 'react';
import type { Mood } from '../../game/types';
import {
  FULL_POSE, MOTION_CLASS, POSE_MOTION, POSE_NUMBER, ROOM_POSE, type ZunPose, poseSrc, roomPose,
} from '../../game/data/zunPoses';
import poseMeta from '../../game/data/zunPoseMeta.json';
import { PixelSprite } from './PixelSprite';
import { ZUN_BUST_ROWS, ZUN_PALETTE, zunRows } from './zunFallbackSprite';

/**
 * ZUN 캐릭터 렌더러.
 *
 * `public/characters/zun/NN.png` 이미지를 그대로 쓴다. 도형으로 다시 그리지 않는다.
 * 이미지가 아직 없으면 폴백 픽셀 스프라이트로 자동 전환해 화면이 비지 않게 한다.
 */

// ── 자산 존재 여부는 앱 전체에서 한 번만 확인한다 ──
type AssetStatus = 'loading' | 'ready' | 'missing';
let assetStatus: AssetStatus = 'loading';
const listeners = new Set<(s: AssetStatus) => void>();
let probeStarted = false;

function probe() {
  if (probeStarted || typeof window === 'undefined') return;
  probeStarted = true;
  const img = new Image();
  img.onload = () => {
    assetStatus = img.naturalWidth > 0 ? 'ready' : 'missing';
    listeners.forEach((l) => l(assetStatus));
  };
  img.onerror = () => {
    assetStatus = 'missing';
    listeners.forEach((l) => l(assetStatus));
    console.warn(
      '[ZUN] 캐릭터 이미지를 찾지 못해 폴백 스프라이트를 사용합니다.\n' +
      '      npm run extract-zun -- <레퍼런스 시트 경로> 로 public/characters/zun/ 을 만들어주세요.',
    );
  };
  img.src = poseSrc('idle');
}

export function useZunAssets(): AssetStatus {
  const [status, setStatus] = useState<AssetStatus>(assetStatus);
  useEffect(() => {
    probe();
    setStatus(assetStatus);
    listeners.add(setStatus);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);
  return status;
}

// ───────────── SVG(방 안)용 ─────────────

interface PoseSize { w: number; h: number }
const META = poseMeta as { refHeight?: number; poses?: Record<string, PoseSize> };

/** 포즈 그림의 실제 픽셀 크기. 메타데이터가 없으면 정사각으로 가정한다 */
function poseSize(pose: ZunPose): PoseSize {
  const key = String(POSE_NUMBER[pose]).padStart(2, '0');
  return META.poses?.[key] ?? { w: 1, h: 1 };
}

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
  const { w: pw, h: ph } = poseSize(pose);
  const ref = META.refHeight || ph;
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
        href={poseSrc(pose)}
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
export function ZunRoomFigure(props: Omit<SceneProps, 'pose'> & { mood: Mood; typing: boolean; bugged: boolean }) {
  const { mood, typing, bugged, ...rest } = props;
  const status = useZunAssets();
  if (status !== 'ready') {
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
  return <ZunInScene pose={roomPose(mood, typing, bugged)} {...rest} />;
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
  const status = useZunAssets();
  const p = pose ?? FULL_POSE[mood];
  if (status !== 'ready') {
    return (
      <div className={`inline-block ${MOTION_CLASS[POSE_MOTION[p]]} ${className}`} style={{ transformOrigin: '50% 100%' }}>
        <PixelSprite rows={zunRows(mood)} palette={ZUN_PALETTE} scale={Math.max(1, Math.round(height / 64))} />
      </div>
    );
  }
  return (
    <img
      src={poseSrc(p)}
      alt=""
      aria-hidden="true"
      className={`${MOTION_CLASS[POSE_MOTION[p]]} ${className}`}
      style={{ height, width: 'auto', imageRendering: 'pixelated', transformOrigin: '50% 100%' }}
    />
  );
}
