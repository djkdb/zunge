import type { GameState, TutorialDef } from '../types';
import { AUTODEV_UNLOCK_LEVEL, BOOST_UNLOCK_LEVEL, PRESTIGE_MIN_EARNED, PRESTIGE_MIN_LEVEL } from '../constants';
import { AI_TIERS } from './ai';
import { STAGES } from './stages';
import { UPGRADE_MAP, upgradeCost } from './upgrades';

/**
 * 튜토리얼 정의.
 * `intro`는 첫 실행 시 자동 재생되고, 나머지는 `TUTORIAL_TRIGGERS`의 조건이
 * 처음 참이 되는 순간 한 번만 재생된다.
 */
export const TUTORIALS: TutorialDef[] = [
  {
    id: 'intro',
    intro: true,
    steps: [
      {
        icon: '👋',
        title: '안녕, 나는 ZUN이야',
        body: '작은 자취방에서 개발자 인생을 시작했어. AI랑 같이 서비스를 만들어서 세상을 바꿔보자!',
      },
      {
        icon: '📋',
        title: '① 프로젝트를 만든다',
        body: '프로젝트 탭에서 만들고 싶은 서비스를 고르면 개발이 시작돼. 첫 프로젝트 "TODO 앱"은 무료야.',
        target: 'tab-projects',
        tab: 'projects',
      },
      {
        icon: '🧭',
        title: '② 어떻게 만들지 고른다',
        body: '프로젝트를 고르면 FAST · STABLE · QUALITY 중에서 개발 방식을 정해. 시간, 버그 위험, 비용, 출시 수익이 전부 달라져.',
        target: 'tab-projects',
        tab: 'projects',
      },
      {
        icon: '💰',
        title: '③ 출시하면 돈이 들어온다',
        body: '완성된 서비스는 사용자를 모으고 초당 수익을 만들어. 게임을 꺼둬도 계속 벌어들여!',
        target: 'stat-money',
      },
      {
        icon: '⬆️',
        title: '④ 번 돈으로 성장한다',
        body: '장비와 AI를 업그레이드하면 개발이 빨라지고 수익이 늘어. 그 돈으로 더 큰 프로젝트를 만드는 게 핵심 루프야.',
        target: 'tab-upgrades',
        tab: 'upgrades',
      },
      {
        icon: '👆',
        title: '심심할 땐 나를 눌러줘',
        body: 'ZUN을 탭하면 소소한 수익이 들어오고 개발도 조금 빨라져. 이제 첫 프로젝트를 만들러 가자!',
        tab: 'projects',
      },
    ],
  },

  {
    id: 'strategy',
    steps: [
      {
        icon: '🧭',
        title: '개발 전략을 고른다',
        body: 'FAST는 25% 빨리 끝나지만 버그 위험이 1.8배야. STABLE은 조금 느린 대신 버그가 절반이고 경험치를 더 줘.',
        target: 'tab-projects',
        tab: 'projects',
      },
      {
        icon: '💎',
        title: 'QUALITY는 오래 남는다',
        body: 'QUALITY로 낸 버전은 비용이 30% 비싼 대신, 그 버전이 살아있는 내내 수익과 사용자가 25% 더 들어와. 다음 버전을 다른 전략으로 내면 그 효과는 바뀐다.',
      },
    ],
  },

  {
    id: 'eventchoice',
    steps: [
      {
        icon: '🎲',
        title: '이벤트에는 선택이 있다',
        body: '투자자, 버그, 스폰서 같은 이벤트는 선택지를 줘. 어느 쪽을 골라도 무언가는 내줘야 하니 지금 상황을 보고 정해.',
      },
      {
        icon: '🍀',
        title: '확률이 붙은 선택지',
        body: '"성공 55%" 같은 표시가 있는 선택지는 도박이야. 성공하면 크게 벌고, 실패하면 대신 손해를 본다. 창을 닫으면 가장 안전한 선택으로 처리돼.',
      },
    ],
  },

  {
    id: 'upgrades',
    steps: [
      {
        icon: '🖥️',
        title: '업그레이드가 열렸어',
        body: 'PC를 올리면 개발 속도가, 인터넷은 사용자 유입이, 서버는 최대 사용자 수가 올라가. 가격은 살 때마다 비싸지니 상황에 맞게 골라.',
        target: 'tab-upgrades',
        tab: 'upgrades',
      },
      {
        icon: '🔢',
        title: '한 번에 여러 개',
        body: 'x1 / x10 / MAX 버튼으로 여러 레벨을 한 번에 살 수 있어. 자금이 넉넉할 땐 MAX가 편해.',
        target: 'buy-mode',
        tab: 'upgrades',
      },
    ],
  },

  {
    id: 'slots',
    steps: [
      {
        icon: '🖥️',
        title: '동시 개발 해금',
        body: '모니터를 늘리면 프로젝트를 동시에 여러 개 굴릴 수 있어. 슬롯이 남으면 항상 채워두는 게 이득이야.',
        target: 'tab-projects',
        tab: 'projects',
      },
    ],
  },

  {
    id: 'ai',
    steps: [
      {
        icon: '🤖',
        title: 'AI 업그레이드',
        body: 'AI 등급을 올리면 개발 속도와 성공률, 수익이 한꺼번에 좋아지고 새로운 프로젝트도 열려. 가장 효율 좋은 투자야.',
        target: 'tab-ai',
        tab: 'ai',
      },
    ],
  },

  {
    id: 'stage',
    steps: [
      {
        icon: '🚚',
        title: '공간을 넓힐 수 있어',
        body: '업그레이드 탭 맨 위에서 더 넓은 공간으로 이사할 수 있어. 방이 바뀌면 수익과 개발 속도에 영구 배율이 붙어.',
        target: 'stage-card',
        tab: 'upgrades',
      },
    ],
  },

  {
    id: 'events',
    steps: [
      {
        icon: '🎲',
        title: '이벤트가 일어나',
        body: '바이럴, 버그, 투자자 같은 사건이 무작위로 터져. 좋은 효과는 상단에 남은 시간이 표시되니 그때 프로젝트를 몰아치면 좋아.',
      },
    ],
  },

  {
    id: 'bug',
    steps: [
      {
        icon: '🐛',
        title: '버그가 생겼어!',
        body: '출시 직전에 버그가 터지면 진행도가 되돌아가. AI 등급을 올리면 버그 확률이 크게 줄어드니 참고해.',
      },
    ],
  },

  {
    id: 'boost',
    steps: [
      {
        icon: '☕',
        title: '커피 부스트',
        body: '화면 오른쪽 아래 커피 버튼을 누르면 60초 동안 수익이 2배가 돼. 5분마다 다시 쓸 수 있어. 공짜니까 꼭 챙겨!',
        target: 'boost-btn',
      },
    ],
  },

  {
    id: 'daily',
    steps: [
      {
        icon: '🎁',
        title: '일일 출석 보상',
        body: '매일 한 번 접속하면 보상을 받을 수 있어. 연속으로 올수록 보상이 커지니까 하루도 빼먹지 마.',
        target: 'daily-btn',
      },
    ],
  },

  {
    id: 'golden',
    steps: [
      {
        icon: '✨',
        title: '황금 버그를 잡아라',
        body: '가끔 방 안에 반짝이는 황금 버그가 나타나. 사라지기 전에 탭하면 큰 보너스를 받을 수 있어.',
      },
    ],
  },

  {
    id: 'offline',
    steps: [
      {
        icon: '💤',
        title: '꺼둬도 자란다',
        body: '게임을 꺼도 ZUN은 계속 개발해. 다시 들어오면 그동안 번 돈을 정산해줘. 자동화를 올리면 정산 효율과 최대 시간이 늘어나.',
      },
    ],
  },

  {
    id: 'achievements',
    steps: [
      {
        icon: '🏆',
        title: '업적 시스템',
        body: '조건을 채우면 업적이 열리고 즉시 보너스 자금이 들어와. 업적 1개마다 영구 수익도 1%씩 붙어.',
        target: 'tab-growth',
        tab: 'growth',
      },
    ],
  },

  {
    id: 'autodev',
    steps: [
      {
        icon: '🔁',
        title: '자동 개발 해금',
        body: '프로젝트 탭 위쪽에서 자동 개발을 켜면, 빈 슬롯에 가장 비싼 프로젝트를 알아서 착수해. 이제 진짜 방치가 가능해.',
        target: 'autodev-toggle',
        tab: 'projects',
      },
    ],
  },

  {
    id: 'prestige',
    steps: [
      {
        icon: '🔄',
        title: '리부트가 열렸어',
        body: '지금까지 번 돈을 인사이트로 바꾸고 처음부터 다시 시작하는 기능이야. 돈·레벨·업그레이드는 초기화되지만 인사이트는 영원히 남아.',
        target: 'tab-growth',
        tab: 'growth',
      },
      {
        icon: '💡',
        title: '인사이트는 영구 배율',
        body: '인사이트 1개마다 수익 +3%, 개발 속도 +1.2%가 영구히 붙어. 성장이 느려졌다 싶을 때 리부트하면 훨씬 빠르게 다시 올라와.',
        target: 'tab-growth',
        tab: 'growth',
      },
    ],
  },
];

