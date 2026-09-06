import { useDerived, useGame, useUi } from '../../hooks/useGame';
import { nextGoal } from '../../game/engine';
import { formatMoney, formatRate } from '../../game/format';
import { ProgressBar } from '../ui/ProgressBar';
import type { Tab } from '../layout/BottomNav';
import { useMemo } from 'react';
import { PROJECTS } from '../../game/data/projects';
import { projectCost } from '../../game/calc';
import { actions } from '../../game/store';
import { Button } from '../ui/Button';

/** 홈 탭: 다음 목표, 빠른 액션, 최근 활동 */
export function HomePanel({ onTab }: { onTab: (t: Tab) => void }) {
  const state = useGame((s) => s);
  const costMult = useDerived((d) => d.costMult);
  const slots = useDerived((d) => d.slots);
  const income = useDerived((d) => d.incomePerSec);
  const logs = useUi((u) => u.logs);
  const goal = useMemo(() => nextGoal(state), [state]);

  // 지금 바로 시작할 수 있는 가장 좋은 프로젝트
  const quick = useMemo(() => {
    if (state.activeDevs.length >= slots) return null;
    const candidates = PROJECTS.filter((p) => state.level >= p.requiredLevel && state.aiTier >= p.requiredAi && !state.activeDevs.some((a) => a.projectId === p.id));
    const affordable = candidates.filter((p) => projectCost(p, state.projectLevels[p.id] ?? 0, costMult) <= state.money);
    if (!affordable.length) return null;
    return affordable.sort((a, b) => projectCost(b, state.projectLevels[b.id] ?? 0, costMult) - projectCost(a, state.projectLevels[a.id] ?? 0, costMult))[0];
  }, [state, costMult, slots]);

  return (
    <div className="flex flex-col gap-3">
      {goal && (
        <div className="card relative overflow-hidden p-3">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/25 blur-2xl" />
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8ab8ff]">🎯 다음 목표</span>
            <span className="tnum text-[10px] font-bold text-ink-muted">{goal.kind === 'money' ? `${formatMoney(goal.have)} / ${formatMoney(goal.need)}` : `Lv.${goal.have} / Lv.${goal.need}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">{goal.label}</div>
              <ProgressBar value={Math.min(1, goal.have / goal.need)} color="bg-gradient-to-r from-primary to-violet" height={6} className="mt-1" />
            </div>
          </div>
          {goal.kind === 'money' && goal.have < goal.need && income > 0 && (
            <div className="mt-1.5 text-[10px] font-bold text-ink-muted">현재 수익({formatRate(income)})으로 약 {Math.ceil((goal.need - goal.have) / income)}초 남음</div>
          )}
        </div>
      )}

      {quick && (
        <div className="card flex items-center gap-2.5 p-3">
          <span className="text-2xl">{quick.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#5ee596]">⚡ 지금 바로</div>
            <div className="truncate text-sm font-black">{quick.name} {(state.projectLevels[quick.id] ?? 0) > 0 ? `v${(state.projectLevels[quick.id] ?? 0) + 1}` : ''}</div>
          </div>
          <Button size="sm" variant="success" onClick={() => actions.startProject(quick.id)}>
            ▶ {projectCost(quick, state.projectLevels[quick.id] ?? 0, costMult) === 0 ? '무료' : formatMoney(projectCost(quick, state.projectLevels[quick.id] ?? 0, costMult))}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 md:hidden">
        <QuickBtn icon="📋" label="프로젝트" onClick={() => onTab('projects')} />
        <QuickBtn icon="⬆️" label="업그레이드" onClick={() => onTab('upgrades')} />
        <QuickBtn icon="🤖" label="AI" onClick={() => onTab('ai')} />
      </div>

      <div className="card p-3">
        <div className="mb-1.5 text-xs font-black">최근 활동</div>
        <div className="flex flex-col gap-1 text-[11px]">
          {logs.slice(0, 6).map((l) => (
            <div key={l.id} className={`flex gap-1.5 ${l.tone === 'good' ? 'text-[#5ee596]' : l.tone === 'bad' ? 'text-[#ff8aa1]' : 'text-ink-soft'}`}>
              <span>{l.icon}</span>
              <span className="truncate">{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-press card flex flex-col items-center gap-1 py-3 text-xs font-bold text-ink-soft hover:text-ink">
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );
}
