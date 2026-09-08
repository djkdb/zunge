import { useDerived, useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { PROJECT_MAP } from '../../game/data/projects';
import { DEV_STRATEGIES } from '../../game/data/strategies';
import { failChance, projectCost, projectDevTime, projectIncomeAt, projectUsersAt, projectVersion } from '../../game/calc';
import { formatDuration, formatMoney, formatUsers } from '../../game/format';
import type { DevStrategy, StrategyDef } from '../../game/types';
import { Modal } from '../ui/Modal';
import { Icon, type IconName } from '../ui/Icon';
import { ZunPortrait } from '../scene/ZunSprite';

const STRATEGY_ICON: Record<DevStrategy, IconName> = {
  fast: 'rocket',
  stable: 'shield',
  quality: 'gem',
};

/**
 * 프로젝트를 착수하기 전에 "어떻게 만들지" 를 고르는 창.
 * 세 카드 모두 바뀐 뒤의 실제 수치를 보여줘서 눈으로 비교하고 고르게 한다.
 */
export function StrategyModal() {
  const projectId = useUi((u) => u.strategyFor);
  const state = useGame((s) => s);
  const costMult = useDerived((d) => d.costMult);
  const devSpeed = useDerived((d) => d.devSpeed);
  const successBonus = useDerived((d) => d.successBonus);

  const def = projectId ? PROJECT_MAP[projectId] : null;
  if (!def || !projectId) return null;

  const version = projectVersion(state, projectId);
  const nextV = version + 1;

  // 전략을 고르기 전의 기준값
  const base = {
    cost: projectCost(def, version, costMult),
    time: projectDevTime(def, version) / devSpeed,
    risk: failChance(def, successBonus),
    income: projectIncomeAt(def, nextV),
    users: projectUsersAt(def, nextV),
  };

  return (
    <Modal open onClose={() => actions.closeStrategy()} className="max-w-lg">
      <div className="card max-h-[90vh] overflow-y-auto p-3">
        <div className="flex items-center gap-2.5">
          <ZunPortrait pose="thinking" height={48} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ab8ff]">개발 전략</div>
            <h3 className="truncate text-base font-black">
              {def.icon} {def.name}{nextV > 1 ? ` v${nextV}` : ''} · 어떻게 만들까?
            </h3>
            <p className="text-[10px] leading-snug text-ink-soft">고른 방식은 개발 시간부터 출시 후 수익까지 계속 따라갑니다.</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5">
          {DEV_STRATEGIES.map((st) => (
            <StrategyCard
              key={st.id}
              st={st}
              def={def}
              version={version}
              base={base}
              costMult={costMult}
              devSpeed={devSpeed}
              successBonus={successBonus}
              money={state.money}
              onPick={() => actions.confirmStrategy(projectId, st.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => actions.closeStrategy()}
          className="btn btn-quiet mt-2 w-full py-2 text-[12px]"
        >
          나중에 하기
        </button>
      </div>
    </Modal>
  );
}

interface CardProps {
  st: StrategyDef;
  def: (typeof PROJECT_MAP)[string];
  version: number;
  base: { cost: number; time: number; risk: number; income: number; users: number };
  costMult: number;
  devSpeed: number;
  successBonus: number;
  money: number;
  onPick: () => void;
}

function StrategyCard({ st, def, version, base, costMult, devSpeed, successBonus, money, onPick }: CardProps) {
  const nextV = version + 1;
  const cost = projectCost(def, version, costMult, st.id);
  const time = projectDevTime(def, version, st.id) / devSpeed;
  const risk = failChance(def, successBonus, st.id);
  const income = projectIncomeAt(def, nextV, st.id);
  const users = projectUsersAt(def, nextV, st.id);
  const afford = money >= cost;

  return (
    <button
      type="button"
      disabled={!afford}
      onClick={onPick}
      className="btn-press card-2 w-full p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:bg-[#223059]"
      style={{ borderColor: afford ? `${st.color}55` : undefined }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${st.color}1f`, color: st.color }}
        >
          <Icon name={STRATEGY_ICON[st.id]} size={16} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-pixel text-[14px] font-bold tracking-wide" style={{ color: st.color }}>{st.name}</span>
            <span className="truncate text-[10px] text-ink-soft">{st.tagline}</span>
          </div>
          <div className="flex flex-wrap gap-x-2 text-[10px] font-bold leading-tight">
            <span className="text-[#5ee596]">+ {st.pro}</span>
            <span className="text-[#ff8aa1]">− {st.con}</span>
          </div>
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-1 rounded-lg bg-navy-deep/40 px-2 py-1.5">
        <Delta label="비용" from={formatMoney(base.cost)} to={formatMoney(cost)} changed={cost !== base.cost} worse={cost > base.cost} />
        <Delta label="개발 시간" from={formatDuration(base.time)} to={formatDuration(time)} changed={Math.abs(time - base.time) > 0.05} worse={time > base.time} />
        <Delta
          label="버그 위험"
          from={`${(base.risk * 100).toFixed(0)}%`}
          to={`${(risk * 100).toFixed(0)}%`}
          changed={Math.abs(risk - base.risk) > 0.001}
          worse={risk > base.risk}
        />
        <Delta label="출시 수익" from={`${formatMoney(base.income)}/s`} to={`${formatMoney(income)}/s`} changed={income !== base.income} worse={income < base.income} />
        <Delta label="사용자" from={formatUsers(base.users)} to={formatUsers(users)} changed={users !== base.users} worse={users < base.users} />
      </div>

      {!afford && <div className="mt-1 text-center text-[10px] font-bold text-[#ff8aa1]">{formatMoney(cost - money)} 부족</div>}
    </button>
  );
}

/** 바뀌는 값만 화살표로 before → after 를 보여준다 */
function Delta({ label, from, to, changed, worse }: { label: string; from: string; to: string; changed: boolean; worse: boolean }) {
  return (
    <div className="min-w-0">
      <div className="whitespace-nowrap text-[9px] font-bold leading-tight text-ink-muted">{label}</div>
      <div className="tnum flex items-baseline gap-0.5 truncate text-[11px] font-bold leading-tight">
        {changed ? (
          <>
            <span className="text-[9px] text-ink-muted line-through decoration-ink-muted/60">{from}</span>
            <Icon name="arrow-right" size={8} strokeWidth={2.8} className="shrink-0 self-center text-ink-muted" />
            <span className={worse ? 'text-[#ff8aa1]' : 'text-[#5ee596]'}>{to}</span>
          </>
        ) : (
          <span className="text-ink-soft">{to}</span>
        )}
      </div>
    </div>
  );
}
