import type { AchievementDef } from '../types';

/** 업적 — 달성하면 즉시 보너스 자금 + 영구 수익 +1% */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'p1', icon: '🚀', name: '첫 출시', description: '프로젝트를 1개 출시한다', metric: 'projects', goal: 1, rewardSeconds: 30 },
  { id: 'p10', icon: '📦', name: '연쇄 출시', description: '프로젝트를 10개 출시한다', metric: 'projects', goal: 10, rewardSeconds: 60 },
  { id: 'p50', icon: '🏭', name: '출시 공장', description: '프로젝트를 50개 출시한다', metric: 'projects', goal: 50, rewardSeconds: 120 },
  { id: 'p200', icon: '🌟', name: '무한 배포', description: '프로젝트를 200개 출시한다', metric: 'projects', goal: 200, rewardSeconds: 240 },
  { id: 'pall', icon: '🗂️', name: '풀 라인업', description: '모든 종류의 프로젝트를 출시한다', metric: 'allProjects', goal: 1, rewardSeconds: 600 },

  { id: 'u1k', icon: '👥', name: '첫 1,000명', description: '사용자 1,000명을 모은다', metric: 'users', goal: 1000, rewardSeconds: 40 },
  { id: 'u100k', icon: '📣', name: '입소문', description: '사용자 10만명을 모은다', metric: 'users', goal: 1e5, rewardSeconds: 90 },
  { id: 'u10m', icon: '🌍', name: '전국구', description: '사용자 1,000만명을 모은다', metric: 'users', goal: 1e7, rewardSeconds: 180 },
  { id: 'u1b', icon: '🛰️', name: '글로벌 서비스', description: '사용자 10억명을 모은다', metric: 'users', goal: 1e9, rewardSeconds: 360 },

  { id: 'm1m', icon: '💰', name: '백만장자', description: '누적 100만원을 번다', metric: 'money', goal: 1e6, rewardSeconds: 40 },
  { id: 'm1b', icon: '💎', name: '억대 개발자', description: '누적 10억원을 번다', metric: 'money', goal: 1e9, rewardSeconds: 90 },
  { id: 'm1t', icon: '🏦', name: '조 단위', description: '누적 1조원을 번다', metric: 'money', goal: 1e12, rewardSeconds: 180 },

  { id: 'l10', icon: '⭐', name: '바이브코더', description: '레벨 10을 달성한다', metric: 'level', goal: 10, rewardSeconds: 60 },
  { id: 'l25', icon: '🎓', name: 'AI 개발자', description: '레벨 25를 달성한다', metric: 'level', goal: 25, rewardSeconds: 120 },
  { id: 'l50', icon: '👑', name: '파운더', description: '레벨 50을 달성한다', metric: 'level', goal: 50, rewardSeconds: 240 },
  { id: 'l100', icon: '🧬', name: 'AI Pioneer', description: '레벨 100을 달성한다', metric: 'level', goal: 100, rewardSeconds: 600 },

  { id: 'ai6', icon: '🌌', name: '자율 개발', description: '최고 등급 AI를 도입한다', metric: 'aiTier', goal: 6, rewardSeconds: 300 },
  { id: 's5', icon: '🏢', name: 'AI COMPANY', description: '마지막 공간까지 확장한다', metric: 'stage', goal: 5, rewardSeconds: 300 },
  { id: 'team', icon: '🧑‍💻', name: '풀 스쿼드', description: '팀원을 12명까지 채용한다', metric: 'team', goal: 12, rewardSeconds: 240 },
  { id: 'maxup', icon: '🔧', name: '풀업', description: '업그레이드 하나를 최대 레벨로 올린다', metric: 'maxUpgrade', goal: 1, rewardSeconds: 120 },

  { id: 'bug10', icon: '🐛', name: '디버거', description: '버그를 10번 잡는다', metric: 'bugs', goal: 10, rewardSeconds: 90 },
  { id: 'ev25', icon: '🎲', name: '파란만장', description: '이벤트를 25번 겪는다', metric: 'events', goal: 25, rewardSeconds: 90 },
  { id: 'off1', icon: '💤', name: '자는 동안에도', description: '오프라인 보상을 한 번 받는다', metric: 'offline', goal: 1, rewardSeconds: 40 },
  { id: 'gold10', icon: '✨', name: '버그 헌터', description: '황금 버그를 10번 잡는다', metric: 'golden', goal: 10, rewardSeconds: 150 },

  { id: 'pr1', icon: '🔄', name: '첫 리부트', description: '회사를 한 번 리부트한다', metric: 'prestige', goal: 1, rewardSeconds: 120 },
  { id: 'pr5', icon: '♾️', name: '연쇄 창업가', description: '회사를 5번 리부트한다', metric: 'prestige', goal: 5, rewardSeconds: 300 },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
