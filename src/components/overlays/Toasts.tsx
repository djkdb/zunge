import { useUi } from '../../hooks/useGame';
import { dismissToast } from '../../game/store';

const TONE = {
  good: 'border-mint/40 bg-[#10241c]/95',
  bad: 'border-rose/40 bg-[#2a1220]/95',
  neutral: 'border-line-2 bg-card/95',
};

export function Toasts() {
  const toasts = useUi((u) => u.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[64px] z-40 flex flex-col items-center gap-1.5 px-3 md:top-20">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`anim-slide-down pointer-events-auto flex w-full max-w-[320px] items-start gap-2 rounded-xl border px-2.5 py-1.5 text-left shadow-pop backdrop-blur ${TONE[t.tone]}`}
        >
          <span className="text-base leading-none">{t.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-black">{t.title}</div>
            <div className="line-clamp-2 text-[10px] leading-snug text-ink-soft">{t.message}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
