import { useEffect, useState } from 'react';
import { useDerived, useGame } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { AI_TIERS, aiTier } from '../../game/data/ai';
import { PROJECT_MAP, PROJECTS } from '../../game/data/projects';
import { formatMoney } from '../../game/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PixelSprite } from '../scene/PixelSprite';
import { ROBOT_ROWS, robotPalette } from '../scene/sprites';
import { ProgressBar } from '../ui/ProgressBar';

const VERBS = ['컴포넌트 생성', '테스트 작성', 'API 연동', '버그 분석', '리팩토링', '타입 정리', '성능 최적화', '배포 스크립트 작성', '문서 작성', '데이터 모델 설계'];

export function AiPanel() {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const tier = useGame((s) => s.aiTier);
  const activeDevs = useGame((s) => s.activeDevs);
  const devSpeed = useDerived((d) => d.devSpeed);
  const cur = aiTier(tier);
  const next = AI_TIERS.find((t) => t.tier === tier + 1);

  // AI 작업 로그 (실제 개발 중인 프로젝트 기준으로 생성)
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    if (activeDevs.length === 0) {
      setLog([]);
      return;
    }
    let id = 0;
    const push = () => {
      const dev = activeDevs[Math.floor(Math.random() * activeDevs.length)];
      const p = PROJECT_MAP[dev.projectId];
      const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
      const line = dev.bugged ? `🐛 ${p.name}: 버그 원인 추적 중... 스택 트레이스 분석` : `${cur.icon} ${p.name}: ${verb} 완료 (${Math.floor(dev.progress * 100)}%)`;
      id += 1;
      setLog((l) => [{ id: Date.now() + id, text: line }, ...l].slice(0, 8));
    };
    push();
    const t = setInterval(push, 1800);
    return () => clearInterval(t);
    // activeDevs 갱신마다 재시작하지 않도록 길이/버그 여부만 의존
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDevs.length, activeDevs.map((a) => a.bugged).join(','), cur.icon]);

  const unlocks = next ? PROJECTS.filter((p) => p.requiredAi === next.tier) : [];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-black">AI</h2>
        <p className="text-[11px] text-ink-soft">AI는 ZUN의 개발 파트너입니다. 등급이 오를수록 더 빠르고, 더 싸고, 더 안정적으로 개발합니다.</p>
      </div>

      {/* 현재 AI */}
      <div className="card relative overflow-hidden p-3">
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full blur-3xl" style={{ background: cur.color, opacity: 0.25 }} />
        <div className="relative flex items-center gap-3">
          <div className="anim-bob flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-bg-2">
            <PixelSprite rows={ROBOT_ROWS} palette={robotPalette(cur.color)} scale={4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black">{cur.name}</span>
              <Badge tone="primary">Tier {cur.tier}</Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-ink-soft">{cur.description}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <Eff k="개발 속도" v={`x${cur.devSpeedMult}`} />
              <Eff k="비용 절감" v={`${Math.round(cur.costReduction * 100)}%`} />
              <Eff k="버그 위험 감소" v={`${Math.round(cur.successBonus * 100)}%`} />
              <Eff k="수익 배율" v={`x${cur.incomeMult}`} />
            </div>
          </div>
        </div>
        <div className="relative mt-2 rounded-lg bg-bg-2 px-2.5 py-1.5 text-[11px] font-bold text-ink-soft">
          총 개발력 <span className="text-[#b9a6ff]">x{devSpeed.toFixed(2)}</span> · 현재 {activeDevs.length}개 프로젝트 작업 중
        </div>
      </div>

      {/* 작업 로그 */}
      <div className="card p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-black">🖥️ AI 작업 로그</span>
          {activeDevs.length > 0 && <span className="flex items-center gap-1 text-[10px] font-bold text-[#5ee596]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> LIVE</span>}
        </div>
        <div className="rounded-lg bg-navy-deep p-2 font-mono text-[11px] leading-relaxed text-[#9fd3ff]">
          {log.length === 0 ? (
            <div className="text-ink-muted">$ 대기 중... 프로젝트를 시작하면 AI가 작업을 시작합니다<span className="anim-blink">▌</span></div>
          ) : (
            log.map((l, i) => (
              <div key={l.id} className={i === 0 ? 'anim-slide-down text-white' : 'opacity-70'}>$ {l.text}</div>
            ))
          )}
        </div>
      </div>

      {/* 다음 AI */}
      {next ? (
        <div className="card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bg-2">
              <PixelSprite rows={ROBOT_ROWS} palette={robotPalette(next.color)} scale={3} className={level < next.requiredLevel ? 'opacity-40 grayscale' : ''} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black">{next.name}</span>
                <Badge tone="violet">다음 등급</Badge>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-soft">{next.description}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <Eff k="개발 속도" v={`x${cur.devSpeedMult} → x${next.devSpeedMult}`} good />
                <Eff k="비용 절감" v={`${Math.round(next.costReduction * 100)}%`} good />
                <Eff k="버그 위험 감소" v={`${Math.round(next.successBonus * 100)}%`} good />
                <Eff k="수익 배율" v={`x${next.incomeMult}`} good />
              </div>
            </div>
          </div>
          {unlocks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-[10px] font-bold text-ink-muted">해금:</span>
              {unlocks.map((p) => <Badge key={p.id} tone="slate">{p.icon} {p.name}</Badge>)}
            </div>
          )}
          <div className="mt-2.5">
            {level < next.requiredLevel ? (
              <div className="rounded-lg bg-bg-2 px-2.5 py-2 text-[11px] font-bold text-ink-soft">🔒 레벨 {next.requiredLevel} 필요 (현재 Lv.{level})</div>
            ) : (
              <>
                <Button block variant="gold" disabled={money < next.cost} onClick={() => actions.buyAi()}>
                  {next.icon} {next.name} 도입 · {formatMoney(next.cost)}
                </Button>
                {money < next.cost && (
                  <div className="mt-1.5">
                    <ProgressBar value={money / next.cost} color="bg-gradient-to-r from-gold to-coral" height={5} />
                    <div className="mt-0.5 text-right text-[10px] font-bold text-ink-muted">{formatMoney(next.cost - money)} 부족</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-3 text-center text-xs font-bold text-ink-soft">🌌 최고 등급 AI를 보유하고 있습니다. AI가 스스로 개발합니다.</div>
      )}

      {/* 로드맵 */}
      <div className="card p-3">
        <div className="mb-2 text-xs font-black">AI 로드맵</div>
        <div className="flex flex-col gap-1.5">
          {AI_TIERS.map((t) => {
            const owned = t.tier <= tier;
            const isCur = t.tier === tier;
            return (
              <div key={t.tier} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${isCur ? 'bg-primary-soft' : owned ? 'opacity-80' : 'opacity-50'}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.color }} />
                <span className="w-5">{t.icon}</span>
                <span className="flex-1 font-bold">{t.name}</span>
                <span className="text-ink-muted">Lv.{t.requiredLevel}</span>
                <span className="tnum font-bold">{owned ? (isCur ? '사용 중' : '보유') : formatMoney(t.cost)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Eff({ k, v, good }: { k: string; v: string; good?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink-muted">{k}</span>
      <span className={`tnum font-bold ${good ? 'text-[#5ee596]' : ''}`}>{v}</span>
    </div>
  );
}
