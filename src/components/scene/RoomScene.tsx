import { memo } from 'react';
import type { Mood } from '../../game/types';
import { PixelSprite } from './PixelSprite';
import { ZUN_PALETTE, zunRows } from './zunSprite';
import { AiRobot } from './AiRobot';
import { PET_SPRITES } from './sprites';
import {
  AiCore, Bed, Books, CeilingLight, CoffeeMachine, Cup, Desk, Hands, Hologram, Keyboard, Lamp, LedStrip, Monitor, PcTower, PixelText,
  Plant, Poster, ProjectBoard, ServerRack, Shelf, SmallDesk, Teammate, Wall, WallScreen, Window,
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

/** 스테이지별 펫 위치 (바닥) */
const PET_SPOTS: Record<number, [number, number][]> = {
  1: [[30, 170], [258, 172], [100, 178], [286, 160], [12, 108], [200, 176]],
  2: [[40, 172], [210, 176], [70, 180], [300, 176], [28, 92], [140, 178]],
  3: [[54, 176], [232, 178], [100, 182], [270, 178], [150, 186], [180, 180]],
  4: [[112, 178], [220, 176], [40, 182], [280, 180], [140, 96], [190, 182]],
  5: [[120, 178], [216, 178], [40, 184], [284, 184], [100, 96], [170, 184]],
};

function Pets({ stage, pets }: { stage: number; pets: string[] }) {
  const spots = PET_SPOTS[Math.min(5, Math.max(1, stage))];
  return (
    <g>
      {pets.map((id, i) => {
        const sprite = PET_SPRITES[id];
        const spot = spots[i % spots.length];
        if (!sprite || !spot) return null;
        return (
          <g key={id} className="anim-bob svg-bottom" style={{ animationDelay: `${i * 0.45}s`, animationDuration: `${2 + (i % 3) * 0.5}s` }}>
            <PixelSprite inline rows={sprite.rows} palette={sprite.palette} scale={2} x={spot[0]} y={spot[1] - 14} />
          </g>
        );
      })}
    </g>
  );
}

const MOOD_CLASS: Record<Mood, string> = {
  idle: 'anim-bob svg-bottom',
  focus: '',
  happy: 'anim-bob svg-bottom',
  panic: 'anim-shake svg-bottom',
  shock: '',
  confident: 'anim-bob svg-bottom',
  meltdown: 'anim-wobble svg-bottom',
};

/** ZUN 위치: 책상 뒤 중앙 */
const ZUN_X = 126;
const ZUN_Y = 50;
const ZUN_SCALE = 3;

function Zun({ mood, typing }: { mood: Mood; typing: boolean }) {
  const cls = typing && mood === 'focus' ? 'anim-typing svg-bottom' : MOOD_CLASS[mood];
  return (
    <g className={cls}>
      <PixelSprite inline rows={zunRows(mood)} palette={ZUN_PALETTE} scale={ZUN_SCALE} x={ZUN_X} y={ZUN_Y} />
    </g>
  );
}

function TeamSeats({ stage, count, typing }: { stage: number; count: number; typing: boolean }) {
  if (count <= 0) return null;
  const dark = stage >= 5 || stage === 3;
  const seats: [number, number][] =
    stage >= 4
      ? [[26, 126], [274, 126], [66, 152], [234, 152]]
      : [[26, 130], [270, 130]];
  const max = stage >= 4 ? 4 : 2;
  const n = Math.min(count, max);
  return (
    <g>
      {seats.slice(0, n).map(([x, y], i) => (
        <g key={i}>
          <Teammate x={x} y={y - 42} index={i} typing={typing} />
          <SmallDesk x={x - 12} y={y - 10} w={48} active={typing} dark={dark} />
        </g>
      ))}
    </g>
  );
}

function Stage1({ mood, typing }: { mood: Mood; typing: boolean }) {
  return (
    <g>
      <Wall color="#f3e5cf" trim="#d8c2a3" floor="#c99560" floorLine="#b07f4e" />
      <Window x={22} y={22} w={62} h={50} night />
      <Poster x={252} y={30} w={40} h={52} bg="#e9f0ff">
        <rect x={266} y={40} width={12} height={22} fill="#3b6cff" />
        <rect x={262} y={56} width={4} height={8} fill="#ff7a59" />
        <rect x={278} y={56} width={4} height={8} fill="#ff7a59" />
        <rect x={269} y={64} width={6} height={6} fill="#ffd166" className="anim-blink" />
      </Poster>
      <Bed x={8} y={124} />
      <Zun mood={mood} typing={typing} />
      <Desk x={102} w={144} />
      <Keyboard x={134} y={119} />
      <Hands x={136} y={115} typing={typing} />
      <Monitor x={186} y={73} w={52} h={38} bezel="#d8d0bd" active={typing} idleColor="#1c2233" />
      <Cup x={110} y={110} />
      <Books x={122} y={109} />
      <Lamp x={232} y={94} on />
      <PcTower x={232} y={134} />
      <Plant x={290} y={106} />
    </g>
  );
}

function Stage2({ mood, typing, team }: { mood: Mood; typing: boolean; team: number }) {
  return (
    <g>
      <Wall color="#e6ebf5" trim="#c9d1e2" floor="#454b64" floorLine="#3a405a" />
      <Window x={26} y={20} w={80} h={56} night city />
      <Shelf x={236} y={60} w={70} />
      <Poster x={140} y={26} w={44} h={30} bg="#141a2e">
        <rect x={146} y={32} width={20} height={2} fill="#7cc2ff" />
        <rect x={146} y={37} width={30} height={2} fill="#c792ea" />
        <rect x={150} y={42} width={22} height={2} fill="#ffd166" />
        <rect x={146} y={47} width={14} height={2} fill="#22c55e" />
      </Poster>
      <TeamSeats stage={2} count={team} typing={typing} />
      <Zun mood={mood} typing={typing} />
      <Desk x={92} w={164} color="#2b2f3f" top="#3a3f55" legs="#1f2233" />
      <LedStrip x={96} y={127} w={156} color="#3b6cff" />
      <Keyboard x={134} y={119} rgb />
      <Hands x={136} y={115} typing={typing} />
      <Monitor x={176} y={78} w={44} h={34} active={typing} thin />
      <Monitor x={222} y={82} w={34} h={30} active={typing} thin />
      <Cup x={100} y={110} />
      <Books x={112} y={109} />
      <PcTower x={244} y={132} w={16} h={34} color="#1f2233" rgb />
      <ServerRack x={278} y={96} w={28} h={54} lights={4} />
      <Plant x={14} y={104} big />
    </g>
  );
}

function Stage3({ mood, typing, team, aiColor }: { mood: Mood; typing: boolean; team: number; aiColor: string }) {
  return (
    <g>
      <Wall color="#1c2140" trim="#2a3060" floor="#14182e" floorLine="#1f2547" grid="#262d55" />
      <CeilingLight x={70} w={40} color="#7cc2ff" />
      <CeilingLight x={210} w={40} color="#7cc2ff" />
      <WallScreen x={62} y={26} w={70} h={36} />
      <WallScreen x={208} y={26} w={80} h={36} bars={8} colors={['#22c55e', '#3b6cff', '#7cc2ff']} />
      <ServerRack x={12} y={64} w={34} h={70} lights={7} accent={aiColor} />
      <ServerRack x={274} y={64} w={34} h={70} lights={7} accent={aiColor} />
      <Hologram x={64} y={88} color={aiColor} />
      <TeamSeats stage={3} count={team} typing={typing} />
      <Zun mood={mood} typing={typing} />
      <Desk x={92} w={164} color="#1a1e30" top="#2c3352" legs="#12162a" />
      <LedStrip x={96} y={127} w={156} color={aiColor} />
      <Keyboard x={134} y={119} rgb />
      <Hands x={136} y={115} typing={typing} />
      <Monitor x={170} y={70} w={90} h={42} active={typing} thin bezel="#0d1020" ultrawide />
      <Cup x={100} y={110} />
      <PcTower x={246} y={132} w={16} h={34} color="#0d1020" rgb />
    </g>
  );
}

function Stage4({ mood, typing, team }: { mood: Mood; typing: boolean; team: number }) {
  return (
    <g>
      <Wall color="#f4f6fa" trim="#d9dee9" floor="#d5dae6" floorLine="#c3c9d8" />
      <Window x={0} y={12} w={320} h={70} night={false} city />
      <rect x={0} y={82} width={320} height={4} fill="#ffffff" />
      <ProjectBoard x={14} y={40} w={80} h={44} />
      <CoffeeMachine x={286} y={106} />
      <Plant x={262} y={104} big />
      <Plant x={104} y={108} />
      <TeamSeats stage={4} count={team} typing={typing} />
      <Zun mood={mood} typing={typing} />
      <Desk x={96} w={156} color="#e6e9f2" top="#ffffff" legs="#c9cfdd" />
      <Keyboard x={134} y={119} rgb />
      <Hands x={136} y={115} typing={typing} />
      <Monitor x={176} y={76} w={46} h={36} active={typing} thin />
      <Monitor x={224} y={80} w={30} h={32} active={typing} thin />
      <Cup x={104} y={110} />
      <Books x={114} y={109} />
      <ServerRack x={288} y={130} w={26} h={40} lights={3} color="#3a4160" />
    </g>
  );
}

function Stage5({ mood, typing, team, aiColor }: { mood: Mood; typing: boolean; team: number; aiColor: string }) {
  return (
    <g>
      <Wall color="#0d1224" trim="#1a2140" floor="#111833" floorLine="#1c2447" grid="#161d3a" />
      {Array.from({ length: 8 }).map((_, i) => (
        <ServerRack key={i} x={4 + i * 40} y={26} w={30} h={62} lights={6} accent={i % 2 ? aiColor : '#22c55e'} color="#1a2140" />
      ))}
      <PixelText x={160} y={18} text="ZUN AI" color={aiColor} scale={1.4} />
      <AiCore x={160} y={58} color={aiColor} />
      <WallScreen x={10} y={96} w={56} h={26} bars={5} colors={[aiColor, '#7cc2ff']} />
      <WallScreen x={254} y={96} w={56} h={26} bars={5} colors={['#22c55e', aiColor]} />
      <TeamSeats stage={5} count={team} typing={typing} />
      <Zun mood={mood} typing={typing} />
      <Desk x={92} w={164} color="#141a33" top="#232b52" legs="#0d1224" />
      <LedStrip x={96} y={127} w={156} color={aiColor} />
      <Keyboard x={134} y={119} rgb />
      <Hands x={136} y={115} typing={typing} />
      <Monitor x={168} y={72} w={56} h={40} active={typing} thin bezel="#080b18" />
      <Monitor x={226} y={78} w={30} h={34} active={typing} thin bezel="#080b18" />
      <Monitor x={98} y={84} w={26} h={28} active={typing} thin bezel="#080b18" />
    </g>
  );
}

export const RoomScene = memo(function RoomScene({ stage, mood, typing, aiTier, aiColor, teamCount, pets, compact }: Props) {
  return (
    <svg viewBox={compact ? '0 34 320 140' : '0 0 320 200'} className="pixel h-full w-full" preserveAspectRatio="xMidYMid slice" aria-label="ZUN의 개발 공간">
      {stage <= 1 && <Stage1 mood={mood} typing={typing} />}
      {stage === 2 && <Stage2 mood={mood} typing={typing} team={teamCount} />}
      {stage === 3 && <Stage3 mood={mood} typing={typing} team={teamCount} aiColor={aiColor} />}
      {stage === 4 && <Stage4 mood={mood} typing={typing} team={teamCount} />}
      {stage >= 5 && <Stage5 mood={mood} typing={typing} team={teamCount} aiColor={aiColor} />}
      <Pets stage={stage} pets={pets} />
      <AiRobot tier={aiTier} color={aiColor} x={stage === 3 ? 100 : stage >= 5 ? 98 : 92} y={stage >= 3 ? 66 : 58} working={typing} />
    </svg>
  );
});
