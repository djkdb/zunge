/**
 * ZUN 캐릭터 포즈 정의.
 *
 * 실제 그림은 `public/characters/zun/01.png` ~ `32.png` 이며
 * `npm run extract-zun -- <시트경로>` 로 레퍼런스 시트에서 뽑아낸다.
 * 번호는 레퍼런스 시트의 칸 번호를 그대로 따른다.
 */
import type { Mood } from '../types';

export type ZunPose =
  // 1행
  | 'idle' | 'coding' | 'zcard' | 'thinking' | 'floor-coding' | 'idea' | 'running' | 'desk-coding'
  // 2행
  | 'music' | 'studying' | 'beanbag' | 'success' | 'coffee' | 'celebration' | 'tired' | 'dash'
  // 3행
  | 'desk-work' | 'cool' | 'phone' | 'cat' | 'backpack' | 'code' | 'drink' | 'night-coding'
  // 4행
  | 'books' | 'sleeping' | 'notes' | 'designing' | 'debugging' | 'tablet' | 'thumbsup' | 'laptop';

/** 포즈 → 시트 칸 번호 (= 파일명) */
export const POSE_NUMBER: Record<ZunPose, number> = {
  idle: 1,
  coding: 2,
  zcard: 3,
  thinking: 4,
  'floor-coding': 5,
  idea: 6,
  running: 7,
  'desk-coding': 8,
  music: 9,
  studying: 10,
  beanbag: 11,
  success: 12,
  coffee: 13,
  celebration: 14,
  tired: 15,
  dash: 16,
  'desk-work': 17,
  cool: 18,
  phone: 19,
  cat: 20,
  backpack: 21,
  code: 22,
  drink: 23,
  'night-coding': 24,
  books: 25,
  sleeping: 26,
  notes: 27,
  designing: 28,
  debugging: 29,
  tablet: 30,
  thumbsup: 31,
  laptop: 32,
};

/** 저장소에 포함된 PNG 경로 */
export function bundledPoseSrc(pose: ZunPose): string {
  return `${import.meta.env.BASE_URL}characters/zun/${String(POSE_NUMBER[pose]).padStart(2, '0')}.png`;
}

/**
 * 포즈별 움직임 세기.
 * 그림 자체가 이미 동작을 담고 있으므로 모든 상태에 같은 흔들림을 주지 않는다.
 */
export type PoseMotion = 'still' | 'soft' | 'bob' | 'pop' | 'shake' | 'dash';

export const POSE_MOTION: Record<ZunPose, PoseMotion> = {
  idle: 'soft',
  coding: 'still',
  zcard: 'soft',
  thinking: 'soft',
  'floor-coding': 'still',
  idea: 'pop',
  running: 'dash',
  'desk-coding': 'still',
  music: 'bob',
  studying: 'soft',
  beanbag: 'still',
  success: 'pop',
  coffee: 'soft',
  celebration: 'pop',
  tired: 'soft',
  dash: 'dash',
  'desk-work': 'still',
  cool: 'soft',
  phone: 'soft',
  cat: 'soft',
  backpack: 'soft',
  code: 'soft',
  drink: 'soft',
  'night-coding': 'still',
  books: 'soft',
  sleeping: 'soft',
  notes: 'still',
  designing: 'soft',
  debugging: 'shake',
  tablet: 'still',
  thumbsup: 'pop',
  laptop: 'still',
};

export const MOTION_CLASS: Record<PoseMotion, string> = {
  still: '',
  soft: 'anim-bob-soft svg-bottom',
  bob: 'anim-bob svg-bottom',
  pop: 'anim-pop-once svg-bottom',
  shake: 'anim-shake svg-bottom',
  dash: 'anim-dash svg-bottom',
};

/**
 * 방 안(책상 뒤)에서 쓰는 포즈.
 * 허리 아래가 책상에 가리므로 상반신만으로 읽히는 포즈를 고른다.
 * 책상·노트북이 함께 그려진 칸(02 · 05 · 08 · 11 · 17 · 24 · 32)은 방의 책상과 겹치므로 제외한다.
 */
export const ROOM_POSE: Record<Mood, ZunPose> = {
  idle: 'idle',
  focus: 'code',
  happy: 'celebration',
  panic: 'debugging',
  shock: 'idea',
  confident: 'thumbsup',
  meltdown: 'tired',
};

/** 방에서 개발 중일 때 (mood 보다 우선) */
export const ROOM_CODING_POSE: ZunPose = 'code';
/** 방에서 버그를 잡는 중일 때 (가장 우선) */
export const ROOM_BUG_POSE: ZunPose = 'debugging';

/**
 * 책상이 없는 화면(모달 · 튜토리얼)에서 쓰는 전신 포즈.
 * 여기서는 책상·노트북이 그려진 칸도 그대로 살려 쓴다.
 */
export const FULL_POSE: Record<Mood, ZunPose> = {
  idle: 'idle',
  focus: 'desk-coding',
  happy: 'celebration',
  panic: 'debugging',
  shock: 'idea',
  confident: 'thumbsup',
  meltdown: 'tired',
};

/** UI 상황별로 직접 지정하는 포즈 */
export const UI_POSE = {
  greet: 'idle',
  explain: 'idea',
  offline: 'sleeping',
  levelUp: 'celebration',
  prestige: 'thumbsup',
  daily: 'success',
} as const satisfies Record<string, ZunPose>;

/** 방 안에서 현재 게임 상태에 맞는 포즈를 고른다 */
export function roomPose(mood: Mood, typing: boolean, bugged: boolean): ZunPose {
  if (bugged) return ROOM_BUG_POSE;
  if (typing && (mood === 'focus' || mood === 'idle')) return ROOM_CODING_POSE;
  return ROOM_POSE[mood];
}
