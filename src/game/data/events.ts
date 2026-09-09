import type { GameEventDef } from '../types';

/**
 * 랜덤 이벤트.
 *
 * choices 가 있으면 자동으로 적용되지 않고 플레이어에게 선택을 묻는다.
 * 선택형은 "무조건 이득" 이 없도록 짰다 — 어느 쪽을 골라도 무언가를 내준다.
 */
export const EVENTS: GameEventDef[] = [
  // ───── 자동 적용 ─────
  { id: 'viral', icon: '🔥', title: '바이럴!', message: '프로젝트가 갑자기 바이럴되었습니다! 사용자 +30%', tone: 'good', weight: 10, instantUsersPct: 0.3 },
  { id: 'sns', icon: '📈', title: 'SNS 화제', message: 'SNS에서 서비스가 화제입니다. 60초 동안 사용자 유입 3배!', tone: 'good', weight: 10, effect: { kind: 'users', mult: 3, duration: 60 } },
  { id: 'aifeature', icon: '🤖', title: 'AI의 발견', message: 'AI가 새로운 기능을 발견했습니다. 45초 동안 개발 속도 2배!', tone: 'good', weight: 10, effect: { kind: 'devSpeed', mult: 2, duration: 45 } },
  { id: 'servercost', icon: '💸', title: '서버 비용 증가', message: '서버 비용이 증가했습니다. 45초 동안 수익 -30%', tone: 'bad', weight: 8, effect: { kind: 'income', mult: 0.7, duration: 45 } },
  { id: 'coffee', icon: '☕', title: '커피 한 잔', message: 'ZUN이 커피를 마셨습니다. 30초 동안 개발 속도 +50%', tone: 'neutral', weight: 12, effect: { kind: 'devSpeed', mult: 1.5, duration: 30 } },
  { id: 'bounty', icon: '💰', title: '버그 바운티', message: '오픈소스 기여로 바운티를 받았습니다. 초당 수익 45초치 획득', tone: 'good', weight: 9, instantMoneySeconds: 45 },
  { id: 'ratelimit', icon: '🧱', title: 'API 제한', message: 'AI API 사용량 제한에 걸렸습니다. 30초 동안 개발 속도 -40%', tone: 'bad', weight: 7, effect: { kind: 'devSpeed', mult: 0.6, duration: 30 }, minLevel: 5 },

  // ───── 선택형 ─────
  /*
   * 선택지 값은 "초당 수익 몇 초치" 로 환산해 맞췄다.
   * 환산 기준은 실제 엔진에서 측정한 것이다 (사용자 1% ≈ 0.55초,
   * 수익 배율은 (배율-1)×지속시간, 유입 배율은 그 0.15배, 개발 속도는 0.5배).
   *
   * 규칙 셋을 지킨다.
   *  1. safe(창을 닫으면 적용되는 선택지) 가 최선이면 안 된다 — 그러면 그냥 닫는 게 정답이 되고
   *     선택 자체가 사라진다.
   *  2. 항상 최악인 선택지를 두지 않는다 — 고를 이유가 없는 버튼은 함정이다.
   *  3. 도박의 기대값은 확정 선택지보다 살짝 낮게 두되 분산을 크게 한다 —
   *     "질러볼까" 가 성립하되 항상 정답은 아니게.
   */
  {
    id: 'investor',
    icon: '🚀',
    title: '투자자 등장',
    message: '투자자가 찾아왔습니다. 지분을 내주고 자금을 받을지, 혼자 갈지 정하세요.',
    tone: 'good',
    weight: 9,
    choices: [
      {
        id: 'take',
        icon: 'coin',
        label: '투자 받기',
        detail: '초당 수익 55초치를 즉시 받는다. 대신 서버 부담이 늘어 40초 동안 수익 -15%',
        tone: 'good',
        moneySeconds: 55,
        effect: { kind: 'income', mult: 0.85, duration: 40 },
      },
      {
        id: 'pitch',
        icon: 'sparkle',
        label: '더 크게 부르기',
        detail: '절반의 확률로 130초치. 실패하면 30초치를 날리고 30초 동안 개발 속도 -30%',
        tone: 'neutral',
        moneySeconds: 130,
        gamble: {
          chance: 0.5,
          failText: '협상 결렬. 검토 비용만 날렸습니다.',
          moneySeconds: -30,
          effect: { kind: 'devSpeed', mult: 0.7, duration: 30 },
        },
      },
      {
        id: 'decline',
        icon: 'check',
        label: '거절한다',
        detail: '지분을 지킨다. 사용자 +25%, 60초 동안 개발 속도 +70%',
        tone: 'neutral',
        safe: true,
        usersPct: 0.25,
        effect: { kind: 'devSpeed', mult: 1.7, duration: 60 },
      },
    ],
  },
  {
    id: 'bug',
    icon: '🐛',
    title: '치명적인 버그',
    message: '운영 중인 서비스에서 치명적인 버그가 발견되었습니다. 어떻게 대응할까요?',
    tone: 'bad',
    weight: 9,
    choices: [
      {
        id: 'hotfix',
        icon: 'bolt',
        label: '핫픽스 강행',
        detail: '지금 바로 고친다. 사용자는 지키지만 45초 동안 개발 속도 -65%',
        tone: 'neutral',
        effect: { kind: 'devSpeed', mult: 0.35, duration: 45 },
      },
      {
        id: 'rollback',
        icon: 'loop',
        label: '롤백한다',
        detail: '이전 버전으로 되돌린다. 사용자 -35%, 대신 개발은 멈추지 않는다',
        tone: 'neutral',
        safe: true,
        usersPct: -0.35,
      },
      {
        id: 'ignore',
        icon: 'clock',
        label: '내일 고친다',
        detail: '55% 확률로 아무 일도 없다. 걸리면 60초 동안 수익 -55%에 사용자 -25%',
        tone: 'bad',
        gamble: {
          chance: 0.55,
          failText: '결국 터졌습니다. 트래픽이 빠져나갑니다.',
          effect: { kind: 'income', mult: 0.45, duration: 60 },
          usersPct: -0.25,
        },
      },
    ],
  },
  {
    id: 'featured',
    icon: '🏆',
    title: '앱스토어 추천',
    message: '오늘의 앱 후보에 올랐습니다. 어디에 힘을 실을까요?',
    tone: 'good',
    weight: 8,
    choices: [
      {
        id: 'revenue',
        icon: 'coin',
        label: '수익화에 집중',
        detail: '60초 동안 수익 1.9배',
        tone: 'good',
        effect: { kind: 'income', mult: 1.9, duration: 60 },
      },
      {
        id: 'growth',
        icon: 'users',
        label: '사용자 확보에 집중',
        detail: '사용자 +35%, 60초 동안 유입 3배',
        tone: 'good',
        safe: true,
        usersPct: 0.35,
        effect: { kind: 'users', mult: 3, duration: 60 },
      },
    ],
  },
  {
    id: 'sponsor',
    icon: '🎁',
    title: '스폰서 제안',
    message: '유튜버가 서비스를 소개하고 싶어 합니다. 광고비를 어떻게 할까요?',
    tone: 'good',
    weight: 8,
    choices: [
      {
        id: 'pay',
        icon: 'upload',
        label: '광고비를 낸다',
        detail: '초당 수익 40초치를 쓰고 사용자 2배. 60초 동안 유입도 2.5배',
        tone: 'neutral',
        moneySeconds: -40,
        usersPct: 1,
        effect: { kind: 'users', mult: 2.5, duration: 60 },
      },
      {
        id: 'free',
        icon: 'gift',
        label: '무료로 부탁한다',
        detail: '55% 확률로 그냥 소개해준다(사용자 +50%). 실패해도 잃는 건 없다',
        tone: 'neutral',
        safe: true,
        usersPct: 0.5,
        effect: { kind: 'users', mult: 2, duration: 45 },
        gamble: { chance: 0.55, failText: '정중히 거절당했습니다.' },
      },
    ],
  },
  {
    id: 'outage',
    icon: '⚡',
    title: '서버 장애',
    message: '새벽 3시, 서버가 다운되었습니다. ZUN은 자고 있었습니다.',
    tone: 'bad',
    weight: 6,
    minLevel: 8,
    choices: [
      {
        id: 'scale',
        icon: 'server',
        label: '서버를 증설한다',
        detail: '초당 수익 18초치를 치르고 즉시 복구한다. 사용자는 지킨다',
        tone: 'neutral',
        moneySeconds: -18,
      },
      {
        id: 'wait',
        icon: 'clock',
        label: '아침까지 기다린다',
        detail: '돈은 안 들지만 사용자 -35%, 50초 동안 유입이 멈춘다',
        tone: 'bad',
        safe: true,
        usersPct: -0.35,
        effect: { kind: 'users', mult: 0, duration: 50 },
      },
    ],
  },
];