export const TUTORIAL_MAP: Record<string, TutorialDef> = Object.fromEntries(TUTORIALS.map((t) => [t.id, t]));

/** 조건이 처음 참이 되는 순간 해당 튜토리얼을 재생한다 (위에서부터 하나씩) */
export const TUTORIAL_TRIGGERS: { id: string; when: (s: GameState) => boolean }[] = [
  { id: 'strategy', when: (s) => s.stats.projectsCompleted >= 1 },
  { id: 'eventchoice', when: (s) => s.stats.eventsTriggered >= 2 },
  { id: 'upgrades', when: (s) => s.money >= upgradeCost(UPGRADE_MAP.pc, s.upgrades.pc) && s.stats.projectsCompleted >= 1 },
  { id: 'boost', when: (s) => s.level >= BOOST_UNLOCK_LEVEL },
  { id: 'slots', when: (s) => s.upgrades.monitor >= 1 },
  { id: 'bug', when: (s) => s.activeDevs.some((a) => a.bugged) },
  { id: 'events', when: (s) => s.stats.eventsTriggered >= 1 },
  { id: 'ai', when: (s) => s.level >= (AI_TIERS[1]?.requiredLevel ?? 4) },
  { id: 'stage', when: (s) => s.level >= (STAGES[1]?.requiredLevel ?? 6) },
  { id: 'daily', when: (s) => s.stats.projectsCompleted >= 2 },
  { id: 'golden', when: (s) => s.stats.goldenBugs >= 1 },
  { id: 'offline', when: (s) => s.stats.offlineEarned > 0 },
  { id: 'achievements', when: (s) => s.achievements.length >= 1 },
  { id: 'autodev', when: (s) => s.level >= AUTODEV_UNLOCK_LEVEL },
  { id: 'prestige', when: (s) => s.level >= PRESTIGE_MIN_LEVEL && s.runEarned >= PRESTIGE_MIN_EARNED },
];

/** 아직 안 본 것 중 조건을 만족한 첫 튜토리얼 */
export function pendingTutorial(state: GameState): string | null {
  if (!state.seenTutorials.includes('intro')) return 'intro';
  for (const t of TUTORIAL_TRIGGERS) {
    if (!state.seenTutorials.includes(t.id) && t.when(state)) return t.id;
  }
  return null;
}
