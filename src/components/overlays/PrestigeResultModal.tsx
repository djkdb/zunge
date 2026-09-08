import { useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { INSIGHT_DEV_PER, INSIGHT_INCOME_PER } from '../../game/constants';
import { formatPercent } from '../../game/format';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Confetti } from './Confetti';
import { ZunSprite } from '../scene/ZunSprite';

export function PrestigeResultModal() {
  const gained = useUi((u) => u.prestigeResult);
  const insight = useGame((s) => s.insight);
  const count = useGame((s) => s.prestigeCount);
  if (gained === null) return null;

  return (
    <Modal open onClose={() => actions.closePrestigeResult()}>
      <div className="card relative overflow-hidden p-5 text-center">
        <Confetti count={30} />
        <div className="relative">
          <div className="text-pixel text-[10px] tracking-[0.25em] text-[#b9a6ff]">REBOOT #{count}</div>
          <h3 className="mt-1 text-lg font-black">회사를 다시 세웠습니다</h3>
          <p className="text-[11px] text-ink-soft">경험은 인사이트로 남았습니다. 이번엔 훨씬 빠를 거예요.</p>
          <div className="my-3 flex justify-center"><ZunSprite mood="confident" scale={3} /></div>
          <div className="grid gap-2">
            <div className="anim-pop flex items-center justify-between rounded-xl bg-bg-2 px-3 py-2.5">
              <span className="text-xs font-bold text-ink-soft">💡 획득한 인사이트</span>
              <span className="tnum text-base font-black text-[#b9a6ff]">+{gained}</span>
            </div>
            <div className="anim-pop flex items-center justify-between rounded-xl bg-bg-2 px-3 py-2.5">
              <span className="text-xs font-bold text-ink-soft">보유 인사이트</span>
              <span className="tnum text-base font-black">{insight}</span>
            </div>
            <div className="anim-pop flex items-center justify-between rounded-xl bg-mint-soft px-3 py-2.5">
              <span className="text-xs font-bold text-[#5ee596]">영구 보너스</span>
              <span className="tnum text-sm font-black text-[#5ee596]">
                수익 +{formatPercent(insight * INSIGHT_INCOME_PER)} · 개발 +{formatPercent(insight * INSIGHT_DEV_PER)}
              </span>
            </div>
          </div>
          <Button block variant="gold" size="lg" className="mt-4" onClick={() => actions.closePrestigeResult()}>다시 시작!</Button>
        </div>
      </div>
    </Modal>
  );
}
