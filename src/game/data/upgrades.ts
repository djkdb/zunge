import type { UpgradeDef, UpgradeId } from '../types';

/** 업그레이드 효과 계수 */
export const UPGRADE_EFFECT = {
  pcSpeedPerLevel: 0.12,
  monitorBaseSlots: 1,
  internetGrowthPerLevel: 0.2,
  serverBaseUsers: 400,
  serverMult: 2.6,
  automationIncomePerLevel: 0.08,
  automationOfflineEffPerLevel: 0.05,
  automationOfflineHoursPerLevel: 0.5,
  teamSpeedPerLevel: 0.08,
  teamIncomePerLevel: 0.1,
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'pc', name: 'PC', icon: '🖥️', description: '더 좋은 PC는 빌드도, 개발도 빠르다.',
    baseCost: 500, costMult: 1.7, maxLevel: 40, requiredLevel: 1,
    effectLabel: (l) => `개발 속도 +${pct(l * UPGRADE_EFFECT.pcSpeedPerLevel)}`,
  },
  {
    id: 'monitor', name: '모니터', icon: '🖥️', description: '모니터가 늘어날수록 동시에 진행할 수 있는 프로젝트가 늘어난다.',
    baseCost: 4000, costMult: 6.5, maxLevel: 4, requiredLevel: 2,
    effectLabel: (l) => `동시 개발 ${UPGRADE_EFFECT.monitorBaseSlots + l}개`,
  },
  {
    id: 'internet', name: '인터넷', icon: '📶', description: '빠른 회선은 사용자 유입 속도를 높인다.',
    /*
     * 값이 싸다. 유입을 아무리 올려도 결국 서버 상한에 묶이므로 이 업그레이드가
     * 실제로 벌어다 주는 돈은 크지 않다. 비싸게 받으면 그냥 함정이 된다.
     */
    baseCost: 1500, costMult: 1.42, maxLevel: 30, requiredLevel: 2,
    effectLabel: (l) => `사용자 유입 +${pct(l * UPGRADE_EFFECT.internetGrowthPerLevel)}`,
  },
  {
    id: 'server', name: '서버', icon: '🗄️', description: '서버가 무리 없이 감당하는 사용자 수를 늘린다. 이 수를 넘어서면 유입이 점점 느려진다.',
    baseCost: 3000, costMult: 2.6, maxLevel: 22, requiredLevel: 3,
    effectLabel: (l) => `최대 사용자 ${formatCap(UPGRADE_EFFECT.serverBaseUsers * Math.pow(UPGRADE_EFFECT.serverMult, l))}`,
  },
  {
    id: 'automation', name: '자동화', icon: '🔁', description: '수익 파이프라인을 자동화한다. 방치 수익과 오프라인 효율이 오른다.',
    baseCost: 20000, costMult: 3.2, maxLevel: 10, requiredLevel: 6,
    effectLabel: (l) => `수익 +${pct(l * UPGRADE_EFFECT.automationIncomePerLevel)}, 오프라인 효율 +${pct(l * UPGRADE_EFFECT.automationOfflineEffPerLevel)}, 최대 +${l * UPGRADE_EFFECT.automationOfflineHoursPerLevel}시간`,
  },
  {
    id: 'team', name: '팀원', icon: '🧑‍💻', description: '함께 개발할 팀원을 채용한다. 개발 속도와 수익이 함께 오른다.',
    baseCost: 800000, costMult: 2.8, maxLevel: 12, requiredLevel: 14,
    effectLabel: (l) => `팀원 ${l}명 · 개발 속도 +${pct(l * UPGRADE_EFFECT.teamSpeedPerLevel)}, 수익 +${pct(l * UPGRADE_EFFECT.teamIncomePerLevel)}`,
  },
];

function formatCap(n: number): string {
  if (n < 10000) return `${Math.round(n).toLocaleString()}명`;
  if (n < 1e8) return `${(n / 1e4).toFixed(n < 1e5 ? 1 : 0)}만명`;
  if (n < 1e12) return `${(n / 1e8).toFixed(n < 1e9 ? 1 : 0)}억명`;
  return `${(n / 1e12).toFixed(1)}조명`;
}

export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u])) as Record<UpgradeId, UpgradeDef>;

export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costMult, level));
}
