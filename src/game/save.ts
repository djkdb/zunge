import type { DevStrategy, GameState, UpgradeId } from './types';
import { SAVE_KEY, SAVE_VERSION } from './constants';
import { createInitialState } from './engine';
import { PROJECT_MAP } from './data/projects';
import { UPGRADE_MAP } from './data/upgrades';
import { AI_TIERS } from './data/ai';
import { STAGES } from './data/stages';
import { ACHIEVEMENTS } from './data/achievements';
import { TUTORIALS } from './data/tutorials';
import { DEFAULT_STRATEGY, isDevStrategy } from './data/strategies';

const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));
const TUTORIAL_IDS = new Set(TUTORIALS.map((t) => t.id));

const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_VALUE): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
};
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** 임의의 JSON 객체를 검증하고 안전한 GameState로 변환 */
export function sanitize(raw: unknown, now = Date.now()): GameState {
  const base = createInitialState(now);
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;

  const projectLevels: Record<string, number> = {};
  if (r.projectLevels && typeof r.projectLevels === 'object') {
    for (const [id, v] of Object.entries(r.projectLevels as Record<string, unknown>)) {
      if (PROJECT_MAP[id]) projectLevels[id] = Math.floor(num(v, 0, 0, 10000));
    }
  }

  const upgrades = { ...base.upgrades };
  if (r.upgrades && typeof r.upgrades === 'object') {
    for (const id of Object.keys(upgrades) as UpgradeId[]) {
      upgrades[id] = Math.floor(num((r.upgrades as Record<string, unknown>)[id], 0, 0, UPGRADE_MAP[id].maxLevel));
    }
  }

  const activeDevs = Array.isArray(r.activeDevs)
    ? r.activeDevs
        .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object' && typeof (a as Record<string, unknown>).projectId === 'string' && !!PROJECT_MAP[(a as Record<string, unknown>).projectId as string])
        .map((a) => ({
          projectId: a.projectId as string,
          progress: num(a.progress, 0, 0, 0.999),
          bugged: bool(a.bugged, false),
          startedAt: num(a.startedAt, now),
          // 전략이 없던 시절의 저장본은 STABLE 로 이어받는다
          strategy: isDevStrategy(a.strategy) ? a.strategy : DEFAULT_STRATEGY,
        }))
    : [];
  // 중복 제거
  const seen = new Set<string>();
  const dedupedDevs = activeDevs.filter((a) => (seen.has(a.projectId) ? false : (seen.add(a.projectId), true)));

  const projectStrategy: Record<string, DevStrategy> = {};
  if (r.projectStrategy && typeof r.projectStrategy === 'object') {
    for (const [id, v] of Object.entries(r.projectStrategy as Record<string, unknown>)) {
      if (PROJECT_MAP[id] && isDevStrategy(v)) projectStrategy[id] = v;
    }
  }

  const effects = Array.isArray(r.effects)
    ? r.effects
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map((e) => ({
          eventId: String(e.eventId ?? ''),
          icon: String(e.icon ?? '✨'),
          title: String(e.title ?? ''),
          kind: (['income', 'users', 'devSpeed'] as const).includes(e.kind as 'income') ? (e.kind as 'income' | 'users' | 'devSpeed') : 'income',
          mult: num(e.mult, 1, 0, 10),
          endsAt: num(e.endsAt, 0),
        }))
        .filter((e) => e.endsAt > now)
    : [];

  const settings = r.settings && typeof r.settings === 'object' ? (r.settings as Record<string, unknown>) : {};
  const stats = r.stats && typeof r.stats === 'object' ? (r.stats as Record<string, unknown>) : {};

  const stage = Math.floor(num(r.stage, 1, 1, STAGES.length));
  return {
    version: SAVE_VERSION,
    money: num(r.money, base.money),
    users: num(r.users, 0),
    level: Math.floor(num(r.level, 1, 1, 100)),
    xp: num(r.xp, 0),
    projectLevels,
    projectStrategy,
    activeDevs: dedupedDevs,
    upgrades,
    aiTier: Math.floor(num(r.aiTier, 1, 1, AI_TIERS.length)),
    stage,
    effects,
    lastSavedAt: num(r.lastSavedAt, now, 0, now),
    lastEventAt: num(r.lastEventAt, now, 0, now),
    createdAt: num(r.createdAt, now, 0, now),
    settings: {
      sound: bool(settings.sound, true),
      reducedMotion: bool(settings.reducedMotion, false),
      buyMode: ([1, 10, -1] as const).includes(settings.buyMode as 1) ? (settings.buyMode as 1 | 10 | -1) : 1,
    },
    stats: {
      totalEarned: num(stats.totalEarned, 0),
      totalSpent: num(stats.totalSpent, 0),
      projectsCompleted: Math.floor(num(stats.projectsCompleted, 0)),
      bugsFixed: Math.floor(num(stats.bugsFixed, 0)),
      eventsTriggered: Math.floor(num(stats.eventsTriggered, 0)),
      playTime: num(stats.playTime, 0),
      bestIncome: num(stats.bestIncome, 0),
      peakUsers: num(stats.peakUsers, 0),
      offlineEarned: num(stats.offlineEarned, 0),
      goldenBugs: Math.floor(num(stats.goldenBugs, 0)),
      dailyClaims: Math.floor(num(stats.dailyClaims, 0)),
      boostsUsed: Math.floor(num(stats.boostsUsed, 0)),
    },
    seenStage: Math.floor(num(r.seenStage, stage, 1, STAGES.length)),
    seenTutorials: strList(r.seenTutorials, TUTORIAL_IDS),
    achievements: strList(r.achievements, ACHIEVEMENT_IDS),
    insight: Math.floor(num(r.insight, 0)),
    prestigeCount: Math.floor(num(r.prestigeCount, 0)),
    runEarned: num(r.runEarned, num(stats.totalEarned, 0)),
    lastDailyDate: typeof r.lastDailyDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.lastDailyDate) ? r.lastDailyDate : '',
    dailyStreak: Math.floor(num(r.dailyStreak, 0, 0, 999)),
    boostReadyAt: num(r.boostReadyAt, 0),
    autoDev: bool(r.autoDev, false),
  };
}

/** 알려진 id 만 남기고 중복을 제거한다 */
function strList(v: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item === 'string' && allowed.has(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadGame(): GameState | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(SAVE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch (err) {
    console.warn('[ZUN] 저장 데이터를 읽을 수 없어 새 게임을 시작합니다.', err);
    return null;
  }
}

/**
 * 저장본의 lastSavedAt 만 읽는다.
 * 다른 탭이 먼저 저장했는지 확인하는 용도라 전체를 파싱하지 않는다.
 */
export function storedSavedAt(): number | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(SAVE_KEY);
    if (!raw) return null;
    const v = (JSON.parse(raw) as { lastSavedAt?: unknown }).lastSavedAt;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): boolean {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('[ZUN] 저장 실패', err);
    return false;
  }
}

export function clearSave(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

const EXPORT_PREFIX = 'ZUN1.';

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
function fromBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

export function exportSave(state: GameState): string {
  return EXPORT_PREFIX + toBase64(JSON.stringify(state));
}

export function importSave(code: string): GameState | null {
  try {
    const trimmed = code.trim();
    if (!trimmed) return null;
    let json: string;
    if (trimmed.startsWith(EXPORT_PREFIX)) json = fromBase64(trimmed.slice(EXPORT_PREFIX.length));
    else if (trimmed.startsWith('{')) json = trimmed;
    else json = fromBase64(trimmed);
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitize(parsed);
  } catch {
    return null;
  }
}
