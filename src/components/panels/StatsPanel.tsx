import { useDerived, useGame, useUi } from '../../hooks/useGame';
import { PROJECTS } from '../../game/data/projects';
import { LEVEL_TITLES, levelTitle } from '../../game/data/levels';
import { PETS } from '../../game/data/pets';
import { STAGES } from '../../game/data/stages';
import { projectIncomeAt } from '../../game/calc';
import { formatDuration, formatMoney, formatNumber, formatRate, formatUsers } from '../../game/format';
import { Badge } from '../ui/Badge';

export function StatsPanel() {
  const stats = useGame((s) => s.stats);
  const level = useGame((s) => s.level);
  const stage = useGame((s) => s.stage);
  const projectLevels = useGame((s) => s.projectLevels);
  const createdAt = useGame((s) => s.createdAt);
  const d = useDerived();
  const logs = useUi((u) => u.logs);

  const launched = PROJECTS.filter((p) => (projectLevels[p.id] ?? 0) > 0).map((p) => ({ p, v: projectLevels[p.id], income: projectIncomeAt(p, projectLevels[p.id]) }));
  const totalBase = launched.reduce((s, l) => s + l.income, 0);
  const days = Math.max(1, Math.floor((Date.now() - createdAt) / 86400000) + 1);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-black">통계</h2>
        <p className="text-[11px] text-ink-soft">ZUN의 개발자 여정 · {days}일째 · Lv.{level} {levelTitle(level)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Tile icon="💰" label="총 수익" value={formatMoney(stats.totalEarned)} />
        <Tile icon="📈" label="초당 수익" value={formatRate(d.incomePerSec)} />
        <Tile icon="🏆" label="최고 초당 수익" value={formatRate(stats.bestIncome)} />
        <Tile icon="👥" label="최다 사용자" value={formatUsers(stats.peakUsers)} />
        <Tile icon="🚀" label="출시 횟수" value={`${stats.projectsCompleted}회`} />
        <Tile icon="🐛" label="수정한 버그" value={`${stats.bugsFixed}개`} />
        <Tile icon="🎲" label="발생한 이벤트" value={`${stats.eventsTriggered}회`} />
        <Tile icon="⏱️" label="플레이 시간" value={formatDuration(stats.playTime)} />
        <Tile icon="💤" label="오프라인 수익" value={formatMoney(stats.offlineEarned)} />
      </div>

      <div className="card p-3">
        <div className="mb-2 text-xs font-black">수익 구성</div>
        <div className="flex flex-col gap-1.5 text-[11px]">
          <Bar label="프로젝트 수익" value={d.projectIncome} total={d.incomePerSec} color="bg-primary" />
          <Bar label="사용자 광고 수익" value={d.userIncome} total={d.incomePerSec} color="bg-mint" />
          <div className="mt-1 flex justify-between text-ink-muted"><span>수익 배율</span><span className="tnum font-bold text-ink">x{d.incomeMult.toFixed(2)}</span></div>
          <div className="flex justify-between text-ink-muted"><span>사용자 유입</span><span className="tnum font-bold text-ink">{formatNumber(d.userGrowthPerSec)}명/초</span></div>
        </div>
      </div>

      <div className="card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-black">출시한 서비스 ({launched.length}/{PROJECTS.length})</span>
          <span className="text-[10px] font-bold text-ink-muted">기본 수익 합계 {formatRate(totalBase)}</span>
        </div>
        {launched.length === 0 ? (
          <div className="text-[11px] text-ink-soft">아직 출시한 서비스가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {launched.map(({ p, v, income }) => (
              <div key={p.id} className="flex items-center gap-2 text-[11px]">
                <span className="w-5 text-center">{p.icon}</span>
                <span className="flex-1 truncate font-bold">{p.name}</span>
                <Badge tone="gold">v{v}</Badge>
                <span className="tnum w-24 text-right font-bold text-[#5ee596]">{formatRate(income)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-3">
          <div className="mb-2 text-xs font-black">레벨 타이틀</div>
          <div className="flex flex-col gap-1">
            {LEVEL_TITLES.map((t) => (
              <div key={t.level} className={`flex items-center justify-between text-[11px] ${level >= t.level ? 'text-ink' : 'text-ink-muted'}`}>
                <span>{level >= t.level ? '✅' : '⬜'} Lv.{t.level}</span>
                <span className="font-bold">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-3">
          <div className="mb-2 text-xs font-black">공간 & 펫</div>
          <div className="flex flex-col gap-1">
            {STAGES.map((s) => (
              <div key={s.stage} className={`flex items-center justify-between text-[11px] ${stage >= s.stage ? 'text-ink' : 'text-ink-muted'}`}>
                <span>{stage >= s.stage ? s.icon : '🔒'} STAGE {s.stage}</span>
                <span className="font-bold">{s.name}</span>
              </div>
            ))}
            <div className="mt-1 flex flex-wrap gap-1">
              {PETS.map((p) => (
                <Badge key={p.id} tone={level >= p.requiredLevel ? 'mint' : 'slate'} className={level >= p.requiredLevel ? '' : 'opacity-60'}>
                  {level >= p.requiredLevel ? p.icon : '🔒'} {p.name} · Lv.{p.requiredLevel}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="mb-2 text-xs font-black">활동 로그</div>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1 text-[11px]">
          {logs.length === 0 && <div className="text-ink-soft">아직 기록이 없습니다.</div>}
          {logs.map((l) => (
            <div key={l.id} className={`flex gap-1.5 ${l.tone === 'good' ? 'text-[#5ee596]' : l.tone === 'bad' ? 'text-[#ff8aa1]' : 'text-ink-soft'}`}>
              <span className="shrink-0 tnum text-ink-muted">{new Date(l.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{l.icon}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-2 px-3 py-2">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-ink-muted">{label}</div>
        <div className="tnum truncate text-xs font-black">{value}</div>
      </div>
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? value / total : 0;
  return (
    <div>
      <div className="flex justify-between"><span className="text-ink-muted">{label}</span><span className="tnum font-bold">{formatRate(value)} ({Math.round(pct * 100)}%)</span></div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 100}%` }} /></div>
    </div>
  );
}
