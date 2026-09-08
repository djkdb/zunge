/**
 * UI 크롬(탭 · 버튼 · 섹션 머리)에서 쓰는 선 아이콘.
 * 이모지는 기기마다 다르게 그려지고 크기·기준선이 제각각이라
 * 화면의 뼈대가 되는 자리에는 쓰지 않는다.
 */
export type IconName =
  | 'home' | 'projects' | 'upgrades' | 'ai' | 'growth' | 'settings'
  | 'play' | 'arrow-up' | 'lock' | 'check' | 'bolt' | 'coin' | 'users' | 'gift'
  | 'target' | 'trophy' | 'chart' | 'clock' | 'sparkle' | 'bug' | 'plus'
  | 'monitor' | 'display' | 'wifi' | 'server' | 'loop' | 'team' | 'building'
  | 'download' | 'upload' | 'trash' | 'sound-on' | 'sound-off' | 'chevron-right';

const P: Record<IconName, string> = {
  home: 'M3 10.6 12 3.5l9 7.1M5.4 9.4V20h13.2V9.4',
  projects: 'M6 3.5h9l3.5 3.5V20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM14.5 3.6V7.5H18.4M8.5 12h7M8.5 16h4.5',
  upgrades: 'M12 20V5M12 4.5 5.5 11M12 4.5 18.5 11',
  ai: 'M8.5 3.5h7v3.5h-7zM12 7v2.5M4.5 9.5h15v10h-15zM8.5 13.5h1M14.5 13.5h1M9 17h6',
  growth: 'M4 19.5h16M6.5 19.5V13M11 19.5V8.5M15.5 19.5v-5M20 19.5V4.5',
  settings: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.4 1.4 0 0 0 .28 1.55l.05.05a1.7 1.7 0 1 1-2.4 2.4l-.05-.05a1.4 1.4 0 0 0-2.37.99v.14a1.7 1.7 0 1 1-3.4 0v-.07a1.4 1.4 0 0 0-2.43-.96l-.05.05a1.7 1.7 0 1 1-2.4-2.4l.05-.05A1.4 1.4 0 0 0 4.6 14.3h-.14a1.7 1.7 0 1 1 0-3.4h.07a1.4 1.4 0 0 0 .96-2.43l-.05-.05a1.7 1.7 0 1 1 2.4-2.4l.05.05a1.4 1.4 0 0 0 1.55.28h.07a1.4 1.4 0 0 0 .85-1.28v-.14a1.7 1.7 0 1 1 3.4 0v.07a1.4 1.4 0 0 0 2.43.96l.05-.05a1.7 1.7 0 1 1 2.4 2.4l-.05.05a1.4 1.4 0 0 0-.28 1.55v.07a1.4 1.4 0 0 0 1.28.85h.14a1.7 1.7 0 1 1 0 3.4h-.07a1.4 1.4 0 0 0-1.28.85Z',
  play: 'M7.5 4.8v14.4L19 12 7.5 4.8Z',
  'arrow-up': 'M12 19V6M12 5.5 6 11.5M12 5.5 18 11.5',
  lock: 'M7 10.5V8a5 5 0 0 1 10 0v2.5M5.5 10.5h13v9.5h-13zM12 14.2v2.6',
  check: 'M5 12.5 10 17.5 19 7',
  bolt: 'M13.5 3 5.5 13.5h5.2L10 21l8.2-10.7h-5.3L13.5 3Z',
  coin: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM14.6 9.2a3 3 0 0 0-2.6-1.3c-1.6 0-2.6.9-2.6 2s1 1.8 2.6 2.1c1.6.3 2.6 1 2.6 2.1s-1 2-2.6 2a3 3 0 0 1-2.6-1.3M12 6.4v11.2',
  users: 'M12 11.2a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4ZM4.5 20.2a7.5 7.5 0 0 1 15 0',
  gift: 'M3.5 8.5h17v3.5h-17zM5 12v8.5h14V12M12 8.5V20.5M12 8.5S10.8 3.5 8.4 3.5a2.4 2.4 0 0 0 0 5M12 8.5s1.2-5 3.6-5a2.4 2.4 0 0 1 0 5',
  target: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  trophy: 'M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0V4ZM7.5 5.8H4.6v1.4a3.3 3.3 0 0 0 3 3.3M16.5 5.8h2.9v1.4a3.3 3.3 0 0 1-3 3.3M12 14v3.5M8.5 20.5h7',
  chart: 'M4 4.5v15h16M8 16V11M12.5 16V7.5M17 16v-3.5',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.4V12l3.2 2',
  sparkle: 'M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6-5.5-1.7L10.3 9 12 3.5ZM18.8 16.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z',
  bug: 'M8 8.5a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0v-4ZM9.4 6 8 4M14.6 6 16 4M8 10.5H4.5M16 10.5h3.5M8.2 14.5 5 16.5M15.8 14.5l3.2 2M12 16.5v4',
  plus: 'M12 5.5v13M5.5 12h13',
  monitor: 'M3.5 5h17v10h-17zM9 19h6M12 15.2V19',
  display: 'M2.5 6h9v7h-9zM12.5 6h9v7h-9zM7 16.5h10',
  wifi: 'M3 9.2a13 13 0 0 1 18 0M6.2 12.6a8.4 8.4 0 0 1 11.6 0M9.4 16a3.8 3.8 0 0 1 5.2 0M12 19.4h.01',
  server: 'M4 4.5h16v5H4zM4 14.5h16v5H4zM7.4 7h.01M7.4 17h.01',
  loop: 'M4.5 11a7.5 7.5 0 0 1 12.8-5.3l2.2 2.2M19.5 13a7.5 7.5 0 0 1-12.8 5.3l-2.2-2.2M19.5 4v4h-4M4.5 20v-4h4',
  team: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 20.5a6.5 6.5 0 0 1 13 0M4 11.5a2.6 2.6 0 1 0 0-5.2M20 11.5a2.6 2.6 0 1 1 0-5.2',
  building: 'M4.5 20.5V5.2l9-2.2v17.5M13.5 9.5h6v11M2.5 20.5h19M7.5 8h2.5M7.5 12h2.5M7.5 16h2.5M16 13h1M16 17h1',
  download: 'M12 3.5v11M12 15 7.5 10.5M12 15l4.5-4.5M4.5 18.5v2h15v-2',
  upload: 'M12 15V4M12 3.5 7.5 8M12 3.5 16.5 8M4.5 18.5v2h15v-2',
  trash: 'M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20.5h9l1-14M10 10v7M14 10v7',
  'sound-on': 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
  'sound-off': 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9.5l5 5M21 9.5l-5 5',
  'chevron-right': 'M9.5 5.5 16 12l-6.5 6.5',
};

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  /** 채움 아이콘으로 그린다 (play 등 실루엣이 필요한 경우) */
  filled?: boolean;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, className = '', filled, strokeWidth = 1.7 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={P[name]} />
    </svg>
  );
}
