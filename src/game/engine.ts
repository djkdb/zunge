import type { ActiveEffect, GameEventDef, GameState, Settings, Stats, UpgradeId } from './types';
import {
  BUG_PROGRESS_PENALTY, EVENT_MAX_INTERVAL_SEC, EVENT_MIN_INTERVAL_SEC, MAX_LEVEL, SAVE_VERSION, START_MONEY, xpToNext,
} from './constants';
import { PROJECT_MAP } from './data/projects';
import { UPGRADE_MAP, upgradeCost } from './data/upgrades';
import { AI_TIERS, aiTier } from './data/ai';
import { STAGES, stageDef } from './data/stages';
import { EVENTS } from './data/events';
import {
  computeDerived, failChance, isProjectUnlocked, launchBonus, projectCost, projectDevTime, projectUsersAt, projectVersion, projectXpAt,
} from './calc';

/** 엔진이 UI에 알리는 신호 */
export type Signal =
  | { type: 'income'; amount: number }
  | { type: 'projectStart'; projectId: string }
  | { type: 'projectComplete'; projectId: string; version: number; money: number; users: number; xp: number }
  | { type: 'bug'; projectId: string }
  | { type: 'levelUp'; level: number }
  | { type: 'event'; def: GameEventDef; money?: number; users?: number }
  | { type: 'upgrade'; id: UpgradeId; level: number }
  | { type: 'ai'; tier: number }
  | { type: 'stage'; stage: number }
  | { type: 'error'; message: string }
  | { type: 'tap'; money: number };

export interface TickResult {
  state: GameState;
  signals: Signal[];
}

export function createInitialState(now = Date.now()): GameState {
  return {
    version: SAVE_VERSION,
    money: START_MONEY,
    users: 0,
    level: 1,
    xp: 0,
    projectLevels: {},
    activeDevs: [],
    upgrades: { pc: 0, monitor: 0, internet: 0, server: 0, automation: 0, team: 0 },
    aiTier: 1,
    stage: 1,
    effects: [],
    lastSavedAt: now,
    lastEventAt: now,
    createdAt: now,
    settings: { sound: true, reducedMotion: false },
    stats: {
      totalEarned: 0, totalSpent: 0, projectsCompleted: 0, bugsFixed: 0, eventsTriggered: 0,
      playTime: 0, bestIncome: 0, peakUsers: 0, offlineEarned: 0,
    },
    seenStage: 1,
  };
}

function withStats(state: GameState, patch: Partial<Stats>): GameState {
  return { ...state, stats: { ...state.stats, ...patch } };
}

function grantXp(state: GameState, amount: number, signals: Signal[]): GameState {
  let xp = state.xp + amount;
  let level = state.level;
  while (level < MAX_LEVEL && xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    signals.push({ type: 'levelUp', level });
  }
  if (level >= MAX_LEVEL) xp = 0;
  return { ...state, xp, level };
}

function addUsers(state: GameState, amount: number): GameState {
  const max = computeDerived(state).maxUsers;
  const users = Math.min(max, state.users + amount);
  return { ...state, users: Math.max(0, users) };
}

function pickEvent(state: GameState): GameEventDef | null {
  const pool = EVENTS.filter((e) => (e.minLevel ?? 1) <= state.level);
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1] ?? null;
}

function applyEvent(state: GameState, def: GameEventDef, now: number, signals: Signal[]): GameState {
  let next = state;
  const d = computeDerived(next, now);
  let money: number | undefined;
  let users: number | undefined;
  if (def.instantMoneySeconds) {
    money = Math.round(Math.max(d.incomePerSec * def.instantMoneySeconds, 200));
    next = { ...next, money: next.money + money };
    next = withStats(next, { totalEarned: next.stats.totalEarned + money });
  }
  if (def.instantUsersPct) {
    users = Math.round(Math.max(next.users * def.instantUsersPct, 5));
    next = addUsers(next, users);
  }
  if (def.effect) {
    const effect: ActiveEffect = {
      eventId: def.id, icon: def.icon, title: def.title,
      kind: def.effect.kind, mult: def.effect.mult, endsAt: now + def.effect.duration * 1000,
    };
    // 같은 종류의 효과가 있으면 교체
    next = { ...next, effects: [...next.effects.filter((e) => e.eventId !== def.id), effect] };
  }
  next = withStats(next, { eventsTriggered: next.stats.eventsTriggered + 1 });
  signals.push({ type: 'event', def, money, users });
  return next;
}

