import { memo, useId } from 'react';
import type { Mood } from '../../game/types';
import { PixelSprite } from './PixelSprite';
import { ZUN_BUST_ROWS, ZUN_PALETTE, zunRows } from './zunSprite';
import { AiRobot } from './AiRobot';
import { PET_SPRITES } from './sprites';
import {
  AiCore, Bed, Books, CeilingLight, Cup, Desk, Glow, Hands, Hologram, Keyboard, Lamp, LedStrip, Monitor,
  PcTower, PixelText, Plant, ProjectBoard, SCENE_THEMES, SceneDefs, SceneTheme, ServerRack, Shadow, Shelf, SmallDesk,
  Teammate, Vignette, Wall, WallScreen, Window,
} from './parts';

interface Props {
  stage: number;
  mood: Mood;
  typing: boolean;
  aiTier: number;
  aiColor: string;
  teamCount: number;
  pets: string[];
  /** 컴팩트 모드: 책상 주변만 보여주는 좁은 뷰 */
  compact?: boolean;
}

// ───────── 레이아웃 상수 (viewBox 320 x 200) ─────────
const ZUN_X = 128;
const ZUN_Y = 48;
const ZUN_SCALE = 2;

const DESK_X = 96;
const DESK_W = 148;
const DESK_Y = 118;

const KEYBOARD_X = 142;
const KEYBOARD_Y = 116;
const HANDS_X = 148;
const HANDS_Y = 111;

const ROBOT_X = 88;
const ROBOT_Y = 46;

/** 팀원 자리: [책상 x, 책상 y, 스케일] — 뒤로 갈수록 작게 그려 원근을 만든다 */
const TEAM_SEATS: [number, number, number][] = [
  [2, 130, 2],
  [266, 130, 2],
  [44, 100, 1.5],
  [238, 100, 1.5],
];

/** 펫이 앉는 바닥 위치 (중심 x, 바닥 y, 스케일) — 하단 HUD를 가리지 않는 띠 안에 둔다 */
const PET_SPOTS: [number, number, number][] = [
  [110, 159, 2], [172, 152, 1.5], [228, 159, 2], [276, 152, 1.5], [304, 158, 2], [146, 151, 1.5],
];

const MOOD_CLASS: Record<Mood, string> = {
  idle: 'anim-bob svg-bottom',
  focus: '',
  happy: 'anim-bob svg-bottom',
  panic: 'anim-shake svg-bottom',
  shock: '',
  confident: 'anim-bob svg-bottom',
  meltdown: 'anim-wobble svg-bottom',
};

function Zun({ mood, typing }: { mood: Mood; typing: boolean }) {
  const cls = typing && mood === 'focus' ? 'anim-typing svg-bottom' : MOOD_CLASS[mood];
  return (
    <g className={cls}>
      <PixelSprite inline rows={zunRows(mood).slice(0, ZUN_BUST_ROWS)} palette={ZUN_PALETTE} scale={ZUN_SCALE} x={ZUN_X} y={ZUN_Y} />
    </g>
  );
}

/** ZUN의 책상 세트: 책상 → 모니터 → 소품 → 키보드 → 손 순으로 겹친다 */
function Workstation({ stage, uid, typing, dark, ultrawide, extraMonitor, lamp }: { stage: number; uid: string; typing: boolean; dark?: boolean; ultrawide?: boolean; extraMonitor?: boolean; lamp?: boolean }) {
  return (
    <g>
      <Desk
        x={DESK_X}
        w={DESK_W}
        y={DESK_Y}
        color={dark ? '#1a2140' : stage === 1 ? '#7a4d24' : '#dbe1ee'}
        top={dark ? '#2a3358' : stage === 1 ? '#a8703a' : '#f4f6fb'}
        legs={dark ? '#0f1430' : stage === 1 ? '#5c3a1a' : '#b7bfd2'}
      />
      {dark && <LedStrip x={DESK_X + 4} y={DESK_Y + 9} w={DESK_W - 8} color="#4f8dff" />}
      {ultrawide ? (
        <Monitor x={186} y={70} w={56} h={42} active={typing} thin bezel="#0b0f1e" ultrawide uid={uid} />
      ) : (
        <Monitor x={192} y={72} w={48} h={38} active={typing} thin={stage >= 2} bezel={dark ? '#0b0f1e' : stage === 1 ? '#cfc7b2' : '#171b2c'} uid={uid} />
      )}
      {extraMonitor && <Monitor x={98} y={82} w={30} h={28} active={typing} thin bezel={dark ? '#0b0f1e' : '#171b2c'} uid={uid} />}
      {lamp && <Lamp x={98} y={94} on />}
      <Cup x={110} y={108} />
      <Books x={122} y={107} />
      <Keyboard x={KEYBOARD_X} y={KEYBOARD_Y} w={36} rgb={stage >= 2} />
      <Hands x={HANDS_X} y={HANDS_Y} typing={typing} />
    </g>
  );
}

