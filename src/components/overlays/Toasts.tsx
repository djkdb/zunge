import { useUi } from '../../hooks/useGame';
import { dismissToast } from '../../game/store';

const TONE = {
  good: 'border-mint/40 bg-[#10241c]/95',
  bad: 'border-rose/40 bg-[#2a1220]/95',
  neutral: 'border-line-2 bg-card/95',
};

export function Toasts() {
  const toasts = useUi((u) => u.toasts);
  // 모바일에서는 씬(=ZUN)을 가리지 않도록 탭바 바로 위에 쌓는다
  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-[60px] z-40 flex flex-col items-center gap-1.5 px-3 md:inset-x-auto md:bottom-auto md:right-5 md:top-[116px] md:items-end">
      {toasts.slice(-3).map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`anim-slide-up pointer-events-auto md:anim-slide-down flex w-full max-w-[320px] items-start gap-2 rounded-xl border px-2.5 py-1.5 text-left shadow-pop backdrop-blur ${TONE[t.tone]}`}
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
