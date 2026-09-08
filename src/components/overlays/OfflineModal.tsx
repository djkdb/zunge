import { useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { formatDuration, formatMoney, formatUsers } from '../../game/format';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ZunSprite } from '../scene/ZunSprite';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export function OfflineModal() {
  const report = useUi((u) => u.offlineReport);
  if (!report) return null;
  return (
    <Modal open onClose={undefined}>
      <div className="card relative overflow-hidden p-5 text-center">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="text-pixel text-[10px] tracking-[0.2em] text-[#8ab8ff]">WELCOME BACK</div>
          <h3 className="mt-1 text-lg font-black">부재중 동안 ZUN이 벌어들인 수익</h3>
          <p className="text-[11px] text-ink-soft">{formatDuration(report.seconds)} 동안 열심히 개발했어요! (효율 {Math.round(report.efficiency * 100)}%)</p>
          <div className="relative mx-auto my-3 flex h-32 items-end justify-center">
            <span className="absolute left-[30%] top-0 text-lg anim-drift">💤</span>
            <span className="absolute left-[36%] top-3 text-sm anim-drift" style={{ animationDelay: '0.7s' }}>z</span>
            <ZunSprite mood="happy" scale={2} />
          </div>
          <div className="grid gap-2">
            <Reward icon="💰" label="수익" value={<AnimatedNumber value={report.money} format={formatMoney} speed={0.08} className="text-[#ffd06a]" />} />
            {report.users > 0 && <Reward icon="👥" label="사용자" value={<span className="text-[#8ab8ff]">+{formatUsers(report.users)}</span>} />}
            {report.projects > 0 && <Reward icon="🚀" label="출시한 프로젝트" value={<span className="text-[#5ee596]">{report.projects}개</span>} />}
          </div>
          <Button block variant="gold" size="lg" className="mt-4" onClick={() => actions.closeOfflineReport()}>보상 받기</Button>
        </div>
      </div>
    </Modal>
  );
}

function Reward({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="anim-pop flex items-center justify-between rounded-xl bg-bg-2 px-3 py-2.5">
      <span className="text-xs font-bold text-ink-soft">{icon} {label}</span>
      <span className="tnum text-base font-black">{value}</span>
    </div>
  );
}
