import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { UPGRADES } from '../../game/data/upgrades';
import { bulkUpgradeCost } from '../../game/engine';
import { STAGES } from '../../game/data/stages';
import { formatMoney } from '../../game/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Icon, type IconName } from '../ui/Icon';

/** 업그레이드 항목별 아이콘 (이모지 대신 선 아이콘으로 통일) */
const UPGRADE_ICON: Record<string, IconName> = {
  pc: 'monitor',
  monitor: 'display',
  internet: 'wifi',
  server: 'server',
  automation: 'loop',
  team: 'team',
};

export function UpgradesPanel() {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const upgrades = useGame((s) => s.upgrades);
  const stage = useGame((s) => s.stage);
  const offlineEff = useDerived((d) => d.offlineEfficiency);
  const offlineCap = useDerived((d) => d.offlineCapHours);
  const buyMode = useGame((s) => s.settings.buyMode);
  const state = useGame((s) => s);

  const nextStage = STAGES.find((s) => s.stage === stage + 1);
  const curStage = STAGES[stage - 1];

  // 지금 살 수 있는 것 중 가장 싼 하나만 강조한다.
  // 살 수 있는 모든 버튼을 색칠하면 어디를 눌러야 할지 알 수 없다.
  const pick = UPGRADES.reduce<{ id: string; cost: number } | null>((best, u) => {
    if (upgrades[u.id] >= u.maxLevel || level < u.requiredLevel) return best;
    const c = bulkUpgradeCost(state, u.id, buyMode);
    if (c.count <= 0 || money < c.cost) return best;
    return !best || c.cost < best.cost ? { id: u.id, cost: c.cost } : best;
  }, null)?.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-black">업그레이드</h2>
          <p className="text-[11px] text-ink-soft">오프라인 효율 {Math.round(offlineEff * 100)}% · 최대 {offlineCap}시간</p>
        </div>
        <div data-tut="buy-mode" className="flex shrink-0 rounded-lg bg-bg-2 p-0.5 text-[11px] font-bold">
          {([[1, 'x1'], [10, 'x10'], [-1, 'MAX']] as const).map(([m, l]) => (
            <button
              key={l}
              type="button"
              onClick={() => actions.setBuyMode(m)}
              className={`rounded-md px-2 py-1 ${buyMode === m ? 'bg-card-2 text-white' : 'text-ink-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 공간 확장 */}
      <div data-tut="stage-card" className="card relative overflow-hidden p-3">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet/20 blur-2xl" />
        <div className="flex items-start gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-2 text-2xl">{nextStage ? nextStage.icon : curStage.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-sm font-black">공간 확장</span>
              <Badge tone="violet">STAGE {stage} {curStage.name}</Badge>
            </div>
            {nextStage ? (
              <>
                <p className="mt-0.5 text-[11px] text-ink-soft">다음: <b className="text-ink">{nextStage.name}</b> · {nextStage.description}</p>
                <p className="mt-1 text-[11px] font-bold text-[#5ee596]">수익 x{nextStage.incomeMult} · 개발 속도 x{nextStage.devSpeedMult}</p>
              </>
            ) : (
              <p className="mt-0.5 text-[11px] text-ink-soft">최고 단계에 도달했습니다. ZUN의 회사가 세상을 바꾸고 있습니다.</p>
            )}
          </div>
        </div>
        {nextStage && (
          <div className="mt-2.5">
            {level < nextStage.requiredLevel ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-bg-2 px-2.5 py-2 text-[11px] font-bold text-ink-soft"><Icon name="lock" size={13} />레벨 {nextStage.requiredLevel} 필요 (현재 Lv.{level})</div>
            ) : (
              <Button
                block
                variant="gold"
                disabled={money < nextStage.cost}
                onClick={() => actions.buyStage()}
                sub={formatMoney(nextStage.cost)}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name="building" size={14} strokeWidth={2} />
                  {nextStage.name}(으)로 이사
                </span>
              </Button>
            )}
            {level >= nextStage.requiredLevel && money < nextStage.cost && (
              <div className="mt-1.5">
                <ProgressBar value={money / nextStage.cost} color="bg-gradient-to-r from-gold to-coral" height={5} />
                <div className="mt-0.5 text-right text-[10px] font-bold text-ink-muted">{formatMoney(nextStage.cost - money)} 부족</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {UPGRADES.map((u, i) => {
          const recommended = u.id === pick;
          const lv = upgrades[u.id];
          const maxed = lv >= u.maxLevel;
          const locked = level < u.requiredLevel;
          const bulk = bulkUpgradeCost(state, u.id, buyMode);
          // MAX 모드에서 한 단계도 못 사면 1단계 가격을 안내한다
          const single = bulkUpgradeCost(state, u.id, 1);
          const count = bulk.count > 0 ? bulk.count : single.count;
          const cost = bulk.count > 0 ? bulk.cost : single.cost;
          const can = !locked && !maxed && count > 0 && money >= cost;
          return (
            <div key={u.id} className={`card anim-slide-up flex flex-col gap-2 p-3 ${locked ? 'opacity-70' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-2.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-2 text-ink-soft">
                  <Icon name={locked ? 'lock' : (UPGRADE_ICON[u.id] ?? 'upgrades')} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black">{u.name}</span>
                    <Badge tone={maxed ? 'gold' : 'slate'}>Lv.{lv}{maxed ? ' MAX' : `/${u.maxLevel}`}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{u.description}</p>
                </div>
              </div>
              <ProgressBar value={lv / u.maxLevel} color="bg-gradient-to-r from-primary to-violet" height={5} />
              <div className="rounded-lg bg-bg-2/60 px-2.5 py-2 text-[11px]">
                <div className="text-[10px] font-bold text-ink-muted">현재</div>
                <div className="tnum font-bold leading-snug">{u.effectLabel(lv)}</div>
                {!maxed && (
                  <>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-ink-muted">
                      <Icon name="arrow-up" size={10} strokeWidth={2.4} />
                      {count > 1 ? `+${count}레벨` : '다음'}
                    </div>
                    <div className="tnum font-bold leading-snug text-[#5ee596]">{u.effectLabel(Math.min(u.maxLevel, lv + Math.max(1, count)))}</div>
                  </>
                )}
              </div>
              {locked ? (
                <div className="rounded-lg bg-bg-2 px-2.5 py-1.5 text-center text-[11px] font-bold text-ink-soft">레벨 {u.requiredLevel} 필요</div>
              ) : maxed ? (
                <div className="rounded-lg bg-gold-soft px-2.5 py-1.5 text-center text-[11px] font-bold text-[#ffd06a]">최대 레벨 달성</div>
              ) : (
                <Button
                  block
                  variant={can && recommended ? 'accent' : 'neutral'}
                  disabled={!can}
                  onClick={() => actions.buyUpgrade(u.id, buyMode)}
                  sub={formatMoney(cost)}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon name="arrow-up" size={13} strokeWidth={2.2} />
                    업그레이드{count > 1 ? ` x${count}` : ''}
                  </span>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
