import { useDerived, useGame } from '../../hooks/useGame';
import { formatMoney, formatNumber, formatRate, formatUsers } from '../../game/format';
import { levelTitle } from '../../game/data/levels';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ProgressBar } from '../ui/ProgressBar';
import { Icon, type IconName } from '../ui/Icon';

export function TopBar() {
  const money = useGame((s) => s.money);
  const users = useGame((s) => s.users);
  const level = useGame((s) => s.level);
  const xp = useGame((s) => s.xp);
  const effects = useGame((s) => s.effects);
  const insight = useGame((s) => s.insight);
  const income = useDerived((d) => d.incomePerSec);
  const maxUsers = useDerived((d) => d.maxUsers);
  const xpToNext = useDerived((d) => d.xpToNext);
  const devSpeed = useDerived((d) => d.devSpeed);
  /*
   * 상한은 벽이 아니라 언덕이다. 넘어서면 유입이 줄어들 뿐 멈추지는 않으므로
   * "한계" 가 아니라 지금 얼마나 버거운지를 보여준다.
   */
  const overload = maxUsers > 0 ? users / maxUsers : 0;
  const strained = overload >= 0.95;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 md:px-5">
        {/* 로고 */}
        <h1 className="hidden shrink-0 flex-col leading-none md:flex">
          <span className="text-pixel text-[22px] font-bold tracking-wider text-white">
            <span className="text-[#5b9dff]">Z</span>UN
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] text-ink-muted">DREAM · CODE · BUILD · GROW</span>
        </h1>
        <h1 className="shrink-0 md:hidden">
          <span className="text-pixel text-lg font-bold tracking-wider text-white"><span className="text-[#5b9dff]">Z</span>UN</span>
        </h1>

        {/* 자원 */}
        <div className="flex min-w-0 flex-1 items-stretch gap-1.5 md:gap-2">
          <Stat tut="stat-money" icon="coin" tone="text-[#ffd06a]" label="자금" main={<AnimatedNumber value={money} format={formatMoney} className="text-[#ffd06a]" />} sub={<span className="text-[#5ee596]">+{formatRate(income)}</span>} />
          <Stat
            icon="users"
            tone="text-[#8ab8ff]"
            label="사용자"
            main={<AnimatedNumber value={users} format={formatUsers} className="text-[#8ab8ff]" />}
            sub={
              strained
                ? <span className="text-[#ff8aa1]">서버 과부하 {Math.round(overload * 100)}%</span>
                : <span>최대 {formatUsers(maxUsers)}</span>
            }
          />
          <Stat
            icon="bolt"
            tone="text-[#b9a6ff]"
            label="개발력"
            main={<span className="tnum text-[#b9a6ff]">x{devSpeed.toFixed(1)}</span>}
            sub={insight > 0 ? <span className="text-[#b9a6ff]">인사이트 {formatNumber(insight)}</span> : <span>Lv.{level} {levelTitle(level)}</span>}
            className="hidden sm:flex"
          />
        </div>

        {/* 레벨 */}
        <div className="flex w-[88px] shrink-0 flex-col gap-1 md:w-[130px]">
          <div className="flex items-center justify-between gap-1 text-[10px] font-bold leading-none">
            <span className="text-[#ffd06a]">Lv.{level}</span>
            <span className="tnum truncate text-ink-muted">{Number.isFinite(xpToNext) ? `${Math.floor((xp / xpToNext) * 100)}%` : 'MAX'}</span>
          </div>
          <ProgressBar value={Number.isFinite(xpToNext) ? xp / xpToNext : 1} color="bg-gradient-to-r from-[#ffd06a] to-[#ff8a3d]" height={6} />
          <div className="truncate text-[10px] font-bold leading-none text-ink-soft sm:hidden">{levelTitle(level)}</div>
        </div>
      </div>
      {effects.length > 0 && (
        <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-3 pb-1.5 no-scrollbar md:px-5">
          {effects.map((e) => (
            <EffectChip key={e.eventId} icon={e.icon} title={e.title} mult={e.mult} endsAt={e.endsAt} />
          ))}
        </div>
      )}
    </header>
  );
}

function Stat({ icon, tone, label, main, sub, className = '', tut }: { icon: IconName; tone: string; label: string; main: React.ReactNode; sub: React.ReactNode; className?: string; tut?: string }) {
  return (
    <div data-tut={tut} className={`card-2 flex min-w-0 flex-1 items-center gap-2 px-2 py-1 md:px-3 ${className}`}>
      <Icon name={icon} size={17} className={tone} />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[9px] font-bold uppercase tracking-wide text-ink-muted">{label}</span>
        <span className="truncate text-xs font-black md:text-sm">{main}</span>
        <span className="truncate text-[10px] font-semibold text-ink-soft">{sub}</span>
      </div>
    </div>
  );
}

function EffectChip({ icon, title, mult, endsAt }: { icon: string; title: string; mult: number; endsAt: number }) {
  const remain = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  const good = mult >= 1;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${good ? 'bg-mint-soft text-[#5ee596]' : 'bg-rose-soft text-[#ff8aa1]'}`}>
      {icon} {title} x{mult} · {remain}s
    </span>
  );
}
