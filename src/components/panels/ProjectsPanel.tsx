import { useMemo, useState } from 'react';
import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { PROJECTS, TIER_LABEL } from '../../game/data/projects';
import { aiTier } from '../../game/data/ai';
import { failChance, projectCost, projectDevTime, projectIncomeAt, projectUsersAt, projectXpAt } from '../../game/calc';
import { formatDuration, formatMoney, formatRate, formatUsers } from '../../game/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ProjectDef } from '../../game/types';

const TIER_TONE = { 1: 'mint', 2: 'primary', 3: 'violet', 4: 'gold' } as const;

export function ProjectsPanel() {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const ai = useGame((s) => s.aiTier);
  const projectLevels = useGame((s) => s.projectLevels);
  const activeDevs = useGame((s) => s.activeDevs);
  const costMult = useDerived((d) => d.costMult);
  const devSpeed = useDerived((d) => d.devSpeed);
  const slots = useDerived((d) => d.slots);
  const successBonus = useDerived((d) => d.successBonus);
  const [filter, setFilter] = useState<'all' | 'available' | 'launched'>('all');

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
  active?: { progress: number; bugged: boolean };
  costMult: number;
  devSpeed: number;
  slotsFull: boolean;
  successBonus: number;
}

function ProjectCard({ def, index, money, level, ai, version, active, costMult, devSpeed, slotsFull, successBonus }: CardProps) {
  const unlocked = level >= def.requiredLevel && ai >= def.requiredAi;
  const cost = projectCost(def, version, costMult);
  const nextV = version + 1;
  const time = projectDevTime(def, version) / devSpeed;
  const income = projectIncomeAt(def, nextV);
  const curIncome = projectIncomeAt(def, version);
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
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${unlocked ? 'bg-bg-2' : 'bg-bg-2 grayscale'}`}>
          {unlocked ? def.icon : '🔒'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="truncate text-sm font-black">{def.name}</span>
            <Badge tone={TIER_TONE[def.tier]}>{TIER_LABEL[def.tier]}</Badge>
            {version > 0 && <Badge tone="gold">v{version} 출시됨</Badge>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-soft">{def.description}</p>
        </div>
      </div>

      {unlocked ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
          <Row k="수익" v={<span className="text-[#5ee596]">{version > 0 ? `${formatRate(curIncome)} → ` : ''}{formatRate(income)}</span>} />
          <Row k="사용자" v={<span className="text-[#8ab8ff]">+{formatUsers(users)}</span>} />
          <Row k="개발 시간" v={formatDuration(time)} />
          <Row k="경험치" v={<span className="text-[#b9a6ff]">+{xp} XP</span>} />
          {fail > 0 && <Row k="버그 위험" v={<span className={fail > 0.15 ? 'text-[#ff8aa1]' : 'text-ink-soft'}>{Math.round(fail * 100)}%</span>} />}
        </div>
      ) : (
        <div className="rounded-lg bg-bg-2 px-2.5 py-1.5 text-[11px] font-bold text-ink-soft">
          {level < def.requiredLevel && <div>🔒 레벨 {def.requiredLevel} 필요 (현재 Lv.{level})</div>}
          {ai < def.requiredAi && <div>🤖 {reqAi.name} 이상 필요</div>}
        </div>
      )}

      {active ? (
        <div className="flex items-center justify-between rounded-lg bg-primary-soft px-2.5 py-1.5">
          <span className="text-[11px] font-bold text-[#8ab8ff]">{active.bugged ? '🐛 버그 수정 중' : '🛠️ 개발 중'} {Math.floor(active.progress * 100)}%</span>
          <button type="button" onClick={() => actions.cancelProject(def.id)} className="shrink-0 whitespace-nowrap text-[11px] font-bold text-ink-muted hover:text-[#ff8aa1]">취소 (50% 환불)</button>
        </div>
      ) : (
        <Button
          block
          variant={!unlocked || slotsFull ? 'secondary' : version > 0 ? 'primary' : 'success'}
          disabled={disabled}
          onClick={() => actions.startProject(def.id)}
          title={slotsFull ? '동시 개발 슬롯이 가득 찼습니다' : undefined}
        >
          {!unlocked ? '🔒 잠김' : slotsFull ? '슬롯 가득 참' : version > 0 ? `⬆️ v${nextV} 업데이트 · ${cost === 0 ? '무료' : formatMoney(cost)}` : `▶ 개발 시작 · ${cost === 0 ? '무료' : formatMoney(cost)}`}
        </Button>
      )}
      {unlocked && !active && !canAfford && !slotsFull && (
        <div className="text-center text-[10px] font-bold text-[#ff8aa1]">{formatMoney(cost - money)} 부족</div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ink-muted">{k}</span>
      <span className="tnum font-bold">{v}</span>
    </div>
  );
}
