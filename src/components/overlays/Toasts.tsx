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
    <div className="pointer-events-none fixed inset-x-0 top-[68px] z-40 flex flex-col items-center gap-2 px-3 md:top-20">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`anim-slide-down pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left shadow-pop backdrop-blur ${TONE[t.tone]}`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black">{t.title}</div>
            <div className="text-[11px] leading-snug text-ink-soft">{t.message}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
