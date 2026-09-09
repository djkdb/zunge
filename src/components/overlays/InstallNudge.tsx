import { useEffect, useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { dismissInstallHint, installHintDismissed, onInstallChange, useInstall } from '../../hooks/useInstall';
import { InstallGuide } from './InstallGuide';
import { Icon } from '../ui/Icon';

/**
 * "앱으로 쓸 수 있어요" 한 줄 안내.
 *
 * 처음 들어온 사람에게 곧바로 들이밀지 않는다. 게임이 재미있는지도 모르는데
 * 설치부터 권하면 그냥 닫힌다. 두 번째 프로젝트를 출시해 루프를 한 바퀴
 * 돌아본 뒤에 한 번만 띄우고, 닫으면 다시 꺼내지 않는다.
 * 이후에는 설정에 있는 항목으로 언제든 볼 수 있다.
 */
export function InstallNudge() {
  const launched = useGame((s) => s.stats.projectsCompleted);
  const { platform } = useInstall();
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const [gone, setGone] = useState(() => installHintDismissed());

  // 설정에서 방법을 열어봤다면 그 즉시 거둬들인다
  useEffect(() => onInstallChange(() => setGone(installHintDismissed())), []);

  useEffect(() => {
    if (gone || open) return;
    if (platform.method === 'installed') return;
    if (launched < 2) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [launched, platform.method, gone, open]);

  const close = () => {
    setOpen(false);
    setGone(true);
    dismissInstallHint();
  };

  if (gone && !guide) return null;
  

  return (
    <>
      {open && !guide && (
        <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-[60px] z-40 flex justify-center px-3 md:bottom-4">
          <div className="anim-slide-up card pointer-events-auto flex w-full max-w-[360px] items-center gap-2.5 p-2.5 shadow-pop">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-[#8ab8ff]">
              <Icon name="phone" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-black leading-tight">앱처럼 쓸 수 있어요</div>
              <div className="text-[11px] leading-snug text-ink-soft">홈 화면에 추가하면 오프라인에서도 켜집니다</div>
            </div>
            <button
              type="button"
              onClick={() => setGuide(true)}
              className="btn btn-accent shrink-0 px-3 py-1.5 text-[12px]"
            >
              방법 보기
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="안내 닫기"
              className="btn btn-quiet h-9 w-9 shrink-0 p-0 text-ink-muted"
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
