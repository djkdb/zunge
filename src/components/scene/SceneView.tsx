import { useEffect, useMemo, useState } from 'react';
import { useDerived, useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { aiTier } from '../../game/data/ai';
import { stageDef } from '../../game/data/stages';
import { unlockedPets } from '../../game/data/pets';
import { PROJECT_MAP } from '../../game/data/projects';
import { projectDevTime, projectVersion } from '../../game/calc';
import { formatDurationShort } from '../../game/format';
import { RoomScene } from './RoomScene';
import { GoldenBugOverlay, SceneActions } from './SceneActions';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { strategyDef } from '../../game/data/strategies';
import type { Mood } from '../../game/types';

const FLOAT_TONE: Record<string, string> = {
  money: 'text-[#ffd06a] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]',
  users: 'text-[#7cc2ff] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]',
  xp: 'text-[#b9a6ff] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]',
  good: 'text-[#5ee596] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]',
  bad: 'text-[#ff8aa1] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]',
};

const ZUN_LINES: Record<Mood, string[]> = {
  idle: ['오늘은 뭘 만들어볼까?', '커피부터 한 잔...', '아이디어가 떠올랐다!', '새 프로젝트 시작해볼까?'],
  focus: ['코딩은 즐거워!', 'AI야, 이 부분 부탁해', '거의 다 됐어...', '테스트 통과!', '한 줄만 더...'],
  happy: ['출시 성공!', '사용자가 늘고 있어!', '이거 대박인데?'],
  panic: ['어... 잠깐만', '돈이 부족해!', '이러면 안 되는데'],
  shock: ['이거 대박인데?!', '와, 진짜?!', '사용자가 폭발했다!'],
  confident: ['레벨업! 더 열심히!', '이제 좀 개발자 같은데?', '다음 단계로 가자'],
  meltdown: ['버그가 생겼다...', '왜 안 되지...', '어제까진 됐는데'],
};

const AI_LINES = ['코드 생성 중', '테스트 작성 중', '버그 분석 중', '리팩토링 중', '배포 준비 중', 'API 연동 중', 'UI 구성 중'];

export function SceneView({ compact = false, desktop = false, onGoProjects }: { compact?: boolean; desktop?: boolean; onGoProjects: () => void }) {
  const stage = useGame((s) => s.stage);
  const level = useGame((s) => s.level);
  const aiT = useGame((s) => s.aiTier);
  const team = useGame((s) => s.upgrades.team);
  const activeDevs = useGame((s) => s.activeDevs);
  const projectLevels = useGame((s) => s.projectLevels);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const mood = useUi((u) => u.mood);
  const floats = useUi((u) => u.floats);
  const devSpeed = useDerived((d) => d.devSpeed);
  const slots = useDerived((d) => d.slots);

  const ai = aiTier(aiT);
  const st = stageDef(stage);
  const typing = activeDevs.length > 0;
  const bugged = activeDevs.some((a) => a.bugged);
  // 가장 먼저 착수한 프로젝트의 전략을 방 안 포즈에 쓴다
  const strategy = activeDevs[0]?.strategy;
  const pets = useMemo(() => unlockedPets(level).map((p) => p.id), [level]);

  // 말풍선 라인 회전
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLineIdx((i) => i + 1), 6000);
    return () => clearInterval(t);
  }, []);
  const zunLine = ZUN_LINES[mood][lineIdx % ZUN_LINES[mood].length];
  const aiLine = AI_LINES[lineIdx % AI_LINES.length];

  const zoom = desktop ? 'full' : compact ? 'compact' : 'mobile';

  const [rings, setRings] = useState<number[]>([]);
  const tap = () => {
    actions.tapZun();
    if (!reduced) {
      const id = Date.now() + Math.random();
      setRings((r) => [...r.slice(-3), id]);
      setTimeout(() => setRings((r) => r.filter((x) => x !== id)), 900);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[16/7]' : 'aspect-[16/10]'} bg-navy-deep select-none`}>
      <RoomScene stage={stage} mood={mood} typing={typing} bugged={bugged} strategy={strategy} aiTier={aiT} aiColor={ai.color} teamCount={team} pets={pets} zoom={zoom} />

      {/* 탭 영역 (ZUN) */}
      <button
        type="button"
        aria-label="ZUN 응원하기"
        onClick={tap}
        className="absolute left-[38%] top-[20%] h-[52%] w-[24%] cursor-pointer rounded-2xl active:scale-95"
      >
        {rings.map((id) => (
          <span key={id} className="anim-ring pointer-events-none absolute inset-0 rounded-full border-2 border-[#ffd06a]" />
        ))}
      </button>

      {/* 스테이지 / AI 상태 배지 (세로로 정렬) */}
      <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
        <div className="flex items-center gap-1.5 rounded-lg panel-glass px-2 py-1 text-[11px] font-bold text-ink">
          <span>{st.icon}</span>
          <span>STAGE {st.stage}</span>
          <span className="text-ink-muted">·</span>
          <span className="text-pixel text-[9px] tracking-wider text-[#8ab8ff]">{st.subtitle}</span>
        </div>
        {!compact && (
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold text-white shadow md:text-[11px]" style={{ background: ai.color, opacity: 0.94 }}>
            <span>{ai.icon}</span>
            <span>{ai.name}</span>
            <span className="opacity-90">
              {typing ? (
                <>
                  · {aiLine}
                  <span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
                </>
              ) : '· 대기 중'}
            </span>
          </div>
        )}
      </div>

      {/* ZUN 말풍선 */}
      {!compact && (
        <div key={`${mood}-${lineIdx}`} className="anim-pop pointer-events-none absolute left-[50%] top-[26%] max-w-[42%] rounded-xl rounded-bl-none bg-white px-2.5 py-1.5 text-[11px] font-bold text-navy-deep shadow-lg md:text-xs">
          {zunLine}
        </div>
      )}

      <SceneActions />
      <GoldenBugOverlay />

      {/* 플로팅 텍스트 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floats.map((f) => (
          <span
            key={f.id}
            className={`anim-float absolute whitespace-nowrap text-sm font-black md:text-base ${FLOAT_TONE[f.tone]}`}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* 개발 진행 HUD */}
      <div className="absolute inset-x-2 bottom-2 flex flex-col gap-1.5">
        {activeDevs.length === 0 ? (
          <button
            type="button"
            onClick={onGoProjects}
            className="btn-press panel-glass flex items-center justify-between rounded-xl px-3 py-2 text-left"
          >
            <div>
              <div className="text-xs font-bold text-ink">진행 중인 프로젝트가 없어요</div>
              <div className="text-[11px] text-ink-soft">새 프로젝트를 시작해 수익을 만들어보세요</div>
            </div>
            <span className="btn btn-go px-3 py-1.5 text-[12px]">
              <Icon name="play" size={10} filled />
              프로젝트 시작
            </span>
          </button>
        ) : (
          activeDevs.slice(0, compact ? 1 : 3).map((dev) => {
            const def = PROJECT_MAP[dev.projectId];
            const v = projectVersion(projectLevels, dev.projectId);
            const time = projectDevTime(def, v);
            const remain = ((1 - dev.progress) * time) / Math.max(devSpeed, 0.0001);
            return (
              <div key={dev.projectId} className="panel-glass rounded-xl px-3 py-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-ink">
                    <span>{def.icon}</span>
                    <span className="truncate">{def.name}{v > 0 ? ` v${v + 1}` : ''}</span>
                    <span className="text-pixel shrink-0 text-[10px]" style={{ color: strategyDef(dev.strategy).color }}>
                      {strategyDef(dev.strategy).name}
                    </span>
                    {dev.bugged && <Badge tone="rose"><span className="flex items-center gap-1"><Icon name="bug" size={11} />버그 수정 중</span></Badge>}
                  </div>
                  <div className="tnum shrink-0 text-[11px] font-bold text-ink-soft">
                    {Math.floor(dev.progress * 100)}% · {formatDurationShort(remain)}
                  </div>
                </div>
                <ProgressBar value={dev.progress} color={dev.bugged ? 'bg-rose' : 'bg-gradient-to-r from-primary to-violet'} striped height={7} trackClassName="bg-white/15" />
              </div>
            );
          })
        )}
        {!compact && activeDevs.length > 0 && activeDevs.length < slots && (
          <button type="button" onClick={onGoProjects} className="btn-press panel-glass flex min-h-[36px] items-center gap-1 self-end rounded-lg px-3 py-2 text-[11px] font-bold text-ink-soft">
            <Icon name="plus" size={11} strokeWidth={2.4} />
            슬롯 {activeDevs.length}/{slots} · 프로젝트 추가
          </button>
        )}
      </div>
    </div>
  );
}