export interface TickOptions {
  /** 오프라인 시뮬레이션 여부: 이벤트/플레이타임 비활성 */
  offline?: boolean;
  /** 오프라인 수익 배율 */
  incomeMult?: number;
}

/** dt 초만큼 게임을 진행시킨다 */
export function tick(state: GameState, dt: number, now: number, opts: TickOptions = {}): TickResult {
  const signals: Signal[] = [];
  let next: GameState = state;

  // 만료된 효과 제거
  if (next.effects.length && next.effects.some((e) => e.endsAt <= now)) {
    next = { ...next, effects: next.effects.filter((e) => e.endsAt > now) };
  }

  const d = computeDerived(next, now);
  const incomeMult = opts.incomeMult ?? 1;

  // 수익
  if (d.incomePerSec > 0) {
    const gained = d.incomePerSec * dt * incomeMult;
    next = { ...next, money: next.money + gained };
    next = withStats(next, { totalEarned: next.stats.totalEarned + gained });
    signals.push({ type: 'income', amount: gained });
  }

  // 사용자 증가
  if (d.userGrowthPerSec > 0 && next.users < d.maxUsers) {
    next = addUsers(next, d.userGrowthPerSec * dt * incomeMult);
  }

  // 개발 진행
  if (next.activeDevs.length > 0) {
    const remaining = [];
    for (const dev of next.activeDevs) {
      const def = PROJECT_MAP[dev.projectId];
      if (!def) continue;
      const version = projectVersion(next, dev.projectId);
      const time = projectDevTime(def, version);
      let progress = dev.progress + (d.devSpeed / time) * dt;
      let bugged = dev.bugged;
      if (progress >= 1) {
        if (!bugged && Math.random() < failChance(def, d.successBonus)) {
          progress = 1 - BUG_PROGRESS_PENALTY;
          bugged = true;
          signals.push({ type: 'bug', projectId: dev.projectId });
          remaining.push({ ...dev, progress, bugged });
          continue;
        }
        // 완성 & 출시
        const newVersion = version + 1;
        const bonus = launchBonus(def, newVersion);
        const users = projectUsersAt(def, newVersion);
        const xp = projectXpAt(def, newVersion);
        next = {
          ...next,
          money: next.money + bonus,
          projectLevels: { ...next.projectLevels, [def.id]: newVersion },
        };
        next = addUsers(next, users);
        next = withStats(next, {
          totalEarned: next.stats.totalEarned + bonus,
          projectsCompleted: next.stats.projectsCompleted + 1,
          bugsFixed: next.stats.bugsFixed + (bugged ? 1 : 0),
        });
        signals.push({ type: 'projectComplete', projectId: def.id, version: newVersion, money: bonus, users, xp });
        next = grantXp(next, xp, signals);
        continue;
      }
      remaining.push(progress !== dev.progress ? { ...dev, progress } : dev);
    }
    next = { ...next, activeDevs: remaining };
  }

  // 랜덤 이벤트 (온라인 전용)
  if (!opts.offline) {
    const hasProject = Object.values(next.projectLevels).some((v) => v > 0);
    const elapsed = (now - next.lastEventAt) / 1000;
    if (hasProject && elapsed > nextEventIntervalCached(next)) {
      const def = pickEvent(next);
      next = { ...next, lastEventAt: now };
      if (def) next = applyEvent(next, def, now, signals);
    }
  }

  // 통계
  const stats: Partial<Stats> = {};
  if (!opts.offline) stats.playTime = next.stats.playTime + dt;
  if (d.incomePerSec > next.stats.bestIncome) stats.bestIncome = d.incomePerSec;
  if (next.users > next.stats.peakUsers) stats.peakUsers = next.users;
  if (Object.keys(stats).length) next = withStats(next, stats);

  return { state: next, signals };
}

