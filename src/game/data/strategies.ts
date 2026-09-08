import type { DevStrategy, StrategyDef } from '../types';

/**
 * 개발 전략 — 프로젝트를 착수할 때 고르는 3가지 방식.
 *
 * 배율은 기존 계산식(projectDevTime · failChance · projectCost · projectIncomeAt …)
 * 위에 그대로 곱해진다. 어느 쪽도 정답이 아니도록 잡았다.
 *
 *   FAST    시간을 사지만 버그와 경험치를 내준다
 *   STABLE  시간을 내주고 안정성과 경험치를 산다
 *   QUALITY 돈을 내주고 그 버전이 살아있는 동안의 수익을 산다
 */
export const DEV_STRATEGIES: StrategyDef[] = [
  {
    id: 'fast',
    name: 'FAST',
    tagline: '일단 만들고 본다',
    pro: '개발 시간 -25%',
    con: '버그 위험 1.8배 · 경험치 -30%',
    timeMult: 0.75,
    riskMult: 1.8,
    costMult: 1,
    incomeMult: 1,
    usersMult: 1,
    xpMult: 0.7,
    color: '#ff8a5c',
  },
  {
    id: 'stable',
    name: 'STABLE',
    tagline: '테스트부터 쓴다',
    pro: '버그 위험 절반 · 경험치 +60%',
    con: '개발 시간 +25%',
    timeMult: 1.25,
    riskMult: 0.5,
    costMult: 1,
    incomeMult: 1,
    usersMult: 1,
    xpMult: 1.6,
    color: '#5ee596',
  },
  {
    id: 'quality',
    name: 'QUALITY',
    tagline: '끝까지 다듬는다',
    pro: '출시 수익 +25% · 사용자 +25%',
    con: '개발 비용 +30%',
    timeMult: 1,
    riskMult: 1,
    costMult: 1.3,
    incomeMult: 1.25,
    usersMult: 1.25,
    xpMult: 1,
    color: '#8ab8ff',
  },
];

export const STRATEGY_MAP: Record<DevStrategy, StrategyDef> = Object.fromEntries(
  DEV_STRATEGIES.map((s) => [s.id, s]),
) as Record<DevStrategy, StrategyDef>;

/** 자동 개발(무인 운전)이 쓰는 기본 전략 */
export const DEFAULT_STRATEGY: DevStrategy = 'stable';

export function strategyDef(id: DevStrategy | undefined): StrategyDef {
  return STRATEGY_MAP[id ?? DEFAULT_STRATEGY] ?? STRATEGY_MAP[DEFAULT_STRATEGY];
}

export function isDevStrategy(v: unknown): v is DevStrategy {
  return v === 'fast' || v === 'stable' || v === 'quality';
}
