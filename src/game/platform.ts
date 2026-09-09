/**
 * "홈 화면에 추가" 안내를 위한 플랫폼 판별.
 *
 * 설치 방법이 기기와 브라우저마다 전혀 다르다.
 * 안드로이드는 브라우저가 설치 창을 직접 띄워주지만, iOS 는 사파리에서
 * 공유 버튼을 눌러야만 하고, 인스타그램·카카오톡 같은 앱 안의 브라우저에서는
 * 아예 불가능하다. 잘못 안내하면 "그런 버튼 없는데요" 가 된다.
 *
 * 그래서 사용자 에이전트를 보고 지금 이 사람이 할 수 있는 일만 알려준다.
 */

export type InstallMethod =
  /** 이미 홈 화면(또는 독)에서 실행 중 */
  | 'installed'
  /** 브라우저가 설치 창을 직접 띄워줄 수 있다 (안드로이드 크롬 · 데스크톱 크롬/엣지) */
  | 'prompt'
  /** iOS 사파리: 공유 → 홈 화면에 추가 */
  | 'ios-safari'
  /** iOS 인데 사파리가 아니다: 사파리로 열어야 한다 */
  | 'ios-other'
  /** 앱 안의 브라우저(인스타 · 카카오톡 등): 밖으로 나가야 한다 */
  | 'in-app'
  /** 데스크톱 사파리: 공유 → 독에 추가 (macOS Sonoma 이상) */
  | 'mac-safari'
  /** 안드로이드인데 설치 창을 안 띄우는 브라우저(파이어폭스 등): 메뉴에서 직접 */
  | 'android-menu'
  /** 설치를 지원하지 않는 브라우저 (예: 파이어폭스 데스크톱) */
  | 'unsupported';

export interface PlatformInfo {
  method: InstallMethod;
  /** 화면에 쓰는 이름 — "인스타그램 앱 안" 처럼 */
  appName: string;
  /** iOS 기기인가 (아이패드 포함) */
  ios: boolean;
  android: boolean;
  mobile: boolean;
}

/** 앱 안에 박혀 있는 브라우저들 — 여기서는 홈 화면 추가가 안 된다 */
const IN_APP: { re: RegExp; name: string }[] = [
  { re: /Instagram/i, name: '인스타그램' },
  { re: /Threads/i, name: '스레드' },
  { re: /FBAN|FBAV|FB_IAB|FBIOS/i, name: '페이스북' },
  { re: /KAKAOTALK/i, name: '카카오톡' },
  { re: /NAVER\(inapp|NAVER /i, name: '네이버 앱' },
  { re: /DaumApps|DaumDevice/i, name: '다음 앱' },
  { re: /\bLine\//i, name: '라인' },
  { re: /Snapchat/i, name: '스냅챗' },
  { re: /TikTok|BytedanceWebview|musical_ly/i, name: '틱톡' },
  { re: /Twitter|TwitterAndroid/i, name: 'X(트위터)' },
  { re: /everytimeApp/i, name: '에브리타임' },
];

/** iOS 에서 사파리가 아닌 브라우저들 */
const IOS_NON_SAFARI: { re: RegExp; name: string }[] = [
  { re: /CriOS/, name: '크롬' },
  { re: /FxiOS/, name: '파이어폭스' },
  { re: /EdgiOS/, name: '엣지' },
  { re: /Whale/, name: '웨일' },
  { re: /OPiOS|OPT\//, name: '오페라' },
  { re: /DuckDuckGo/, name: '덕덕고' },
];

/** 홈 화면(또는 독)에서 실행 중인지 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mm = window.matchMedia?.('(display-mode: standalone)').matches
    || window.matchMedia?.('(display-mode: fullscreen)').matches
    || window.matchMedia?.('(display-mode: minimal-ui)').matches;
  // iOS 사파리는 표준 대신 navigator.standalone 을 쓴다
  const ios = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return !!mm || ios;
}

export function detectPlatform(
  ua = typeof navigator !== 'undefined' ? navigator.userAgent : '',
  touchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
): PlatformInfo {
  // 아이패드는 사파리에서 자기를 Macintosh 라고 말한다. 터치 여부로 가른다
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  const android = /Android/.test(ua);
  const mobile = ios || android || /Mobile/.test(ua);
  const mac = /Macintosh/.test(ua) && !ios;

  const base = { ios, android, mobile };

  if (isStandalone()) return { ...base, method: 'installed', appName: 'ZUN' };

  const inApp = IN_APP.find((x) => x.re.test(ua));
  if (inApp) return { ...base, method: 'in-app', appName: inApp.name };

  if (ios) {
    const other = IOS_NON_SAFARI.find((x) => x.re.test(ua));
    if (other) return { ...base, method: 'ios-other', appName: other.name };
    return { ...base, method: 'ios-safari', appName: '사파리' };
  }

  // 삼성 인터넷은 UA 에 Chrome 도 함께 들어 있어 크롬보다 먼저 봐야 이름이 맞는다
  if (/SamsungBrowser/.test(ua)) return { ...base, method: 'prompt', appName: '삼성 인터넷' };
  // 안드로이드 파이어폭스는 설치 창을 띄우지 않지만 메뉴로는 추가할 수 있다
  if (android && /Firefox|FxiOS/.test(ua)) return { ...base, method: 'android-menu', appName: '파이어폭스' };
  if (android && /OPR\/|Opera/.test(ua)) return { ...base, method: 'android-menu', appName: '오페라' };
  // 안드로이드 크롬 계열과 데스크톱 크롬/엣지는 브라우저가 설치 창을 띄워준다
  const chromium = /Chrome|Chromium|CriOS|Edg\//.test(ua) && !/OPR\//.test(ua);
  if (chromium) return { ...base, method: 'prompt', appName: /Edg\//.test(ua) ? '엣지' : '크롬' };

  if (mac && /Safari/.test(ua)) return { ...base, method: 'mac-safari', appName: '사파리' };

  return { ...base, method: 'unsupported', appName: '이 브라우저' };
}

/** 브라우저가 모아 두는 설치 창 이벤트 */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
