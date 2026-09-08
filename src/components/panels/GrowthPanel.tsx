import { useState } from 'react';
import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { achievementRatio, canPrestige, prestigeGain, prestigeUnlocked } from '../../game/engine';
import { ACHIEVEMENTS } from '../../game/data/achievements';
import { ACHIEVEMENT_INCOME_PER, INSIGHT_DEV_PER, INSIGHT_INCOME_PER, PRESTIGE_MIN_EARNED, PRESTIGE_MIN_LEVEL } from '../../game/constants';
import { formatMoney, formatPercent, formatNumber } from '../../game/format';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { StatsPanel } from './StatsPanel';

type Sub = 'reboot' | 'achievements' | 'stats';

export function GrowthPanel() {
  const [sub, setSub] = useState<Sub>('reboot');
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-black">성장</h2>
        <p className="text-[11px] text-ink-soft">리부트로 영구 배율을 쌓고, 업적으로 보너스를 모으세요.</p>
      </div>
      <div className="flex rounded-xl bg-bg-2 p-1 text-xs font-bold">
        {([['reboot', '🔄 리부트'], ['achievements', '🏆 업적'], ['stats', '📊 통계']] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSub(k)}
            className={`btn-press flex-1 rounded-lg px-2 py-2 ${sub === k ? 'bg-card-2 text-white shadow' : 'text-ink-muted'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {sub === 'reboot' && <RebootSection />}
      {sub === 'achievements' && <AchievementsSection />}
      {sub === 'stats' && <StatsPanel embedded />}
    </div>
  );
}

function RebootSection() {
  const state = useGame((s) => s);
  const legacyIncome = useDerived((d) => d.legacyIncomeMult);
  const legacyDev = useDerived((d) => d.legacyDevMult);
  const [confirm, setConfirm] = useState(false);

  const unlocked = prestigeUnlocked(state);
  const gain = prestigeGain(state);
  const ready = canPrestige(state);
  const levelOk = state.level >= PRESTIGE_MIN_LEVEL;
  const earnedOk = state.runEarned >= PRESTIGE_MIN_EARNED;

  return (
    <div className="flex flex-col gap-3">
      <div className="card relative overflow-hidden p-4">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet/25 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <div>
              <div className="tnum text-sm font-black">인사이트 {formatNumber(state.insight)}</div>
              <div className="text-[11px] text-ink-soft">리부트 {state.prestigeCount}회 · 영구히 사라지지 않습니다</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <Tile label="영구 수익 배율" value={`x${legacyIncome.toFixed(2)}`} tone="mint" />
            <Tile label="영구 개발 배율" value={`x${legacyDev.toFixed(2)}`} tone="primary" />
            <Tile label="인사이트 효과" value={`수익 +${formatPercent(state.insight * INSIGHT_INCOME_PER)}`} />
            <Tile label="업적 효과" value={`수익 +${formatPercent(state.achievements.length * ACHIEVEMENT_INCOME_PER)}`} />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-xs font-black">🔄 리부트</div>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
          지금까지 이번 회차에 번 돈을 인사이트로 바꾸고 처음부터 다시 시작합니다.
          <b className="text-ink"> 자금 · 사용자 · 레벨 · 프로젝트 · 업그레이드 · AI · 공간이 초기화</b>되고,
          인사이트 · 업적 · 통계 · 설정은 그대로 남습니다.
        </p>

        <div className="mt-3 rounded-xl bg-bg-2 p-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">이번 회차 수익</span>
            <span className="tnum font-bold">{formatMoney(state.runEarned)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">획득 예정 인사이트</span>
            <span className="tnum text-base font-black text-[#b9a6ff]">+{formatNumber(gain)}</span>
          </div>
          {gain > 0 && (
            <div className="mt-1 text-right text-[10px] font-bold text-[#5ee596]">
              리부트 후 수익 +{formatPercent((state.insight + gain) * INSIGHT_INCOME_PER)} · 개발 +{formatPercent((state.insight + gain) * INSIGHT_DEV_PER)}
            </div>
          )}
        </div>

        {!unlocked ? (
          <div className="mt-3 flex flex-col gap-1 rounded-xl bg-bg-2 px-3 py-2.5 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-ink-soft"><Icon name="lock" size={12} />해금 조건</div>
            <Req ok={levelOk} label={`레벨 ${PRESTIGE_MIN_LEVEL} 달성`} now={`Lv.${state.level}`} />
            <Req ok={earnedOk} label={`이번 회차 누적 ${formatMoney(PRESTIGE_MIN_EARNED)}`} now={formatMoney(state.runEarned)} />
            <ProgressBar
              value={Math.min(1, (state.level / PRESTIGE_MIN_LEVEL + state.runEarned / PRESTIGE_MIN_EARNED) / 2)}
              color="bg-gradient-to-r from-violet to-primary"
              height={5}
              className="mt-1"
            />
          </div>
        ) : (
          <Button block variant="gold" size="lg" className="mt-3" disabled={!ready} onClick={() => setConfirm(true)}>
            {ready ? (
              <span className="flex items-center gap-1.5"><Icon name="loop" size={15} strokeWidth={2} />리부트하고 인사이트 +{gain} 받기</span>
            ) : (
              '인사이트를 1 이상 모아야 합니다'
            )}
          </Button>
        )}
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)}>
        <div className="card p-5 text-center">
          <div className="flex justify-center text-gold"><Icon name="loop" size={30} /></div>
          <h3 className="mt-2 text-base font-black">정말 리부트할까요?</h3>
          <p className="mt-1 text-xs text-ink-soft">
            진행도가 초기화되고 인사이트 <b className="text-[#b9a6ff]">+{gain}</b>을 받습니다. 되돌릴 수 없습니다.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="neutral" onClick={() => setConfirm(false)}>취소</Button>
            <Button variant="gold" onClick={() => { actions.prestige(); setConfirm(false); }}>리부트</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Req({ ok, label, now }: { ok: boolean; label: string; now: string }) {
  return (
    <div className={`flex items-center justify-between ${ok ? 'text-[#5ee596]' : 'text-ink-soft'}`}>
      <span>{ok ? '✅' : '⬜'} {label}</span>
      <span className="tnum">{now}</span>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'mint' | 'primary' }) {
  const color = tone === 'mint' ? 'text-[#5ee596]' : tone === 'primary' ? 'text-[#8ab8ff]' : '';
  return (
    <div className="rounded-lg bg-bg-2 px-2.5 py-1.5">
      <div className="text-[10px] font-bold text-ink-muted">{label}</div>
      <div className={`tnum text-xs font-black ${color}`}>{value}</div>
    </div>
  );
}

function AchievementsSection() {
  const state = useGame((s) => s);
  const done = state.achievements.length;
  return (
    <div className="flex flex-col gap-3">
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">🏆 업적 {done}/{ACHIEVEMENTS.length}</span>
          <Badge tone="mint">영구 수익 +{formatPercent(done * ACHIEVEMENT_INCOME_PER)}</Badge>
        </div>
        <ProgressBar value={done / ACHIEVEMENTS.length} color="bg-gradient-to-r from-gold to-coral" height={6} className="mt-2" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = state.achievements.includes(a.id);
          const ratio = achievementRatio(state, a);
          return (
            <div
              key={a.id}
              className={`card anim-slide-up flex items-start gap-2.5 p-3 ${unlocked ? '' : 'opacity-75'}`}
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${unlocked ? 'bg-gold-soft' : 'bg-bg-2 grayscale'}`}>
                {unlocked ? a.icon : <Icon name="lock" size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-black">{a.name}</span>
                  {unlocked && <Badge tone="gold">달성</Badge>}
                </div>
                <p className="text-[11px] leading-snug text-ink-soft">{a.description}</p>
                {!unlocked && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <ProgressBar value={ratio} color="bg-primary" height={4} className="flex-1" />
                    <span className="tnum shrink-0 text-[10px] font-bold text-ink-muted">{Math.floor(ratio * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
