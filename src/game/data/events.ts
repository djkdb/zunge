import type { GameEventDef } from '../types';

export const EVENTS: GameEventDef[] = [
  { id: 'viral', icon: '🔥', title: '바이럴!', message: '프로젝트가 갑자기 바이럴되었습니다! 사용자 +30%', tone: 'good', weight: 10, instantUsersPct: 0.3 },
  { id: 'sns', icon: '📈', title: 'SNS 화제', message: 'SNS에서 서비스가 화제입니다. 60초 동안 사용자 유입 3배!', tone: 'good', weight: 10, effect: { kind: 'users', mult: 3, duration: 60 } },
  { id: 'aifeature', icon: '🤖', title: 'AI의 발견', message: 'AI가 새로운 기능을 발견했습니다. 45초 동안 개발 속도 2배!', tone: 'good', weight: 10, effect: { kind: 'devSpeed', mult: 2, duration: 45 } },
  { id: 'investor', icon: '🚀', title: '투자자 등장', message: '투자자가 나타났습니다! 초당 수익 2분치를 즉시 획득', tone: 'good', weight: 7, instantMoneySeconds: 120 },
  { id: 'featured', icon: '🏆', title: '앱스토어 추천', message: '서비스가 오늘의 앱에 선정되었습니다. 60초 동안 수익 2배!', tone: 'good', weight: 8, effect: { kind: 'income', mult: 2, duration: 60 } },
  { id: 'bug', icon: '🐛', title: '치명적인 버그', message: '치명적인 버그가 발견되었습니다. 40초 동안 수익 -50%', tone: 'bad', weight: 8, effect: { kind: 'income', mult: 0.5, duration: 40 } },
  { id: 'servercost', icon: '💸', title: '서버 비용 증가', message: '서버 비용이 증가했습니다. 45초 동안 수익 -30%', tone: 'bad', weight: 8, effect: { kind: 'income', mult: 0.7, duration: 45 } },
  { id: 'outage', icon: '⚡', title: '서버 장애', message: '새벽 3시, 서버가 다운되었습니다. 30초 동안 사용자 유입 정지', tone: 'bad', weight: 6, effect: { kind: 'users', mult: 0, duration: 30 }, minLevel: 8 },
  { id: 'coffee', icon: '☕', title: '커피 한 잔', message: 'ZUN이 커피를 마셨습니다. 30초 동안 개발 속도 +50%', tone: 'neutral', weight: 12, effect: { kind: 'devSpeed', mult: 1.5, duration: 30 } },
  { id: 'sponsor', icon: '🎁', title: '스폰서 제안', message: '유튜버가 서비스를 소개했습니다. 사용자 +15%', tone: 'good', weight: 9, instantUsersPct: 0.15 },
  { id: 'bounty', icon: '💰', title: '버그 바운티', message: '오픈소스 기여로 바운티를 받았습니다. 초당 수익 45초치 획득', tone: 'good', weight: 9, instantMoneySeconds: 45 },
  { id: 'ratelimit', icon: '🧱', title: 'API 제한', message: 'AI API 사용량 제한에 걸렸습니다. 30초 동안 개발 속도 -40%', tone: 'bad', weight: 7, effect: { kind: 'devSpeed', mult: 0.6, duration: 30 }, minLevel: 5 },
];
