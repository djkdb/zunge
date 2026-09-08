import type { GameState, OfflineReport } from './types';
import { OFFLINE_MIN_REPORT_SEC } from './constants';
import { computeDerived } from './calc';
import { tick } from './engine';

/** 오프라인 진행을 시뮬레이션하고 보고서를 만든다 */
export function simulateOffline(state: GameState, now: number): { state: GameState; report: OfflineReport | null } {
  const elapsedRaw = Math.max(0, (now - state.lastSavedAt) / 1000);
  if (elapsedRaw <= 0) return { state, report: null };
  // 짧게 자리를 비운 시간도 진행은 시켜야 한다.
  // 보고서(복귀 모달)만 일정 시간 이상일 때 낸다.
  const reportable = elapsedRaw >= OFFLINE_MIN_REPORT_SEC;

  const d = computeDerived(state, now);
  const cap = d.offlineCapHours * 3600;
  const elapsed = Math.min(elapsedRaw, cap);
  const efficiency = d.offlineEfficiency;

  const startMoney = state.money;
  const startUsers = state.users;
  const startProjects = state.stats.projectsCompleted;

  // 개발 진행 정확도를 위해 최대 60초 단위로 나눠 시뮬레이션
  const STEP = 60;
  let cur: GameState = { ...state, effects: [] };
  let remaining = elapsed;
  let simTime = state.lastSavedAt;
  let guard = 0;
  while (remaining > 0 && guard < 2000) {
    const dt = Math.min(STEP, remaining);
    simTime += dt * 1000;
    cur = tick(cur, dt, simTime, { offline: true, incomeMult: efficiency }).state;
    remaining -= dt;
    guard += 1;
  }

  const moneyGained = Math.max(0, cur.money - startMoney);
  const report: OfflineReport | null = !reportable ? null : {
    seconds: elapsed,
    money: moneyGained,
    users: Math.max(0, cur.users - startUsers),
    projects: cur.stats.projectsCompleted - startProjects,
    efficiency,
  };
  cur = {
    ...cur,
    lastEventAt: now,
    // 자리를 비운 동안 번 돈은 보고서를 내지 않는 짧은 구간에서는 통계에 넣지 않는다
    stats: reportable ? { ...cur.stats, offlineEarned: cur.stats.offlineEarned + moneyGained } : cur.stats,
  };
  return { state: cur, report };
}
