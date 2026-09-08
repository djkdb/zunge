export type Tab = 'home' | 'projects' | 'upgrades' | 'ai' | 'growth' | 'settings';

export const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'projects', icon: '📋', label: '프로젝트' },
  { id: 'upgrades', icon: '⬆️', label: '업그레이드' },
  { id: 'ai', icon: '🤖', label: 'AI' },
  { id: 'growth', icon: '🏆', label: '성장' },
  { id: 'settings', icon: '⚙️', label: '설정' },
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
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${active ? 'text-[#8ab8ff]' : 'text-ink-muted'}`}
            >
              <span className={`text-lg transition-transform ${active ? 'scale-110' : ''}`}>{t.icon}</span>
              <span>{t.label}</span>
              {badges[t.id] && <span className="absolute right-[22%] top-2 h-2 w-2 rounded-full bg-coral shadow-[0_0_8px_rgba(255,122,89,0.9)]" />}
              {active && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#5b9dff]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SideTabs({ tab, onChange, badges }: { tab: Tab; onChange: (t: Tab) => void; badges: Partial<Record<Tab, boolean>> }) {
  return (
    <div className="hidden gap-1 rounded-xl bg-bg-2 p-1 md:flex">
      {TABS.filter((t) => t.id !== 'home').map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            data-tut={`tab-${t.id}`}
            className={`btn-press relative flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors lg:text-xs ${active ? 'bg-card-2 text-white shadow' : 'text-ink-muted hover:text-ink-soft'}`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {badges[t.id] && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-coral" />}
          </button>
        );
      })}
    </div>
  );
}