/** 이벤트 간격: 마지막 이벤트 시각을 시드로 안정적으로 결정 (틱마다 값이 흔들리지 않도록) */
function nextEventIntervalCached(state: GameState): number {
  const seed = Math.abs(Math.sin(state.lastEventAt));
  return EVENT_MIN_INTERVAL_SEC + seed * (EVENT_MAX_INTERVAL_SEC - EVENT_MIN_INTERVAL_SEC);
}

// ───────────── 액션 ─────────────

export function startProject(state: GameState, projectId: string, now: number): TickResult {
  const signals: Signal[] = [];
  const def = PROJECT_MAP[projectId];
  if (!def) return { state, signals: [{ type: 'error', message: '존재하지 않는 프로젝트입니다.' }] };
  if (!isProjectUnlocked(state, def)) return { state, signals: [{ type: 'error', message: '아직 해금되지 않은 프로젝트입니다.' }] };
  if (state.activeDevs.some((a) => a.projectId === projectId)) return { state, signals: [{ type: 'error', message: '이미 개발 중인 프로젝트입니다.' }] };
  const d = computeDerived(state, now);
  if (state.activeDevs.length >= d.slots) return { state, signals: [{ type: 'error', message: '동시 개발 슬롯이 부족합니다. 모니터를 업그레이드하세요.' }] };
  const cost = projectCost(def, projectVersion(state, projectId), d.costMult);
  if (state.money < cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  let next: GameState = {
    ...state,
    money: state.money - cost,
    activeDevs: [...state.activeDevs, { projectId, progress: 0, bugged: false, startedAt: now }],
  };
  next = withStats(next, { totalSpent: next.stats.totalSpent + cost });
  signals.push({ type: 'projectStart', projectId });
  return { state: next, signals };
}

export function cancelProject(state: GameState, projectId: string): TickResult {
  const dev = state.activeDevs.find((a) => a.projectId === projectId);
  if (!dev) return { state, signals: [] };
  const def = PROJECT_MAP[projectId];
  const d = computeDerived(state);
  const refund = Math.round(projectCost(def, projectVersion(state, projectId), d.costMult) * 0.5);
  return {
    state: { ...state, money: state.money + refund, activeDevs: state.activeDevs.filter((a) => a.projectId !== projectId) },
    signals: [],
  };
}

export function buyUpgrade(state: GameState, id: UpgradeId): TickResult {
  const def = UPGRADE_MAP[id];
  const level = state.upgrades[id];
  if (level >= def.maxLevel) return { state, signals: [{ type: 'error', message: '최대 레벨입니다.' }] };
  if (state.level < def.requiredLevel) return { state, signals: [{ type: 'error', message: `레벨 ${def.requiredLevel}부터 구매할 수 있습니다.` }] };
  const cost = upgradeCost(def, level);
  if (state.money < cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  const signals: Signal[] = [];
  let next: GameState = {
    ...state,
    money: state.money - cost,
    upgrades: { ...state.upgrades, [id]: level + 1 },
  };
  next = withStats(next, { totalSpent: next.stats.totalSpent + cost });
  signals.push({ type: 'upgrade', id, level: level + 1 });
  next = grantXp(next, 10 + 8 * (level + 1), signals);
  return { state: next, signals };
}

export function buyAi(state: GameState): TickResult {
  const nextTier = AI_TIERS.find((t) => t.tier === state.aiTier + 1);
  if (!nextTier) return { state, signals: [{ type: 'error', message: '이미 최고 등급 AI입니다.' }] };
  if (state.level < nextTier.requiredLevel) return { state, signals: [{ type: 'error', message: `레벨 ${nextTier.requiredLevel}부터 업그레이드할 수 있습니다.` }] };
  if (state.money < nextTier.cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  const signals: Signal[] = [];
  let next: GameState = { ...state, money: state.money - nextTier.cost, aiTier: nextTier.tier };
  next = withStats(next, { totalSpent: next.stats.totalSpent + nextTier.cost });
  signals.push({ type: 'ai', tier: nextTier.tier });
  next = grantXp(next, 60 * nextTier.tier, signals);
  return { state: next, signals };
}

export function buyStage(state: GameState): TickResult {
  const nextStage = STAGES.find((s) => s.stage === state.stage + 1);
  if (!nextStage) return { state, signals: [{ type: 'error', message: '이미 최고 단계 공간입니다.' }] };
  if (state.level < nextStage.requiredLevel) return { state, signals: [{ type: 'error', message: `레벨 ${nextStage.requiredLevel}부터 이사할 수 있습니다.` }] };
  if (state.money < nextStage.cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  const signals: Signal[] = [];
  let next: GameState = { ...state, money: state.money - nextStage.cost, stage: nextStage.stage };
  next = withStats(next, { totalSpent: next.stats.totalSpent + nextStage.cost });
  signals.push({ type: 'stage', stage: nextStage.stage });
  next = grantXp(next, 150 * nextStage.stage, signals);
  return { state: next, signals };
}

/** ZUN을 탭하면 소액 수익 + 개발 진행도 소폭 상승 */
export function tapZun(state: GameState, now: number): TickResult {
  const d = computeDerived(state, now);
  const money = Math.max(5, Math.round(d.incomePerSec * 0.6));
  let next: GameState = { ...state, money: state.money + money };
  next = withStats(next, { totalEarned: next.stats.totalEarned + money });
  if (next.activeDevs.length) {
    next = { ...next, activeDevs: next.activeDevs.map((a) => ({ ...a, progress: Math.min(0.999, a.progress + 0.004) })) };
  }
  return { state: next, signals: [{ type: 'tap', money }] };
}

export function updateSettings(state: GameState, patch: Partial<Settings>): GameState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function markStageSeen(state: GameState): GameState {
  return state.seenStage === state.stage ? state : { ...state, seenStage: state.stage };
}

/** 다음 목표 (가장 가까운 해금/구매) 계산 */
export interface Goal {
  icon: string;
  label: string;
  need: number;
  have: number;
  kind: 'money' | 'level';
}

export function nextGoal(state: GameState): Goal | null {
  const goals: Goal[] = [];
  const d = computeDerived(state);
  const nextStage = STAGES.find((s) => s.stage === state.stage + 1);
  if (nextStage) {
    if (state.level < nextStage.requiredLevel) goals.push({ icon: nextStage.icon, label: `${nextStage.name} 해금`, need: nextStage.requiredLevel, have: state.level, kind: 'level' });
    else goals.push({ icon: nextStage.icon, label: `${nextStage.name}로 이사`, need: nextStage.cost, have: state.money, kind: 'money' });
  }
  const nextAi = AI_TIERS.find((t) => t.tier === state.aiTier + 1);
  if (nextAi) {
    if (state.level < nextAi.requiredLevel) goals.push({ icon: nextAi.icon, label: `${nextAi.name} 해금`, need: nextAi.requiredLevel, have: state.level, kind: 'level' });
    else goals.push({ icon: nextAi.icon, label: `${nextAi.name} 도입`, need: nextAi.cost, have: state.money, kind: 'money' });
  }
  for (const p of Object.values(PROJECT_MAP)) {
    if ((state.projectLevels[p.id] ?? 0) > 0) continue;
    if (state.activeDevs.some((a) => a.projectId === p.id)) continue;
    if (state.aiTier < p.requiredAi) continue;
    if (state.level < p.requiredLevel) goals.push({ icon: p.icon, label: `${p.name} 해금`, need: p.requiredLevel, have: state.level, kind: 'level' });
    else goals.push({ icon: p.icon, label: `${p.name} 개발`, need: projectCost(p, 0, d.costMult), have: state.money, kind: 'money' });
  }
  // 가장 달성에 가까운 목표: 진행 비율이 높은 순, 단 이미 달성한 것은 제외
  const pending = goals.filter((g) => g.have < g.need);
  if (!pending.length) return goals[0] ?? null;
  pending.sort((a, b) => b.have / b.need - a.have / a.need);
  return pending[0];
}

export { aiTier, stageDef };
