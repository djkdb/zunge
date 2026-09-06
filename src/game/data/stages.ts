import type { StageDef } from '../types';

export const STAGES: StageDef[] = [
  { stage: 1, name: '자취방', subtitle: 'ROOM', icon: '🛏️', cost: 0, requiredLevel: 1, incomeMult: 1, devSpeedMult: 1, description: '작은 책상, 낡은 모니터, 식은 커피. 모든 것은 여기서 시작됐다.' },
  { stage: 2, name: '개발자 방', subtitle: 'DEV ROOM', icon: '🖥️', cost: 250000, requiredLevel: 6, incomeMult: 1.25, devSpeedMult: 1.1, description: '듀얼 모니터와 미니 서버. 방이 조금씩 개발실이 되어간다.' },
  { stage: 3, name: 'AI LAB', subtitle: 'AI LAB', icon: '🧪', cost: 30000000, requiredLevel: 13, incomeMult: 1.6, devSpeedMult: 1.2, description: '대형 모니터, AI 서버, 홀로그램. 데이터가 방을 가득 채운다.' },
  { stage: 4, name: 'STARTUP OFFICE', subtitle: 'OFFICE', icon: '🏢', cost: 3000000000, requiredLevel: 22, incomeMult: 2.1, devSpeedMult: 1.35, description: '넓은 사무실과 팀원들. 프로젝트 보드가 매일 채워진다.' },
  { stage: 5, name: 'AI COMPANY', subtitle: 'AI COMPANY', icon: '🌐', cost: 150000000000, requiredLevel: 36, incomeMult: 3.0, devSpeedMult: 1.5, description: '서버룸과 연구 장비, 거대한 AI 시스템. ZUN의 회사다.' },
];

export function stageDef(stage: number): StageDef {
  return STAGES[Math.min(Math.max(stage, 1), STAGES.length) - 1];
}
