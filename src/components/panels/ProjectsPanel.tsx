import { useMemo, useState } from 'react';
import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { PROJECTS, TIER_LABEL } from '../../game/data/projects';
import { aiTier } from '../../game/data/ai';
import { failChance, projectCost, projectDevTime, projectIncomeAt, projectUsersAt, projectXpAt } from '../../game/calc';
import { autoDevUnlocked } from '../../game/engine';
import { AUTODEV_UNLOCK_LEVEL } from '../../game/constants';
import { formatDuration, formatMoney, formatRate, formatUsers } from '../../game/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import type { DevStrategy, ProjectDef } from '../../game/types';
import { strategyDef } from '../../game/data/strategies';

const TIER_TONE = { 1: 'mint', 2: 'primary', 3: 'violet', 4: 'gold' } as const;

export function ProjectsPanel() {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const ai = useGame((s) => s.aiTier);
  const projectLevels = useGame((s) => s.projectLevels);
  const projectStrategy = useGame((s) => s.projectStrategy);
  const activeDevs = useGame((s) => s.activeDevs);
  const costMult = useDerived((d) => d.costMult);
  const devSpeed = useDerived((d) => d.devSpeed);
  const slots = useDerived((d) => d.slots);
  const successBonus = useDerived((d) => d.successBonus);
  const [filter, setFilter] = useState<'all' | 'available' | 'launched'>('all');
  const state = useGame((s) => s);
  const autoDev = useGame((s) => s.autoDev);
  const autoUnlocked = autoDevUnlocked(state);

  const list = useMemo(() => {
    return PROJECTS.filter((p) => {
      const unlocked = level >= p.requiredLevel && ai >= p.requiredAi;
      const v = projectLevels[p.id] ?? 0;
      if (filter === 'available') return unlocked;
      if (filter === 'launched') return v > 0;
      return true;
    });
  }, [filter, level, ai, projectLevels]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black">프로젝트</h2>
          <p className="text-[11px] text-ink-soft">동시 개발 {activeDevs.length}/{slots} · 개발력 x{devSpeed.toFixed(1)} · 비용 {Math.round((1 - costMult) * 100)}% 할인</p>
        </div>
        <div className="flex rounded-lg bg-bg-2 p-0.5 text-[11px] font-bold">
          {([['all', '전체'], ['available', '가능'], ['launched', '출시']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-md px-2 py-1 ${filter === k ? 'bg-card-2 text-white' : 'text-ink-muted'}`}>{l}</button>
          ))}
        </div>
      </div>
      {autoUnlocked ? (
        <button
          type="button"
          data-tut="autodev-toggle"
          onClick={() => actions.setAutoDev(!autoDev)}
          className={`btn-press flex items-center justify-between rounded-xl px-3 py-2.5 text-left ${autoDev ? 'bg-mint-soft' : 'card'}`}
        >
          <div className="flex items-center gap-2">
            <Icon name="loop" size={18} className={autoDev ? 'text-mint' : 'text-ink-soft'} />
            <div>
              <div className="text-xs font-black">자동 개발 {autoDev ? 'ON' : 'OFF'}</div>
              <div className="text-[11px] text-ink-soft">빈 슬롯에 가장 비싼 프로젝트를 STABLE 전략으로 착수합니다</div>
            </div>
          </div>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${autoDev ? 'bg-mint' : 'bg-white/15'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoDev ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </span>
        </button>
      ) : (
        <div className="card flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-ink-soft"><Icon name="lock" size={13} />자동 개발은 레벨 {AUTODEV_UNLOCK_LEVEL}에 해금됩니다</div>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {list.map((p, i) => (
          <ProjectCard
            key={p.id}
            def={p}
            index={i}
            money={money}
            level={level}
            ai={ai}
            version={projectLevels[p.id] ?? 0}
            active={activeDevs.find((a) => a.projectId === p.id)}
            lastStrategy={projectStrategy[p.id]}
            costMult={costMult}
            devSpeed={devSpeed}
            slotsFull={activeDevs.length >= slots}
            successBonus={successBonus}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  def: ProjectDef;
  index: number;
  money: number;
  level: number;
  ai: number;
  version: number;
  active?: { progress: number; bugged: boolean; strategy: DevStrategy };
  /** 마지막으로 출시한 버전을 만든 전략 */
  lastStrategy?: DevStrategy;
  costMult: number;
  devSpeed: number;
  slotsFull: boolean;
  successBonus: number;
}

function ProjectCard({ def, index, money, level, ai, version, active, lastStrategy, costMult, devSpeed, slotsFull, successBonus }: CardProps) {
  const unlocked = level >= def.requiredLevel && ai >= def.requiredAi;
  const cost = projectCost(def, version, costMult);
  const nextV = version + 1;
  const time = projectDevTime(def, version) / devSpeed;
  const income = projectIncomeAt(def, nextV);
  // 지금 벌고 있는 수익은 마지막 출시에 쓴 전략이 반영된 값
  const curIncome = projectIncomeAt(def, version, lastStrategy);
  const users = projectUsersAt(def, nextV);
  const xp = projectXpAt(def, nextV);
  const fail = failChance(def, successBonus);
  const canAfford = money >= cost;
  const disabled = !unlocked || !!active || slotsFull || !canAfford;

  const reqAi = aiTier(def.requiredAi);
  return (
    <div
      className={`card anim-slide-up relative flex flex-col gap-2 p-3 ${!unlocked ? 'opacity-70' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-2 text-2xl ${unlocked ? '' : 'text-ink-muted grayscale'}`}>
          {unlocked ? def.icon : <Icon name="lock" size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="truncate text-sm font-black">{def.name}</span>
            <Badge tone={TIER_TONE[def.tier]}>{TIER_LABEL[def.tier]}</Badge>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-soft">{def.description}</p>
          {version > 0 && <VersionTrail version={version} strategy={lastStrategy} />}
        </div>
      </div>

      {unlocked ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg bg-bg-2/60 px-2.5 py-2 text-[11px]">
          <Row
            wide
            k="수익"
            v={
              <span className="text-[#5ee596]">
                {version > 0 && <span className="text-ink-muted">{formatRate(curIncome)} → </span>}
                {formatRate(income)}
              </span>
            }
          />
          <Row k="사용자" v={<span className="text-[#8ab8ff]">+{formatUsers(users)}</span>} />
          <Row k="비용" v={cost === 0 ? <span className="text-[#5ee596]">무료</span> : formatMoney(cost)} />
          <Row k="개발 시간" v={formatDuration(time)} />
          <Row k="경험치" v={<span className="text-[#b9a6ff]">+{xp} XP</span>} />
          {fail > 0 && <Row k="버그 위험" v={<span className={fail > 0.15 ? 'text-[#ff8aa1]' : 'text-ink-soft'}>{Math.round(fail * 100)}%</span>} />}
        </div>
      ) : (
        <div className="rounded-lg bg-bg-2 px-2.5 py-1.5 text-[11px] font-bold text-ink-soft">
          {level < def.requiredLevel && <div className="flex items-center gap-1.5"><Icon name="lock" size={13} />레벨 {def.requiredLevel} 필요 (현재 Lv.{level})</div>}
          {ai < def.requiredAi && <div className="flex items-center gap-1.5"><Icon name="ai" size={13} />{reqAi.name} 이상 필요</div>}
        </div>
      )}

      {active ? (
        <div className="mt-auto flex items-center justify-between rounded-lg bg-primary-soft px-2.5 py-1.5">
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-[#8ab8ff]">
            <Icon name={active.bugged ? 'bug' : 'bolt'} size={13} />
            <span className="truncate">
              {active.bugged ? '버그 수정 중' : '개발 중'} {Math.floor(active.progress * 100)}%
              <span className="ml-1 text-pixel text-[10px]" style={{ color: strategyDef(active.strategy).color }}>
                {strategyDef(active.strategy).name}
              </span>
            </span>
          </span>
          <button type="button" onClick={() => actions.cancelProject(def.id)} className="shrink-0 whitespace-nowrap text-[11px] font-bold text-ink-muted hover:text-[#ff8aa1]">취소 (50% 환불)</button>
        </div>
      ) : (
        <Button
          block
          className="mt-auto"
          variant={!unlocked || slotsFull ? 'neutral' : version > 0 ? 'accent' : 'go'}
          disabled={disabled}
          onClick={() => actions.openStrategy(def.id)}
          title={slotsFull ? '동시 개발 슬롯이 가득 찼습니다' : undefined}
          sub={!unlocked || slotsFull ? undefined : cost === 0 ? '무료' : formatMoney(cost)}
        >
          {!unlocked ? (
            <span className="flex items-center gap-1.5"><Icon name="lock" size={13} />잠김</span>
          ) : slotsFull ? (
            '슬롯 가득 참'
          ) : version > 0 ? (
            <span className="flex items-center gap-1.5"><Icon name="arrow-up" size={13} />v{nextV} 업데이트</span>
          ) : (
            <span className="flex items-center gap-1.5"><Icon name="play" size={11} filled />개발 시작</span>
          )}
        </Button>
      )}
      {unlocked && !active && !canAfford && !slotsFull && (
        <div className="text-center text-[10px] font-bold text-[#ff8aa1]">{formatMoney(cost - money)} 부족</div>
      )}
    </div>
  );
}

/**
 * 지금까지 낸 버전을 눈으로 보여준다.
 * 다섯 개까지만 칩으로 그리고 그 이상은 숫자로 접는다.
 */
function VersionTrail({ version, strategy }: { version: number; strategy?: DevStrategy }) {
  const shown = Math.min(version, 5);
  const hidden = version - shown;
  const st = strategy ? strategyDef(strategy) : null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {hidden > 0 && <span className="text-[10px] font-bold text-ink-muted">+{hidden}</span>}
      {Array.from({ length: shown }, (_, i) => version - shown + i + 1).map((v) => (
        <span
          key={v}
          className={`text-pixel rounded px-1 py-px text-[9px] font-bold leading-none ${
            v === version ? 'bg-gold-soft text-[#ffd06a]' : 'bg-bg-2 text-ink-muted'
          }`}
        >
          v{v}
        </span>
      ))}
      {st && (
        <span className="rounded px-1 py-px text-[9px] font-black leading-none" style={{ background: `${st.color}1f`, color: st.color }}>
          {st.name}
        </span>
      )}
    </div>
  );
}

/** 라벨을 값 위에 쌓아 좁은 폭에서도 글자가 쪼개지지 않게 한다 */
function Row({ k, v, wide }: { k: string; v: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? 'col-span-2' : ''}`}>
      <div className="whitespace-nowrap text-[10px] font-bold tracking-tight text-ink-muted">{k}</div>
      <div className="tnum truncate text-[12px] font-bold">{v}</div>
    </div>
  );
}
