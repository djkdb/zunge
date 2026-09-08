import { Icon, type IconName } from '../ui/Icon';

export type Tab = 'home' | 'projects' | 'upgrades' | 'ai' | 'growth' | 'settings';

export const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'projects', icon: 'projects', label: '프로젝트' },
  { id: 'upgrades', icon: 'upgrades', label: '업그레이드' },
  { id: 'ai', icon: 'ai', label: 'AI' },
  { id: 'growth', icon: 'growth', label: '성장' },
  { id: 'settings', icon: 'settings', label: '설정' },
];

export function BottomNav({ tab, onChange, badges }: { tab: Tab; onChange: (t: Tab) => void; badges: Partial<Record<Tab, boolean>> }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-6">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              data-tut={`tab-${t.id}`}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors ${active ? 'text-[#9cc2ff]' : 'text-ink-muted'}`}
            >
              <Icon name={t.icon} size={20} strokeWidth={active ? 2 : 1.6} />
              <span className="tracking-tight">{t.label}</span>
              {badges[t.id] && <span className="absolute right-[24%] top-2 h-1.5 w-1.5 rounded-full bg-coral" />}
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[#5b9dff]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SideTabs({ tab, onChange, badges }: { tab: Tab; onChange: (t: Tab) => void; badges: Partial<Record<Tab, boolean>> }) {
  return (
    <div className="hidden gap-0.5 rounded-xl border border-line bg-bg-2 p-1 md:flex">
      {TABS.filter((t) => t.id !== 'home').map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            data-tut={`tab-${t.id}`}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors lg:text-xs ${active ? 'bg-card-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]' : 'text-ink-muted hover:text-ink-soft'}`}
          >
            <Icon name={t.icon} size={15} strokeWidth={active ? 2 : 1.6} />
            <span>{t.label}</span>
            {badges[t.id] && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-coral" />}
          </button>
        );
      })}
    </div>
  );
}
