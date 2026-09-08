import type { Derived, DevStrategy, GameState, ProjectDef } from './types';
import {
  ACHIEVEMENT_INCOME_PER, DEV_SPEED_PER_LEVEL, INSIGHT_DEV_PER, INSIGHT_INCOME_PER,
  INSIGHT_DIVISOR, INSIGHT_POW, OFFLINE_BASE_CAP_HOURS, OFFLINE_BASE_EFFICIENCY,
  PROJECT_VERSION_COST_MULT, PROJECT_VERSION_INCOME_MULT, PROJECT_VERSION_TIME_MULT,
  PROJECT_VERSION_USERS_MULT, PROJECT_VERSION_XP_MULT, USER_GROWTH_DIVISOR, USER_INCOME_COEF, USER_INCOME_LOG_FACTOR, USER_INCOME_POW, xpToNext,
} from './constants';
import { PROJECTS } from './data/projects';
import { UPGRADE_EFFECT } from './data/upgrades';
import { aiTier } from './data/ai';
import { stageDef } from './data/stages';
import { strategyDef } from './data/strategies';

/**
 * 전략 배율.
 * strategy 를 넘기지 않으면 1배 — 전략을 고르기 전(카드에 보여주는 기본 수치)에 쓴다.
 */
function mult(strategy: DevStrategy | undefined, key: 'timeMult' | 'riskMult' | 'costMult' | 'incomeMult' | 'usersMult' | 'xpMult'): number {
  return strategy ? strategyDef(strategy)[key] : 1;
}

function effectMult(state: GameState, kind: 'income' | 'users' | 'devSpeed', now: number): number {
  let m = 1;
  for (const e of state.effects) if (e.kind === kind && e.endsAt > now) m *= e.mult;
  return m;
}

export function projectVersion(state: GameState | Record<string, number>, id: string): number {
  const levels = 'projectLevels' in state && typeof state.projectLevels === 'object' ? (state as GameState).projectLevels : (state as Record<string, number>);
  return levels[id] ?? 0;
}

/** 다음 버전 개발 비용 */
export function projectCost(def: ProjectDef, version: number, costMult = 1, strategy?: DevStrategy): number {
  const base = version === 0 ? def.cost : (def.cost + 500) * Math.pow(PROJECT_VERSION_COST_MULT, version);
  return Math.round(base * costMult * mult(strategy, 'costMult'));
}

export function projectDevTime(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  return def.devTime * Math.pow(PROJECT_VERSION_TIME_MULT, version) * mult(strategy, 'timeMult');
}

/** 특정 버전(1 이상)이 주는 초당 수익 */
export function projectIncomeAt(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  if (version <= 0) return 0;
  return def.income * Math.pow(PROJECT_VERSION_INCOME_MULT, version - 1) * mult(strategy, 'incomeMult');
}

export function projectUsersAt(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  return Math.round(def.users * Math.pow(PROJECT_VERSION_USERS_MULT, version - 1) * mult(strategy, 'usersMult'));
}

export function projectGrowthAt(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  if (version <= 0) return 0;
  return projectUsersAt(def, version, strategy) / USER_GROWTH_DIVISOR;
}

export function projectXpAt(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  return Math.round(def.xp * Math.pow(PROJECT_VERSION_XP_MULT, version - 1) * mult(strategy, 'xpMult'));
}

export function launchBonus(def: ProjectDef, version: number, strategy?: DevStrategy): number {
  return Math.round(projectIncomeAt(def, version, strategy) * 30);
}

export function maxUsersFor(serverLevel: number): number {
  return Math.floor(UPGRADE_EFFECT.serverBaseUsers * Math.pow(UPGRADE_EFFECT.serverMult, serverLevel));
}

/** 이번 회차 수익을 리부트 시 받게 될 인사이트로 환산 */
export function insightFor(runEarned: number): number {
  if (runEarned <= 0) return 0;
  return Math.floor(Math.pow(runEarned / INSIGHT_DIVISOR, INSIGHT_POW));
}

export function computeDerived(state: GameState, now = Date.now()): Derived {
  const ai = aiTier(state.aiTier);
  const stage = stageDef(state.stage);
  const u = state.upgrades;
  const legacyIncomeMult = (1 + state.insight * INSIGHT_INCOME_PER) * (1 + state.achievements.length * ACHIEVEMENT_INCOME_PER);
  const legacyDevMult = 1 + state.insight * INSIGHT_DEV_PER;

  const devSpeed =
    (1 + u.pc * UPGRADE_EFFECT.pcSpeedPerLevel) *
    ai.devSpeedMult *
    stage.devSpeedMult *
    (1 + (state.level - 1) * DEV_SPEED_PER_LEVEL) *
    (1 + u.team * UPGRADE_EFFECT.teamSpeedPerLevel) *
    legacyDevMult *
    effectMult(state, 'devSpeed', now);

  const incomeMult =
    ai.incomeMult *
    stage.incomeMult *
    (1 + u.automation * UPGRADE_EFFECT.automationIncomePerLevel) *
    (1 + u.team * UPGRADE_EFFECT.teamIncomePerLevel) *
    legacyIncomeMult *
    effectMult(state, 'income', now);

  let projectIncomeBase = 0;
  let growthBase = 0;
  for (const p of PROJECTS) {
    const v = state.projectLevels[p.id] ?? 0;
    if (v > 0) {
      // 마지막으로 출시한 버전을 어떤 전략으로 만들었는지가 계속 수익에 반영된다
      const st = state.projectStrategy?.[p.id];
      projectIncomeBase += projectIncomeAt(p, v, st);
      growthBase += projectGrowthAt(p, v, st);
    }
  }
  const userFactor = 1 + Math.log10(1 + state.users) * USER_INCOME_LOG_FACTOR;
  const projectIncome = projectIncomeBase * userFactor * incomeMult;
  const userIncome = USER_INCOME_COEF * Math.pow(Math.max(0, state.users), USER_INCOME_POW) * incomeMult;

  const userGrowthPerSec =
    growthBase * (1 + u.internet * UPGRADE_EFFECT.internetGrowthPerLevel) * effectMult(state, 'users', now);

  const offlineEfficiency = Math.min(1, OFFLINE_BASE_EFFICIENCY + u.automation * UPGRADE_EFFECT.automationOfflineEffPerLevel);
  const offlineCapHours = OFFLINE_BASE_CAP_HOURS + u.automation * UPGRADE_EFFECT.automationOfflineHoursPerLevel;

  return {
    incomePerSec: projectIncome + userIncome,
    projectIncome,
    userIncome,
    userGrowthPerSec,
    maxUsers: maxUsersFor(u.server),
    devSpeed,
    slots: UPGRADE_EFFECT.monitorBaseSlots + u.monitor,
    costMult: 1 - ai.costReduction,
    successBonus: ai.successBonus,
    offlineEfficiency,
    offlineCapHours,
    xpToNext: xpToNext(state.level),
    incomeMult,
    legacyIncomeMult,
    legacyDevMult,
  };
}

export function isProjectUnlocked(state: GameState, def: ProjectDef): boolean {
  return state.level >= def.requiredLevel && state.aiTier >= def.requiredAi;
}

/** 프로젝트 실패 확률 */
export function failChance(def: ProjectDef, successBonus: number, strategy?: DevStrategy): number {
  return Math.max(0, Math.min(0.9, def.risk * (1 - successBonus) * mult(strategy, 'riskMult')));
}
