import { useEffect, useLayoutEffect, useState } from 'react';
import { useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { TUTORIAL_MAP } from '../../game/data/tutorials';
import { Button } from '../ui/Button';
import { ZunPortrait } from '../scene/ZunSprite';

interface Rect { top: number; left: number; width: number; height: number }

/** data-tut 값을 가진 요소의 화면상 위치 */
function useTargetRect(target: string | undefined, step: number): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      // 같은 앵커가 모바일/데스크톱 양쪽에 있으므로 실제로 보이는 쪽을 고른다
      const els = document.querySelectorAll<HTMLElement>(`[data-tut="${target}"]`);
      let found: DOMRect | null = null;
      els.forEach((el) => {
        if (found) return;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) found = r;
      });
      if (!found) {
        setRect(null);
        return;
      }
      const r: DOMRect = found;
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    // 탭 전환 직후에는 아직 렌더 전일 수 있어 다음 프레임에 다시 잰다
    measure();
    raf = requestAnimationFrame(measure);
    const t = setTimeout(measure, 220);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [target, step]);
  return rect;
}

export function TutorialOverlay() {
  const id = useUi((u) => u.tutorial);
  const step = useUi((u) => u.tutorialStep);
  const def = id ? TUTORIAL_MAP[id] : null;
  const current = def?.steps[step];
  const rect = useTargetRect(current?.target, step);

  useEffect(() => {
    if (!def) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        actions.nextTutorialStep();
      }
      if (e.key === 'Escape') actions.skipTutorial();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [def, step]);

  if (!def || !current) return null;
  const total = def.steps.length;
  const last = step === total - 1;
  const pad = 6;

  // 강조 영역을 피해 카드를 위/아래 중 공간이 넉넉한 쪽에 붙인다
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
  const CARD_H = 210;
  const placeBelow = !rect || rect.top + rect.height + pad + CARD_H + 16 < vh;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* 딤 + 스포트라이트 */}
      {rect ? (
        <>
          <div className="absolute inset-0 bg-navy-deep/78" style={{ clipPath: spotlightPath(rect, pad) }} />
          <div
            className="anim-pop pointer-events-none absolute rounded-xl border-2 border-[#ffd06a] shadow-[0_0_0_4px_rgba(245,183,51,0.25)]"
            style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-navy-deep/78" />
      )}

      {/* 안내 카드 */}
      <div
        className={`absolute inset-x-0 flex justify-center px-4 ${placeBelow ? '' : 'top-0'}`}
        style={placeBelow
          ? { top: rect ? Math.min(rect.top + rect.height + pad + 12, vh - CARD_H - 16) : '50%', transform: rect ? undefined : 'translateY(-50%)' }
          // 위쪽에 붙일 때는 노치·다이나믹 아일랜드 아래로 내린다
          : { top: `max(calc(var(--safe-top) + 12px), ${rect!.top - pad - CARD_H - 12}px)` }}
      >
        <div className="card anim-pop w-full max-w-sm p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <ZunPortrait pose={last ? 'thumbsup' : 'idea'} height={64} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8ab8ff]">
                  {def.intro ? '튜토리얼' : '새 기능'} {step + 1}/{total}
                </span>
                <button type="button" onClick={() => actions.skipTutorial()} className="text-[11px] font-bold text-ink-muted hover:text-ink-soft">
                  건너뛰기
                </button>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-black">
                <span className="text-lg">{current.icon}</span>
                <span>{current.title}</span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{current.body}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {def.steps.map((_, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#5b9dff]' : 'bg-white/15'}`} />
              ))}
            </div>
            <Button size="sm" variant={last ? 'gold' : 'accent'} onClick={() => actions.nextTutorialStep()}>
              {last ? '알겠어!' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 강조할 사각형에 구멍을 뚫는 clip-path.
 * 바깥 사각형을 돌다가 아래쪽에서 구멍으로 들어가 반대 방향으로 돈 뒤 되돌아 나온다.
 */
function spotlightPath(r: Rect, pad: number): string {
  const t = Math.max(0, r.top - pad);
  const l = Math.max(0, r.left - pad);
  const b = r.top + r.height + pad;
  const rt = r.left + r.width + pad;
  return [
    '0 0',
    '0 100%',
    `${l}px 100%`,
    `${l}px ${t}px`,
    `${rt}px ${t}px`,
    `${rt}px ${b}px`,
    `${l}px ${b}px`,
    `${l}px 100%`,
    '100% 100%',
    '100% 0',
  ].map((p) => p).join(', ').replace(/^/, 'polygon(') + ')';
}
