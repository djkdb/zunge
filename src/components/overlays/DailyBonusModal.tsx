import { useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { dailyAvailable, dailyReward } from '../../game/engine';
import { DAILY_MAX_STREAK } from '../../game/constants';
import { formatMoney } from '../../game/format';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Confetti } from './Confetti';

export function DailyBonusModal() {
  const open = useUi((u) => u.dailyOpen);
  const state = useGame((s) => s);
  if (!open) return null;

  const now = Date.now();
  const available = dailyAvailable(state, now);
  const { money, streak } = dailyReward(state, now);
  const shownStreak = available ? streak : state.dailyStreak;

  return (
    <Modal open onClose={() => actions.closeDaily()}>
      <div className="card relative overflow-hidden p-5 text-center">
        {available && <Confetti count={20} />}
        <div className="relative">
          <div className="text-pixel text-[10px] tracking-[0.2em] text-[#ffd06a]">DAILY BONUS</div>
          <h3 className="mt-1 text-lg font-black">🎁 출석 보상</h3>
          <p className="text-[11px] text-ink-soft">매일 접속하면 보상이 커집니다. 연속 {DAILY_MAX_STREAK}일이 최대예요.</p>

          <div className="my-4 flex justify-center gap-1.5">
            {Array.from({ length: DAILY_MAX_STREAK }).map((_, i) => {
              const day = i + 1;
              const done = day <= shownStreak;
              const isToday = available && day === streak;
              return (
                <div
                  key={day}
                  className={`flex h-11 w-9 flex-col items-center justify-center rounded-lg text-[10px] font-bold ${
                    isToday ? 'bg-gradient-to-b from-gold to-coral text-navy-deep' : done ? 'bg-mint-soft text-[#5ee596]' : 'bg-bg-2 text-ink-muted'
                  }`}
                >
                  <span className="text-sm">{done ? '✅' : '🎁'}</span>
                  <span>{day}일</span>
                </div>
              );
            })}
          </div>

          {available ? (
            <>
              <div className="rounded-xl bg-bg-2 px-3 py-2.5">
                <div className="text-[11px] font-bold text-ink-soft">{streak}일 연속 출석 보상</div>
                <div className="tnum text-xl font-black text-[#ffd06a]">{formatMoney(money)}</div>
              </div>
              <Button block variant="gold" size="lg" className="mt-4" onClick={() => { actions.claimDaily(); actions.closeDaily(); }}>
                보상 받기
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-bg-2 px-3 py-2.5 text-[11px] font-bold text-ink-soft">
                오늘 보상은 이미 받았어요. 내일 다시 만나요!
              </div>
              <Button block variant="secondary" size="lg" className="mt-4" onClick={() => actions.closeDaily()}>닫기</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
