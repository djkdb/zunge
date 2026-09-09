import { useEffect, useState } from 'react';
import { dismissInstallHint, useInstall } from '../../hooks/useInstall';
import type { InstallMethod } from '../../game/platform';
import { Modal } from '../ui/Modal';
import { Icon, type IconName } from '../ui/Icon';
import { ZunPortrait } from '../scene/ZunSprite';

interface Step {
  icon: IconName;
  /** 굵게 나오는 조작 */
  action: string;
  /** 덧붙이는 설명 */
  hint?: string;
}

/** 눌러야 하는 버튼이 화면 어디에 있는가 */
type Corner = 'top-right' | 'bottom-right' | 'bottom-center' | 'top-bar';

interface Guide {
  title: string;
  lead: string;
  steps: Step[];
  /** 설치가 불가능한 상황이라 방법 자체를 바꿔야 할 때 */
  warn?: string;
  /**
   * 눌러야 하는 메뉴 버튼이 화면 어느 구석에 있는가.
   * 글로 "메뉴를 누르세요" 라고만 하면 어디를 봐야 할지 모른다.
   */
  corner?: Corner;
  /** 다른 브라우저로 옮겨가야 하는 상황이라 주소 복사가 실질적인 탈출구다 */
  copyUrl?: boolean;
}

/**
 * 설치 방법은 기기·브라우저마다 완전히 다르다.
 * 지금 이 사람이 실제로 할 수 있는 절차만 보여준다.
 */
function guideFor(method: InstallMethod, appName: string, ios: boolean, canPrompt: boolean): Guide {
  /*
   * 설치 창을 띄울 수 있는 브라우저라도 이벤트가 항상 오지는 않는다.
   * (조건을 아직 못 채웠거나, 이미 한 번 설치했다 지웠거나 …)
   * 그때 "아래 버튼을 누르세요" 라고 하면 없는 버튼을 찾게 만든다.
   */
  if (method === 'prompt' && !canPrompt) {
    return {
      title: '메뉴에서 추가할 수 있어요',
      lead: `${appName} 메뉴에서 홈 화면에 넣을 수 있습니다.`,
      corner: 'top-right',
      steps: [
        { icon: 'menu', action: '주소창 옆 ⋮ 메뉴 누르기' },
        { icon: 'plus-square', action: '"앱 설치" 또는 "홈 화면에 추가" 선택' },
        { icon: 'check', action: '확인 창에서 "설치" 누르기' },
      ],
    };
  }

  switch (method) {
    case 'installed':
      return {
        title: '이미 앱으로 실행 중이에요',
        lead: '홈 화면에서 열고 있어요. 주소창 없이 전체 화면으로 돌아가고, 네트워크가 없어도 켜집니다.',
        steps: [],
      };

    case 'prompt':
      return {
        title: '한 번만 누르면 앱이 됩니다',
        lead: `${appName}이 설치를 도와줍니다. 아래 버튼을 누르면 확인 창이 떠요.`,
        steps: [
          { icon: 'download', action: '아래 "홈 화면에 추가" 누르기' },
          { icon: 'check', action: '확인 창에서 "설치" 선택' },
        ],
      };

    case 'ios-safari':
      return {
        title: '홈 화면에 추가하기',
        lead: '아이폰·아이패드에서는 사파리의 공유 메뉴로 추가합니다.',
        corner: 'bottom-center',
        steps: [
          { icon: 'share-ios', action: '화면 아래 가운데 공유 버튼 누르기', hint: '네모에서 화살표가 위로 나온 모양' },
          { icon: 'plus-square', action: '메뉴를 내려 "홈 화면에 추가" 선택' },
          { icon: 'check', action: '오른쪽 위 "추가" 누르기' },
        ],
      };

    case 'ios-other':
      return {
        title: '사파리로 열어야 해요',
        lead: `아이폰은 사파리에서만 홈 화면에 추가할 수 있어요. 지금은 ${appName}으로 보고 있습니다.`,
        warn: `${appName}에서는 홈 화면 추가 메뉴가 나오지 않습니다.`,
        copyUrl: true,
        steps: [
          { icon: 'external', action: '아래 "주소 복사" 를 누르고 사파리에서 붙여넣기' },
          { icon: 'share-ios', action: '사파리 아래 공유 버튼 누르기' },
          { icon: 'plus-square', action: '"홈 화면에 추가" 선택' },
        ],
      };

    case 'in-app':
      return {
        title: `${appName} 밖에서 열면 앱이 됩니다`,
        lead: `${appName} 안에 들어 있는 브라우저는 홈 화면 추가를 지원하지 않아요. 밖으로 한 번만 나가면 됩니다.`,
        warn: '앱 안 브라우저는 저장 데이터도 따로 관리돼요. 밖에서 열면 진행이 새로 시작될 수 있으니, 설정에서 저장 코드를 먼저 복사해 두세요.',
        // iOS 인앱 브라우저는 ··· 이 오른쪽 아래, 안드로이드는 ⋮ 가 오른쪽 위에 있다
        corner: ios ? 'bottom-right' : 'top-right',
        copyUrl: true,
        steps: ios
          ? [
              { icon: 'menu', action: '오른쪽 아래 ··· 누르기', hint: '점 세 개 또는 공유 모양' },
              { icon: 'external', action: '"외부 브라우저에서 열기" 또는 "Safari로 열기"' },
              { icon: 'share-ios', action: '사파리에서 공유 → "홈 화면에 추가"' },
            ]
          : [
              { icon: 'menu', action: '오른쪽 위 ⋮ 누르기', hint: '점 세 개 모양' },
              { icon: 'external', action: '"다른 브라우저로 열기" 또는 "Chrome으로 열기"' },
              { icon: 'download', action: '크롬에서 "앱 설치" 또는 "홈 화면에 추가"' },
            ],
      };

    case 'android-menu':
      return {
        title: '메뉴에서 추가할 수 있어요',
        lead: `${appName}은 설치 창을 따로 띄우지 않지만, 메뉴에서 홈 화면에 넣을 수 있습니다.`,
        corner: 'top-right',
        steps: [
          { icon: 'menu', action: '주소창 옆 ⋮ 메뉴 누르기' },
          { icon: 'plus-square', action: '"홈 화면에 추가" 또는 "설치" 선택' },
          { icon: 'check', action: '이름을 확인하고 "추가" 누르기' },
        ],
      };

    case 'mac-safari':
      return {
        title: 'Dock에 추가하기',
        lead: 'macOS 사파리에서는 Dock에 넣어 앱처럼 쓸 수 있어요.',
        corner: 'top-bar',
        steps: [
          { icon: 'share-ios', action: '주소창 오른쪽 공유 버튼 누르기' },
          { icon: 'plus-square', action: '"Dock에 추가" 선택' },
        ],
      };

    default:
      return {
        title: '이 브라우저는 설치를 지원하지 않아요',
        lead: '크롬 · 엣지 · 사파리에서 열면 앱처럼 설치할 수 있어요. 지금도 게임은 그대로 즐길 수 있습니다.',
        steps: [{ icon: 'external', action: '크롬이나 엣지에서 이 주소 열기' }],
      };
  }
}

