import type { AchievementDef, ActiveEffect, BuyMode, DevStrategy, EventChoiceDef, GameEventDef, GameState, Settings, Stats, UpgradeId } from './types';
import {
  ACHIEVEMENT_INCOME_PER, AUTODEV_UNLOCK_LEVEL, BOOST_COOLDOWN_SEC, BOOST_DURATION_SEC, BOOST_MULT, BOOST_UNLOCK_LEVEL,
  BUGGED_LAUNCH_PENALTY, BUG_FIX_COST_RATE, BUG_PROGRESS_PENALTY, DAILY_BASE_SECONDS, DAILY_MAX_STREAK, DAILY_MIN_MONEY, DAILY_STREAK_SECONDS,
  EVENT_MAX_INTERVAL_SEC, EVENT_MIN_INTERVAL_SEC, GOLDEN_MIN_MONEY, GOLDEN_REWARD_SECONDS,
  MAX_LEVEL, PRESTIGE_MIN_EARNED, PRESTIGE_MIN_LEVEL, SAVE_VERSION, START_MONEY, USER_OVERLOAD_MAX, dateKey, isNextDay, xpToNext,
} from './constants';
import { ACHIEVEMENTS } from './data/achievements';
import { PROJECTS, PROJECT_MAP } from './data/projects';

const PROJECT_COUNT = PROJECTS.length;
import { UPGRADE_MAP, upgradeCost } from './data/upgrades';
import { AI_TIERS, aiTier } from './data/ai';
import { STAGES, stageDef } from './data/stages';
import { EVENTS } from './data/events';
import { DEFAULT_STRATEGY } from './data/strategies';
import {
  computeDerived, failChance, insightFor, isProjectUnlocked, launchBonus, projectCost, projectDevTime, projectUsersAt, projectVersion, projectXpAt,
} from './calc';

/** 엔진이 UI에 알리는 신호 */
export type Signal =
  | { type: 'income'; amount: number }
  | { type: 'projectStart'; projectId: string; strategy: DevStrategy }
  | { type: 'projectComplete'; projectId: string; version: number; money: number; users: number; xp: number; strategy: DevStrategy; bugged: boolean }
  | { type: 'bug'; projectId: string; cost: number }
  | { type: 'levelUp'; level: number }
  | { type: 'event'; def: GameEventDef; money?: number; users?: number }
  | { type: 'eventChoice'; def: GameEventDef }
  | { type: 'upgrade'; id: UpgradeId; level: number }
  | { type: 'ai'; tier: number }
  | { type: 'stage'; stage: number }
  | { type: 'error'; message: string }
  | { type: 'tap'; money: number }
  | { type: 'achievement'; def: AchievementDef; money: number }
  | { type: 'boost' }
  | { type: 'golden'; money: number }
  | { type: 'daily'; money: number; streak: number }
  | { type: 'prestige'; insight: number };

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
    projectStrategy: {},
    activeDevs: [],
    upgrades: { pc: 0, monitor: 0, internet: 0, server: 0, automation: 0, team: 0 },
    aiTier: 1,
    stage: 1,
    effects: [],
    lastSavedAt: now,
    lastEventAt: now,
    createdAt: now,
    settings: { sound: true, reducedMotion: false, buyMode: 1 },
    stats: {
      totalEarned: 0, totalSpent: 0, projectsCompleted: 0, bugsFixed: 0, eventsTriggered: 0,
      playTime: 0, bestIncome: 0, peakUsers: 0, offlineEarned: 0,
      goldenBugs: 0, dailyClaims: 0, boostsUsed: 0,
    },
    seenStage: 1,
    seenTutorials: [],
    achievements: [],
    insight: 0,
    prestigeCount: 0,
    runEarned: 0,
    lastDailyDate: '',
    dailyStreak: 0,
    boostReadyAt: 0,
    autoDev: false,
  };
}

// ───────────── 업적 ─────────────

