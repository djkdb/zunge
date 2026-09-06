/** 게임 밸런스 상수 */
export const SAVE_KEY = 'zun-ai-dev-tycoon-save';
export const SAVE_VERSION = 1;

export const TICK_MS = 100;
export const AUTOSAVE_MS = 5000;

/** 이 시간 이상 화면이 멈춰 있었다면 오프라인으로 처리 */
export const OFFLINE_THRESHOLD_SEC = 45;
export const OFFLINE_MIN_REPORT_SEC = 60;
export const OFFLINE_BASE_CAP_HOURS = 8;
export const OFFLINE_BASE_EFFICIENCY = 0.5;

export const START_MONEY = 1000;

/** 사용자 광고 수익: coef × users^pow (사용자가 많아질수록 1인당 수익은 감소) */
export const USER_INCOME_COEF = 0.4;
export const USER_INCOME_POW = 0.8;

/** 출시 사용자 수 대비 초당 유입 비율 (users / ratio 명/초) */
export const USER_GROWTH_DIVISOR = 150;

/** 사용자 수에 따른 프로젝트 수익 배율: 1 + log10(1+users) * 계수 */
export const USER_INCOME_LOG_FACTOR = 0.12;

/** 레벨당 개발 속도 보너스 */
export const DEV_SPEED_PER_LEVEL = 0.01;

/** 프로젝트 버전 업 시 비용/수익 배율 */
export const PROJECT_VERSION_COST_MULT = 2.0;
export const PROJECT_VERSION_INCOME_MULT = 1.3;
export const PROJECT_VERSION_USERS_MULT = 1.3;
export const PROJECT_VERSION_XP_MULT = 1.2;
export const PROJECT_VERSION_TIME_MULT = 1.15;

/** 버그 발생 시 진행도가 되돌아가는 비율 */
export const BUG_PROGRESS_PENALTY = 0.35;

export const EVENT_MIN_INTERVAL_SEC = 55;
export const EVENT_MAX_INTERVAL_SEC = 110;

export const MAX_LEVEL = 100;

export function xpToNext(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.floor(100 * Math.pow(level, 2.1) + 50 * level);
}
