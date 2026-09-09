import { useEffect } from 'react';
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

interface Guide {
  title: string;
  lead: string;
  steps: Step[];
  /** 설치가 불가능한 상황이라 방법 자체를 바꿔야 할 때 */
  warn?: string;
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
        steps: [
          { icon: 'share-ios', action: '화면 아래 공유 버튼 누르기', hint: '네모에서 화살표가 위로 나온 모양' },
          { icon: 'plus-square', action: '메뉴를 내려 "홈 화면에 추가" 선택' },
          { icon: 'check', action: '오른쪽 위 "추가" 누르기' },
        ],
      };

    case 'ios-other':
      return {
        title: '사파리로 열어야 해요',
        lead: `아이폰은 사파리에서만 홈 화면에 추가할 수 있어요. 지금은 ${appName}으로 보고 있습니다.`,
        warn: `${appName}에서는 홈 화면 추가 메뉴가 나오지 않습니다.`,
        steps: [
          { icon: 'external', action: '주소를 복사해 사파리에서 열기' },
          { icon: 'share-ios', action: '사파리 아래 공유 버튼 누르기' },
          { icon: 'plus-square', action: '"홈 화면에 추가" 선택' },
        ],
      };

    case 'in-app':
      return {
        title: `${appName} 안에서는 설치가 안 돼요`,
        lead: `${appName}에 들어 있는 브라우저는 홈 화면 추가를 지원하지 않습니다. 밖으로 한 번만 나가면 됩니다.`,
        warn: '앱 안 브라우저는 저장 데이터도 따로 관리돼요. 밖에서 열면 진행이 새로 시작될 수 있으니, 설정에서 저장 코드를 먼저 복사해 두세요.',
        steps: ios
          ? [
              { icon: 'menu', action: '오른쪽 아래 ··· 또는 공유 버튼 누르기' },
              { icon: 'external', action: '"Safari로 열기" 선택' },
              { icon: 'share-ios', action: '사파리에서 공유 → "홈 화면에 추가"' },
            ]
          : [
              { icon: 'menu', action: '오른쪽 위 ⋮ 메뉴 누르기' },
              { icon: 'external', action: '"다른 브라우저로 열기" 또는 "Chrome으로 열기"' },
              { icon: 'download', action: '크롬에서 "앱 설치" 또는 "홈 화면에 추가"' },
            ],
      };

    case 'android-menu':
      return {
        title: '메뉴에서 추가할 수 있어요',
        lead: `${appName}은 설치 창을 따로 띄우지 않지만, 메뉴에서 홈 화면에 넣을 수 있습니다.`,
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