function achievementProgress(state: GameState, def: AchievementDef): number {
  switch (def.metric) {
    case 'projects': return state.stats.projectsCompleted;
    case 'users': return state.stats.peakUsers;
    case 'money': return state.stats.totalEarned;
    case 'level': return state.level;
    case 'aiTier': return state.aiTier;
    case 'stage': return state.stage;
    case 'bugs': return state.stats.bugsFixed;
    case 'events': return state.stats.eventsTriggered;
    case 'offline': return state.stats.offlineEarned > 0 ? 1 : 0;
    case 'prestige': return state.prestigeCount;
    case 'golden': return state.stats.goldenBugs;
    case 'team': return state.upgrades.team;
    case 'allProjects': return Object.values(state.projectLevels).filter((v) => v > 0).length >= PROJECT_COUNT ? 1 : 0;
    case 'maxUpgrade': return (Object.keys(state.upgrades) as UpgradeId[]).some((id) => state.upgrades[id] >= UPGRADE_MAP[id].maxLevel) ? 1 : 0;
  }
}

export function achievementRatio(state: GameState, def: AchievementDef): number {
  return Math.min(1, achievementProgress(state, def) / def.goal);
}

/** 새로 달성한 업적을 지급한다 */
function grantAchievements(state: GameState, now: number, signals: Signal[]): GameState {
  let next = state;
  for (const def of ACHIEVEMENTS) {
    if (next.achievements.includes(def.id)) continue;
    if (achievementProgress(next, def) < def.goal) continue;
    const d = computeDerived(next, now);
    const money = Math.max(1000, Math.round(d.incomePerSec * def.rewardSeconds));
    next = {
      ...next,
      achievements: [...next.achievements, def.id],
      money: next.money + money,
      runEarned: next.runEarned + money,
      stats: { ...next.stats, totalEarned: next.stats.totalEarned + money },
    };
    signals.push({ type: 'achievement', def, money });
  }
  return next;
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

/**
 * 사용자를 더한다.
 *
 * 서버 상한에서 딱 자르지 않는다. 이벤트나 출시로 얻은 사용자는 상한을
 * 넘길 수 있고, 대신 과부하 구간에서는 자연 유입이 말라붙는다(tick 참조).
 * 천장은 상한의 USER_OVERLOAD_MAX 배다.
 */
function addUsers(state: GameState, amount: number): GameState {
  const ceiling = computeDerived(state).maxUsers * USER_OVERLOAD_MAX;
  // 이미 천장 위라면 (상한이 줄어드는 일은 없지만) 더 밀어 올리지는 않는다
  const users = Math.min(Math.max(state.users, ceiling), state.users + amount);
  return { ...state, users: Math.max(0, users) };
}

/** 상한을 넘어선 정도에 따른 유입 감쇠 계수 (상한에서 1, 천장에서 0) */
export function growthDamping(users: number, maxUsers: number): number {
  if (maxUsers <= 0) return 0;
  const overload = users / maxUsers;
  if (overload <= 1) return 1;
  return Math.max(0, (USER_OVERLOAD_MAX - overload) / (USER_OVERLOAD_MAX - 1));
}

function pickEvent(state: GameState, allowChoice = true): GameEventDef | null {
  const pool = EVENTS.filter((e) => (e.minLevel ?? 1) <= state.level && (allowChoice || !e.choices));
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

/**
 * 선택형 이벤트에서 고른 선택지를 실제 상태에 반영한다.
 * gamble 이 있으면 확률로 성공/실패 결과가 갈린다.
 */
export function applyEventChoice(
  state: GameState,
  def: GameEventDef,
  choiceId: string,
  now: number,
): TickResult & { choice: EventChoiceDef | null; failed: boolean } {
  const signals: Signal[] = [];
  const choice = def.choices?.find((c) => c.id === choiceId) ?? null;
  if (!choice) return { state, signals, choice: null, failed: false };

  const failed = !!choice.gamble && Math.random() >= choice.gamble.chance;
  const outcome = failed ? choice.gamble! : choice;

  let next = state;
  const d = computeDerived(next, now);
  let money: number | undefined;
  let users: number | undefined;

  if (outcome.moneySeconds) {
    // 최소 금액을 두어 초반에도 선택이 체감되게 한다
    const base = Math.max(Math.abs(d.incomePerSec * outcome.moneySeconds), 300);
    money = Math.round(outcome.moneySeconds > 0 ? base : -Math.min(base, next.money));
    next = { ...next, money: Math.max(0, next.money + money) };
    if (money > 0) {
      next = { ...next, runEarned: next.runEarned + money };
      next = withStats(next, { totalEarned: next.stats.totalEarned + money });
    } else {
      next = withStats(next, { totalSpent: next.stats.totalSpent - money });
    }
  }
  if (outcome.usersPct) {
    users = Math.round(Math.max(next.users * Math.abs(outcome.usersPct), 5)) * Math.sign(outcome.usersPct);
    if (users > 0) next = addUsers(next, users);
    else next = { ...next, users: Math.max(0, next.users + users) };
  }
  if (outcome.effect) {
    const effect: ActiveEffect = {
      eventId: def.id,
      icon: def.icon,
      title: def.title,
      kind: outcome.effect.kind,
      mult: outcome.effect.mult,
      endsAt: now + outcome.effect.duration * 1000,
    };
    next = { ...next, effects: [...next.effects.filter((e) => e.eventId !== def.id), effect] };
  }
  next = withStats(next, { eventsTriggered: next.stats.eventsTriggered + 1 });
  signals.push({ type: 'event', def, money, users });
  return { state: next, signals, choice, failed };
}

export interface TickOptions {
  /** 오프라인 시뮬레이션 여부: 이벤트/플레이타임 비활성 */
  offline?: boolean;
  /** 오프라인 수익 배율 */
  incomeMult?: number;
  /**
   * 선택형 이벤트를 뽑아도 되는지.
   * 이미 선택 창이 떠 있으면 false 로 넘겨 자동 이벤트만 나오게 한다.
   */
  allowChoiceEvents?: boolean;
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
    next = { ...next, money: next.money + gained, runEarned: next.runEarned + gained };
    next = withStats(next, { totalEarned: next.stats.totalEarned + gained });
    signals.push({ type: 'income', amount: gained });
  }

  // 사용자 증가
  const damping = growthDamping(next.users, d.maxUsers);
  if (d.userGrowthPerSec > 0 && damping > 0) {
    next = addUsers(next, d.userGrowthPerSec * dt * incomeMult * damping);
  }

  // 개발 진행
  if (next.activeDevs.length > 0) {
    const remaining = [];
    for (const dev of next.activeDevs) {
      const def = PROJECT_MAP[dev.projectId];
      if (!def) continue;
      const version = projectVersion(next, dev.projectId);
      const strategy = dev.strategy ?? DEFAULT_STRATEGY;
      const time = projectDevTime(def, version, strategy);
      let progress = dev.progress + (d.devSpeed / time) * dt;
      let bugged = dev.bugged;
      if (progress >= 1) {
        if (!bugged && Math.random() < failChance(def, d.successBonus, strategy)) {
          progress = 1 - BUG_PROGRESS_PENALTY;
          bugged = true;
          // 긴급 대응 비용 — 빠르게 밀어붙인 선택에 실제 청구서를 보낸다
          const fixCost = Math.min(
            next.money,
            Math.round(projectCost(def, version, d.costMult, strategy) * BUG_FIX_COST_RATE),
          );
          if (fixCost > 0) {
            next = { ...next, money: next.money - fixCost };
            next = withStats(next, { totalSpent: next.stats.totalSpent + fixCost });
          }
          signals.push({ type: 'bug', projectId: dev.projectId, cost: fixCost });
          remaining.push({ ...dev, progress, bugged });
          continue;
        }
        // 완성 & 출시
        const newVersion = version + 1;
        // 버그를 겪은 출시는 화제성이 떨어진다
        const bonus = Math.round(launchBonus(def, newVersion, strategy) * (bugged ? BUGGED_LAUNCH_PENALTY : 1));
        const users = projectUsersAt(def, newVersion, strategy);
        const xp = projectXpAt(def, newVersion, strategy);
        next = {
          ...next,
          money: next.money + bonus,
          runEarned: next.runEarned + bonus,
          projectLevels: { ...next.projectLevels, [def.id]: newVersion },
          projectStrategy: { ...next.projectStrategy, [def.id]: strategy },
        };
        next = addUsers(next, users);
        next = withStats(next, {
          totalEarned: next.stats.totalEarned + bonus,
          projectsCompleted: next.stats.projectsCompleted + 1,
          bugsFixed: next.stats.bugsFixed + (bugged ? 1 : 0),
        });
        signals.push({ type: 'projectComplete', projectId: def.id, version: newVersion, money: bonus, users, xp, strategy, bugged });
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
      const def = pickEvent(next, opts.allowChoiceEvents !== false);
      next = { ...next, lastEventAt: now };
      if (def?.choices?.length) signals.push({ type: 'eventChoice', def });
      else if (def) next = applyEvent(next, def, now, signals);
    }
  }

  // 통계
  const stats: Partial<Stats> = {};
  if (!opts.offline) stats.playTime = next.stats.playTime + dt;
  if (d.incomePerSec > next.stats.bestIncome) stats.bestIncome = d.incomePerSec;
  if (next.users > next.stats.peakUsers) stats.peakUsers = next.users;
  if (Object.keys(stats).length) next = withStats(next, stats);

  // 자동 개발: 빈 슬롯을 가장 비싼(=수익 좋은) 프로젝트로 채운다
  if (next.autoDev) next = runAutoDev(next, now, signals);

  next = grantAchievements(next, now, signals);

  return { state: next, signals };
}

/** 자동 개발: 여유 슬롯에 지금 감당 가능한 가장 비싼 프로젝트를 착수한다 */
function runAutoDev(state: GameState, now: number, signals: Signal[]): GameState {
  let next = state;
  let guard = 0;
  while (guard < 8) {
    guard += 1;
    const d = computeDerived(next, now);
    if (next.activeDevs.length >= d.slots) break;
    const candidates = PROJECTS.filter(
      (p) => isProjectUnlocked(next, p)
        && !next.activeDevs.some((a) => a.projectId === p.id)
        && projectCost(p, projectVersion(next, p.id), d.costMult) <= next.money,
    );
    if (!candidates.length) break;
    // 남은 자금의 절반 이상을 쓰는 선택은 피해 성장 자금을 남긴다
    const affordable = candidates.filter((p) => projectCost(p, projectVersion(next, p.id), d.costMult) <= next.money * 0.5);
    const pool = affordable.length ? affordable : candidates;
    const best = pool.reduce((a, b) =>
      projectCost(b, projectVersion(next, b.id), d.costMult) > projectCost(a, projectVersion(next, a.id), d.costMult) ? b : a);
    const r = startProject(next, best.id, now);
    if (r.state === next) break;
    next = r.state;
    signals.push(...r.signals.filter((sig) => sig.type !== 'projectStart'));
  }
  return next;
}

/** 이벤트 간격: 마지막 이벤트 시각을 시드로 안정적으로 결정 (틱마다 값이 흔들리지 않도록) */
function nextEventIntervalCached(state: GameState): number {
  const seed = Math.abs(Math.sin(state.lastEventAt));
  return EVENT_MIN_INTERVAL_SEC + seed * (EVENT_MAX_INTERVAL_SEC - EVENT_MIN_INTERVAL_SEC);
}

// ───────────── 액션 ─────────────

export function startProject(state: GameState, projectId: string, now: number, strategy: DevStrategy = DEFAULT_STRATEGY): TickResult {
  const signals: Signal[] = [];
  const def = PROJECT_MAP[projectId];
  if (!def) return { state, signals: [{ type: 'error', message: '존재하지 않는 프로젝트입니다.' }] };
  if (!isProjectUnlocked(state, def)) return { state, signals: [{ type: 'error', message: '아직 해금되지 않은 프로젝트입니다.' }] };
  if (state.activeDevs.some((a) => a.projectId === projectId)) return { state, signals: [{ type: 'error', message: '이미 개발 중인 프로젝트입니다.' }] };
  const d = computeDerived(state, now);
  if (state.activeDevs.length >= d.slots) return { state, signals: [{ type: 'error', message: '동시 개발 슬롯이 부족합니다. 모니터를 업그레이드하세요.' }] };
  const cost = projectCost(def, projectVersion(state, projectId), d.costMult, strategy);
  if (state.money < cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  let next: GameState = {
    ...state,
    money: state.money - cost,
    activeDevs: [...state.activeDevs, { projectId, progress: 0, bugged: false, startedAt: now, strategy }],
  };
  next = withStats(next, { totalSpent: next.stats.totalSpent + cost });
  signals.push({ type: 'projectStart', projectId, strategy });
  return { state: next, signals };
}

export function cancelProject(state: GameState, projectId: string): TickResult {
  const dev = state.activeDevs.find((a) => a.projectId === projectId);
  if (!dev) return { state, signals: [] };
  const def = PROJECT_MAP[projectId];
  const d = computeDerived(state);
  const refund = Math.round(projectCost(def, projectVersion(state, projectId), d.costMult, dev.strategy) * 0.5);
  return {
    state: { ...state, money: state.money + refund, activeDevs: state.activeDevs.filter((a) => a.projectId !== projectId) },
    signals: [],
  };
}

export function buyUpgrade(state: GameState, id: UpgradeId, mode: BuyMode = 1): TickResult {
  const def = UPGRADE_MAP[id];
  const level = state.upgrades[id];
  if (level >= def.maxLevel) return { state, signals: [{ type: 'error', message: '최대 레벨입니다.' }] };
  if (state.level < def.requiredLevel) return { state, signals: [{ type: 'error', message: `레벨 ${def.requiredLevel}부터 구매할 수 있습니다.` }] };
  const { count, cost } = bulkUpgradeCost(state, id, mode);
  if (count <= 0 || state.money < cost) return { state, signals: [{ type: 'error', message: '자금이 부족합니다.' }] };
  const signals: Signal[] = [];
  let next: GameState = {
    ...state,
    money: state.money - cost,
    upgrades: { ...state.upgrades, [id]: level + count },
  };
  next = withStats(next, { totalSpent: next.stats.totalSpent + cost });
  signals.push({ type: 'upgrade', id, level: level + count });
  let xp = 0;
  for (let i = 1; i <= count; i += 1) xp += 10 + 8 * (level + i);
  next = grantXp(next, xp, signals);
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

// ───────────── 방치형 편의 기능 ─────────────

/** 업그레이드를 n단계 살 때의 총 비용과 실제 구매 가능 단계 수 */
export function bulkUpgradeCost(state: GameState, id: UpgradeId, mode: BuyMode): { count: number; cost: number } {
  const def = UPGRADE_MAP[id];
  const start = state.upgrades[id];
  if (state.level < def.requiredLevel) return { count: 0, cost: 0 };
  const limit = mode === -1 ? def.maxLevel - start : Math.min(mode, def.maxLevel - start);
  let cost = 0;
  let count = 0;
  for (let i = 0; i < limit; i += 1) {
    const c = upgradeCost(def, start + i);
    if (mode === -1 && cost + c > state.money) break;
    cost += c;
    count += 1;
  }
  return { count, cost };
}

/** 부스트를 지금 쓸 수 있는지 */
export function boostReady(state: GameState, now: number): boolean {
  return state.level >= BOOST_UNLOCK_LEVEL && now >= state.boostReadyAt;
}

export function useBoost(state: GameState, now: number): TickResult {
  if (state.level < BOOST_UNLOCK_LEVEL) {
    return { state, signals: [{ type: 'error', message: `레벨 ${BOOST_UNLOCK_LEVEL}부터 사용할 수 있습니다.` }] };
  }
  if (now < state.boostReadyAt) {
    const left = Math.ceil((state.boostReadyAt - now) / 1000);
    return { state, signals: [{ type: 'error', message: `${left}초 후에 다시 사용할 수 있습니다.` }] };
  }
  const effect: ActiveEffect = {
    eventId: 'boost', icon: '☕', title: '커피 부스트',
    kind: 'income', mult: BOOST_MULT, endsAt: now + BOOST_DURATION_SEC * 1000,
  };
  const next: GameState = {
    ...state,
    effects: [...state.effects.filter((e) => e.eventId !== 'boost'), effect],
    boostReadyAt: now + BOOST_COOLDOWN_SEC * 1000,
    stats: { ...state.stats, boostsUsed: state.stats.boostsUsed + 1 },
  };
  return { state: next, signals: [{ type: 'boost' }] };
}

/** 오늘 받을 수 있는 일일 보상이 남아 있는지 */
export function dailyAvailable(state: GameState, now: number): boolean {
  return state.lastDailyDate !== dateKey(now);
}

export function dailyReward(state: GameState, now: number): { money: number; streak: number } {
  const today = dateKey(now);
  const streak = Math.min(DAILY_MAX_STREAK, isNextDay(state.lastDailyDate, today) ? state.dailyStreak + 1 : 1);
  const d = computeDerived(state, now);
  const seconds = DAILY_BASE_SECONDS + (streak - 1) * DAILY_STREAK_SECONDS;
  const money = Math.max(DAILY_MIN_MONEY, Math.round(d.incomePerSec * seconds));
  return { money, streak };
}

export function claimDaily(state: GameState, now: number): TickResult {
  if (!dailyAvailable(state, now)) {
    return { state, signals: [{ type: 'error', message: '오늘 보상은 이미 받았습니다.' }] };
  }
  const { money, streak } = dailyReward(state, now);
  const signals: Signal[] = [];
  let next: GameState = {
    ...state,
    money: state.money + money,
    runEarned: state.runEarned + money,
    lastDailyDate: dateKey(now),
    dailyStreak: streak,
    stats: { ...state.stats, totalEarned: state.stats.totalEarned + money, dailyClaims: state.stats.dailyClaims + 1 },
  };
  signals.push({ type: 'daily', money, streak });
  next = grantAchievements(next, now, signals);
  return { state: next, signals };
}

/** 황금 버그를 잡았을 때의 보상 */
export function catchGolden(state: GameState, now: number): TickResult {
  const d = computeDerived(state, now);
  const money = Math.max(GOLDEN_MIN_MONEY, Math.round(d.incomePerSec * GOLDEN_REWARD_SECONDS));
  const signals: Signal[] = [];
  let next: GameState = {
    ...state,
    money: state.money + money,
    runEarned: state.runEarned + money,
    stats: { ...state.stats, totalEarned: state.stats.totalEarned + money, goldenBugs: state.stats.goldenBugs + 1 },
  };
  signals.push({ type: 'golden', money });
  next = grantAchievements(next, now, signals);
  return { state: next, signals };
}

// ───────────── 리부트(프레스티지) ─────────────

export function prestigeUnlocked(state: GameState): boolean {
  return state.prestigeCount > 0 || (state.level >= PRESTIGE_MIN_LEVEL && state.runEarned >= PRESTIGE_MIN_EARNED);
}

/** 지금 리부트하면 얻는 인사이트 */
export function prestigeGain(state: GameState): number {
  return Math.max(0, insightFor(state.runEarned) - 0);
}

export function canPrestige(state: GameState): boolean {
  return prestigeUnlocked(state) && prestigeGain(state) >= 1;
}

/** 진행도를 초기화하고 인사이트를 얻는다. 업적·튜토리얼·설정·통계는 유지된다. */
export function prestige(state: GameState, now: number): TickResult {
  if (!canPrestige(state)) {
    return { state, signals: [{ type: 'error', message: '아직 리부트할 수 없습니다.' }] };
  }
  const gain = prestigeGain(state);
  const fresh = createInitialState(now);
  const next: GameState = {
    ...fresh,
    settings: state.settings,
    stats: { ...state.stats },
    seenTutorials: state.seenTutorials,
    achievements: state.achievements,
    insight: state.insight + gain,
    prestigeCount: state.prestigeCount + 1,
    runEarned: 0,
    lastDailyDate: state.lastDailyDate,
    dailyStreak: state.dailyStreak,
    createdAt: state.createdAt,
    lastSavedAt: now,
    lastEventAt: now,
  };
  const signals: Signal[] = [{ type: 'prestige', insight: gain }];
  return { state: grantAchievements(next, now, signals), signals };
}

/** 튜토리얼을 본 것으로 표시 */
export function markTutorialSeen(state: GameState, id: string): GameState {
  if (state.seenTutorials.includes(id)) return state;
  return { ...state, seenTutorials: [...state.seenTutorials, id] };
}

export function setAutoDev(state: GameState, on: boolean): GameState {
  return { ...state, autoDev: on };
}

export function autoDevUnlocked(state: GameState): boolean {
  return state.level >= AUTODEV_UNLOCK_LEVEL;
}

/** 업적으로 얻은 영구 수익 보너스 (표시용) */
export function achievementIncomeBonus(state: GameState): number {
  return state.achievements.length * ACHIEVEMENT_INCOME_PER;
}