/**
 * 눌러야 하는 버튼이 화면 어디에 있는지 그림으로 가리킨다.
 *
 * "메뉴를 누르세요" 만으로는 처음 온 사람이 어디를 봐야 할지 모른다.
 * 특히 인스타 DM 으로 들어오면 인앱 브라우저라 버튼 위치가 평소와 다르다.
 * 브라우저마다 버튼 모양도 자리도 달라서 (사파리는 아래 가운데 공유 아이콘,
 * 인스타 iOS 는 오른쪽 아래 ···, 안드로이드는 오른쪽 위 ⋮) 그대로 그려준다.
 */
const CORNER: Record<Corner, { spot: string; where: string; glyph: '⋮' | '···' | 'share' }> = {
  'top-right': { spot: 'right-1 top-3', where: '오른쪽 위', glyph: '⋮' },
  'bottom-right': { spot: 'bottom-2 right-1', where: '오른쪽 아래', glyph: '···' },
  'bottom-center': { spot: 'bottom-2 left-1/2 -translate-x-1/2', where: '아래 가운데', glyph: 'share' },
  'top-bar': { spot: 'right-1 top-3', where: '주소창 오른쪽', glyph: 'share' },
};

function CornerHint({ corner }: { corner: Corner }) {
  const { spot, where, glyph } = CORNER[corner];
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-bg-2 p-3">
      {/* 휴대폰 윤곽 — 버튼이 실제로 놓인 자리에 표식을 찍는다 */}
      <div className="relative h-[74px] w-[42px] shrink-0 rounded-[7px] border-2 border-line-2 bg-navy-deep">
        <span className="absolute inset-x-3 top-1 h-[3px] rounded-full bg-line-2" />
        <span className={`anim-bob absolute ${spot} flex h-5 w-5 items-center justify-center rounded-md bg-[#ffd06a] text-[10px] font-black leading-none text-navy-deep shadow-[0_0_0_3px_rgba(255,208,106,0.28)]`}>
          {glyph === 'share' ? <Icon name="share-ios" size={12} strokeWidth={2.4} /> : glyph}
        </span>
      </div>
      <p className="min-w-0 flex-1 text-[12px] font-bold leading-relaxed text-ink-soft">
        화면 <span className="text-[#ffd06a]">{where}</span>에 있는 버튼이에요.
        <span className="mt-0.5 block text-[11px] font-medium text-ink-muted">여기를 눌러 시작하세요.</span>
      </p>
    </div>
  );
}