function TeamSeats({ count, max, dark, typing, uid }: { count: number; max: number; dark?: boolean; typing: boolean; uid: string }) {
  const n = Math.min(count, max);
  if (n <= 0) return null;
  return (
    <g>
      {TEAM_SEATS.slice(0, n).map(([dx, dy, s], i) => (
        <g key={i}>
          <Teammate x={dx + 4 * s} y={dy - 18 * s} index={i} typing={typing} />
          <SmallDesk x={dx} y={dy} w={24 * s} s={s} active={typing} dark={dark} uid={uid} />
        </g>
      ))}
    </g>
  );
}

function Pets({ pets }: { pets: string[] }) {
  return (
    <g>
      {pets.map((id, i) => {
        const sprite = PET_SPRITES[id];
        const spot = PET_SPOTS[i % PET_SPOTS.length];
        if (!sprite || !spot) return null;
        const [cx, by, sc] = spot;
        return (
          <g key={id}>
            <Shadow x={cx} y={by} rx={6 * sc} ry={2} opacity={0.26} />
            <g className="anim-bob svg-bottom" style={{ animationDelay: `${i * 0.45}s`, animationDuration: `${2 + (i % 3) * 0.5}s` }}>
              <PixelSprite inline rows={sprite.rows} palette={sprite.palette} scale={sc} x={cx - 6 * sc} y={by - 12 * sc} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

// ───────── 스테이지 ─────────
function Stage1({ mood, typing, theme, uid }: { mood: Mood; typing: boolean; theme: SceneTheme; uid: string }) {
  return (
    <g>
      <Wall uid={uid} theme={theme} />
      <Window x={20} y={20} w={62} h={50} night />
      <Shelf x={252} y={42} w={60} />
      <Bed x={4} y={122} />
      <Plant x={286} y={104} />
      <Zun mood={mood} typing={typing} />
      <Workstation stage={1} uid={uid} typing={typing} lamp />
      <PcTower x={250} y={140} w={16} h={34} />
    </g>
  );
}

function Stage2({ mood, typing, team, theme, uid }: { mood: Mood; typing: boolean; team: number; theme: SceneTheme; uid: string }) {
  return (
    <g>
      <Wall uid={uid} theme={theme} />
      <Window x={16} y={18} w={70} h={52} night city />
      <Shelf x={250} y={40} w={62} />
      <Poster2 />
      <TeamSeats count={team} max={1} typing={typing} uid={uid} />
      <Plant x={88} y={104} big />
      <Zun mood={mood} typing={typing} />
      <Workstation stage={2} uid={uid} typing={typing} extraMonitor />
      <PcTower x={248} y={138} w={17} h={36} color="#171b2c" rgb />
      <ServerRack x={280} y={96} w={30} h={54} lights={4} />
    </g>
  );
}

function Poster2() {
  return (
    <g>
      <rect x={140} y={22} width={48} height={32} fill="#f4f6fb" />
      <rect x={142} y={24} width={44} height={28} fill="#121a35" />
      <rect x={146} y={29} width={20} height={2} fill="#7cc2ff" />
      <rect x={146} y={34} width={32} height={2} fill="#c792ea" />
      <rect x={150} y={39} width={24} height={2} fill="#ffd166" />
      <rect x={146} y={44} width={14} height={2} fill="#5ee596" />
    </g>
  );
}

function Stage3({ mood, typing, team, theme, aiColor, uid }: { mood: Mood; typing: boolean; team: number; theme: SceneTheme; aiColor: string; uid: string }) {
  return (
    <g>
      <Wall uid={uid} theme={theme} />
      <CeilingLight x={72} w={44} color="#7cc2ff" />
      <CeilingLight x={208} w={44} color="#7cc2ff" />
      <WallScreen x={150} y={20} w={76} h={34} />
      <WallScreen x={244} y={22} w={64} h={30} bars={7} colors={['#5ee596', '#4f8dff', '#7cc2ff']} />
      <ServerRack x={6} y={60} w={30} h={58} lights={6} accent={aiColor} />
      <ServerRack x={286} y={60} w={30} h={58} lights={6} accent={aiColor} />
      <Hologram x={66} y={84} color={aiColor} />
      <TeamSeats count={team} max={2} typing={typing} dark uid={uid} />
      <Zun mood={mood} typing={typing} />
      <Workstation stage={3} uid={uid} typing={typing} dark ultrawide />
      <PcTower x={250} y={140} w={17} h={34} color="#0b0f1e" rgb />
    </g>
  );
}

function Stage4({ mood, typing, team, theme, uid }: { mood: Mood; typing: boolean; team: number; theme: SceneTheme; uid: string }) {
  return (
    <g>
      <Wall uid={uid} theme={theme} />
      <Window x={0} y={10} w={320} h={68} night={false} city />
      <rect x={0} y={78} width={320} height={4} fill="#f4f6fb" />
      <ProjectBoard x={112} y={22} w={80} h={46} />
      <TeamSeats count={team} max={4} typing={typing} uid={uid} />
      <Zun mood={mood} typing={typing} />
      <Workstation stage={4} uid={uid} typing={typing} extraMonitor />
    </g>
  );
}

function Stage5({ mood, typing, team, theme, aiColor, uid }: { mood: Mood; typing: boolean; team: number; theme: SceneTheme; aiColor: string; uid: string }) {
  return (
    <g>
      <Wall uid={uid} theme={theme} />
      {Array.from({ length: 8 }).map((_, i) => (
        <ServerRack key={i} x={2 + i * 40} y={22} w={30} h={58} lights={6} accent={i % 2 ? aiColor : '#5ee596'} color="#161d3c" />
      ))}
      <PixelText x={160} y={16} text="ZUN AI" color={aiColor} scale={1.4} />
      <AiCore x={160} y={44} color={aiColor} stand={false} />
      <TeamSeats count={team} max={4} typing={typing} dark uid={uid} />
      <Zun mood={mood} typing={typing} />
      <Workstation stage={5} uid={uid} typing={typing} dark ultrawide extraMonitor />
    </g>
  );
}

export const RoomScene = memo(function RoomScene({ stage, mood, typing, aiTier, aiColor, teamCount, pets, compact }: Props) {
  const s = Math.min(5, Math.max(1, stage));
  const theme = SCENE_THEMES[s];
  // 모바일/데스크톱 두 씬이 동시에 존재하므로 그라디언트 id를 인스턴스마다 분리한다
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      viewBox={compact ? '0 30 320 142' : '0 0 320 200'}
      className="pixel h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-label="ZUN의 개발 공간"
    >
      <SceneDefs uid={uid} theme={theme} accent={aiColor} />
      {s === 1 && <Stage1 mood={mood} typing={typing} theme={theme} uid={uid} />}
      {s === 2 && <Stage2 mood={mood} typing={typing} team={teamCount} theme={theme} uid={uid} />}
      {s === 3 && <Stage3 mood={mood} typing={typing} team={teamCount} theme={theme} aiColor={aiColor} uid={uid} />}
      {s === 4 && <Stage4 mood={mood} typing={typing} team={teamCount} theme={theme} uid={uid} />}
      {s === 5 && <Stage5 mood={mood} typing={typing} team={teamCount} theme={theme} aiColor={aiColor} uid={uid} />}
      <Pets pets={pets} />
      <Glow x={ROBOT_X + 16} y={ROBOT_Y + 18} r={20} uid={uid} />
      <AiRobot tier={aiTier} color={aiColor} x={ROBOT_X} y={ROBOT_Y} working={typing} />
      <Vignette uid={uid} />
    </svg>
  );
});
