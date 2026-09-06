import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { UPGRADES, upgradeCost } from '../../game/data/upgrades';
import { STAGES } from '../../game/data/stages';
import { formatMoney } from '../../game/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export function UpgradesPanel() {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const upgrades = useGame((s) => s.upgrades);
  const stage = useGame((s) => s.stage);
  const offlineEff = useDerived((d) => d.offlineEfficiency);
  const offlineCap = useDerived((d) => d.offlineCapHours);

  const nextStage = STAGES.find((s) => s.stage === stage + 1);
  const curStage = STAGES[stage - 1];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-black">업그레이드</h2>
        <p className="text-[11px] text-ink-soft">장비를 강화하고 공간을 넓혀 성장 속도를 올리세요. 오프라인 효율 {Math.round(offlineEff * 100)}% · 최대 {offlineCap}시간</p>
      </div>

      {/* 공간 확장 */}
      <div className="card relative overflow-hidden p-3">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet/20 blur-2xl" />
        <div className="flex items-start gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-2 text-2xl">{nextStage ? nextStage.icon : curStage.icon}</div>
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
              <div className="rounded-lg bg-bg-2 px-2.5 py-2 text-[11px] font-bold text-ink-soft">🔒 레벨 {nextStage.requiredLevel} 필요 (현재 Lv.{level})</div>
            ) : (
              <Button block variant="gold" disabled={money < nextStage.cost} onClick={() => actions.buyStage()}>
                🚚 {nextStage.name}(으)로 이사 · {formatMoney(nextStage.cost)}
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
          const lv = upgrades[u.id];
          const maxed = lv >= u.maxLevel;
          const locked = level < u.requiredLevel;
          const cost = maxed ? 0 : upgradeCost(u, lv);
          const can = !locked && !maxed && money >= cost;
          return (
            <div key={u.id} className={`card anim-slide-up flex flex-col gap-2 p-3 ${locked ? 'opacity-70' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-2 text-2xl">{locked ? '🔒' : u.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black">{u.name}</span>
                    <Badge tone={maxed ? 'gold' : 'slate'}>Lv.{lv}{maxed ? ' MAX' : `/${u.maxLevel}`}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{u.description}</p>
                </div>
              </div>
              <ProgressBar value={lv / u.maxLevel} color="bg-gradient-to-r from-primary to-violet" height={5} />
              <div className="grid grid-cols-1 gap-0.5 text-[11px]">
                <div className="flex justify-between gap-2"><span className="shrink-0 whitespace-nowrap text-ink-muted">현재</span><span className="text-right font-bold">{u.effectLabel(lv)}</span></div>
                {!maxed && <div className="flex justify-between gap-2"><span className="shrink-0 whitespace-nowrap text-ink-muted">다음</span><span className="text-right font-bold text-[#5ee596]">{u.effectLabel(lv + 1)}</span></div>}
              </div>
              {locked ? (
                <div className="rounded-lg bg-bg-2 px-2.5 py-1.5 text-center text-[11px] font-bold text-ink-soft">레벨 {u.requiredLevel} 필요</div>
              ) : maxed ? (
                <div className="rounded-lg bg-gold-soft px-2.5 py-1.5 text-center text-[11px] font-bold text-[#ffd06a]">최대 레벨 달성</div>
              ) : (
                <Button block disabled={!can} onClick={() => actions.buyUpgrade(u.id)}>
                  ⬆️ 업그레이드 · {formatMoney(cost)}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
