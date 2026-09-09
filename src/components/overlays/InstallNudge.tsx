import { useEffect, useState } from 'react';
import { useGame, useUi } from '../../hooks/useGame';
import { dismissInstallHint, installHintDismissed, onInstallChange, useInstall } from '../../hooks/useInstall';
import { InstallGuide } from './InstallGuide';
import { Icon } from '../ui/Icon';

/**
 * "앱으로 쓸 수 있어요" 한 줄 안내.
 *
 * 첫 안내를 마치자마자 보여주되, 작게 둔다.
 * 탭바 위 여백에 한 줄로 얹어 게임 화면을 가리지 않고,
 * 한 번 닫으면 다시 꺼내지 않는다. 이후에는 설정에서 언제든 볼 수 있다.
 */
export function InstallNudge() {
  const seenIntro = useGame((s) => s.seenTutorials.includes('intro'));
  const tutorial = useUi((u) => u.tutorial);
  const { platform } = useInstall();
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const [gone, setGone] = useState(() => installHintDismissed());

  // 설정에서 방법을 열어봤다면 그 즉시 거둬들인다
  useEffect(() => onInstallChange(() => setGone(installHintDismissed())), []);

  useEffect(() => {
    if (gone || open) return;
    if (platform.method === 'installed') return;
    // 첫 안내를 보는 중에 끼어들지 않는다
    if (!seenIntro || tutorial) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [seenIntro, tutorial, platform.method, gone, open]);

  const close = () => {
    setOpen(false);
    setGone(true);
    dismissInstallHint();
  };

  if (gone && !guide) return null;

  return (
    <>
      {open && !guide && (
        <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-[58px] z-40 flex justify-center px-3 md:bottom-3">
          <div className="anim-slide-up pointer-events-auto flex w-full max-w-[340px] items-center gap-1.5 rounded-full border border-line-2 bg-card py-1 pl-2.5 pr-1 shadow-pop">
            <Icon name="phone" size={13} className="shrink-0 text-[#8ab8ff]" />
            <button
              type="button"
              onClick={() => setGuide(true)}
              className="min-w-0 flex-1 truncate py-1 text-left text-[11px] font-bold text-ink-soft"
            >
              홈 화면에 추가하면 앱처럼 쓸 수 있어요
            </button>
            <Icon name="chevron-right" size={12} className="shrink-0 text-ink-muted" />
            <button
              type="button"
              onClick={close}
              aria-label="안내 닫기"
              className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] leading-none text-ink-muted"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <InstallGuide open={guide} onClose={() => { setGuide(false); close(); }} />
    </>
  );
}