/**
 * 주소 복사.
 *
 * 앱 안 브라우저에서 메뉴를 못 찾는 사람에게는 이게 가장 확실한 탈출구다.
 * 클립보드 API 는 앱 안 브라우저에서 막히는 일이 잦아, 막히면 주소를 직접
 * 보여주고 길게 눌러 복사할 수 있게 둔다.
 */
function CopyUrlButton() {
  const [state, setState] = useState<'idle' | 'done' | 'manual'>('idle');
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState('done');
      return;
    } catch {
      /* 아래 예전 방식으로 한 번 더 시도한다 */
    }
    try {
      const el = document.createElement('textarea');
      el.value = url;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      setState(ok ? 'done' : 'manual');
    } catch {
      setState('manual');
    }
  };

  return (
    <div className="mt-3">
      <button type="button" onClick={copy} className="btn w-full py-2.5 text-[13px]">
        <Icon name={state === 'done' ? 'check' : 'upload'} size={15} strokeWidth={2} />
        {state === 'done' ? '복사했어요' : '주소 복사'}
      </button>
      {state === 'done' && (
        <p className="mt-1.5 text-center text-[11px] font-bold text-[#5ee596]">
          사파리·크롬 주소창에 붙여넣으면 됩니다
        </p>
      )}
      {state === 'manual' && (
        <p className="mt-1.5 break-all rounded-lg bg-bg-2 px-2.5 py-2 text-[11px] leading-relaxed text-ink-soft">
          복사가 막혀 있어요. 이 주소를 길게 눌러 복사하세요.
          <span className="mt-1 block font-bold text-ink">{url}</span>
        </p>
      )}
    </div>
  );
}

export function InstallGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { platform, canPrompt, promptInstall } = useInstall();

  // 방법을 한 번 본 사람에게 하단 안내 바를 또 띄울 이유가 없다
  useEffect(() => {
    if (open) dismissInstallHint();
  }, [open]);

  if (!open) return null;

  const g = guideFor(platform.method, platform.appName, platform.ios, canPrompt);
  const installed = platform.method === 'installed';

  return (
    <Modal open onClose={onClose}>
      <div className="card max-h-[88vh] overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <ZunPortrait pose={installed ? 'thumbsup' : 'idea'} height={56} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ab8ff]">앱으로 쓰기</div>
            <h3 className="text-base font-black leading-tight">{g.title}</h3>
          </div>
        </div>

        <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{g.lead}</p>

        {/* 어디를 눌러야 하는지 먼저 보여주고, 그다음에 순서를 읽게 한다 */}
        {!installed && g.corner && <CornerHint corner={g.corner} />}

        {!installed && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {g.steps.map((s, i) => (
              <li key={s.action} className="flex items-start gap-2.5 rounded-xl bg-bg-2 px-3 py-2.5">
                <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[11px] font-black text-[#8ab8ff]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold leading-snug">
                    <Icon name={s.icon} size={14} className="shrink-0 text-ink-soft" />
                    {s.action}
                  </span>
                  {s.hint && <span className="mt-0.5 block text-[11px] text-ink-muted">{s.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!installed && g.copyUrl && <CopyUrlButton />}

        {g.warn && (
          <p className="mt-2 rounded-xl bg-gold-soft px-3 py-2 text-[11px] leading-relaxed text-[#ffd06a]">{g.warn}</p>
        )}

        {!installed && (
          <div className="mt-3 rounded-xl bg-bg-2/60 px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
            앱으로 열면 주소창이 사라져 화면이 넓어지고, 지하철이나 비행기처럼 네트워크가 없는 곳에서도 켜집니다.
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {canPrompt && !installed && (
            <button
              type="button"
              onClick={() => promptInstall().then((ok) => ok && onClose())}
              className="btn btn-accent flex-1 py-2.5 text-[13px]"
            >
              <Icon name="download" size={15} strokeWidth={2} />
              홈 화면에 추가
            </button>
          )}
          <button type="button" onClick={onClose} className={`btn py-2.5 text-[13px] ${canPrompt && !installed ? 'px-4' : 'flex-1'}`}>
            {installed ? '확인' : '닫기'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
