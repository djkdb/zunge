import type { AiTierDef } from '../types';

export const AI_TIERS: AiTierDef[] = [
  { tier: 1, name: '기본 AI', icon: '🤖', description: '코드 자동완성 정도. 그래도 없는 것보다 낫다.', cost: 0, requiredLevel: 1, devSpeedMult: 1, costReduction: 0, successBonus: 0, incomeMult: 1, color: '#8a94a6', orbs: 1 },
  { tier: 2, name: 'AI Assistant', icon: '💡', description: '질문하면 코드를 짜준다. 바이브코딩의 시작.', cost: 12000, requiredLevel: 4, devSpeedMult: 1.3, costReduction: 0.05, successBonus: 0.1, incomeMult: 1.1, color: '#4f8cff', orbs: 1 },
  { tier: 3, name: 'AI Coding', icon: '⚡', description: '파일 단위로 코드를 생성하고 수정한다.', cost: 400000, requiredLevel: 9, devSpeedMult: 1.7, costReduction: 0.12, successBonus: 0.25, incomeMult: 1.25, color: '#7c5cff', orbs: 1 },
  { tier: 4, name: 'AI Agent', icon: '🧭', description: '스스로 계획을 세우고 테스트까지 돌린다.', cost: 12000000, requiredLevel: 13, devSpeedMult: 2.2, costReduction: 0.2, successBonus: 0.4, incomeMult: 1.45, color: '#ff7a59', orbs: 2 },
  { tier: 5, name: 'Multi-Agent', icon: '🔗', description: '여러 에이전트가 역할을 나눠 동시에 작업한다.', cost: 600000000, requiredLevel: 22, devSpeedMult: 2.8, costReduction: 0.28, successBonus: 0.6, incomeMult: 1.75, color: '#22c55e', orbs: 3 },
  { tier: 6, name: 'Autonomous Developer', icon: '🌌', description: '지시 없이도 개발한다. ZUN은 이제 방향만 정한다.', cost: 20000000000, requiredLevel: 32, devSpeedMult: 3.5, costReduction: 0.35, successBonus: 0.8, incomeMult: 2.2, color: '#f59e0b', orbs: 4 },
];

export function aiTier(tier: number): AiTierDef {
  return AI_TIERS[Math.min(Math.max(tier, 1), AI_TIERS.length) - 1];
}
