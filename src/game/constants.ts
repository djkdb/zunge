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

// ───────── 리부트(프레스티지) ─────────
/** 리부트 해금 조건 */
export const PRESTIGE_MIN_LEVEL = 20;
export const PRESTIGE_MIN_EARNED = 1e10;
/** 인사이트 환산: (이번 회차 수익 / DIVISOR) ^ POW */
export const INSIGHT_DIVISOR = 1e10;
export const INSIGHT_POW = 0.45;
/** 인사이트 1당 영구 보너스 */
export const INSIGHT_INCOME_PER = 0.03;
export const INSIGHT_DEV_PER = 0.012;
/** 업적 1개당 영구 수익 보너스 */
export const ACHIEVEMENT_INCOME_PER = 0.01;

// ───────── 일일 보상 ─────────
/** 연속 출석 최대 배율 단계 */
export const DAILY_MAX_STREAK = 7;
/** 기본 보상: 초당 수익 × 이 초 수 (연속일수에 비례해 증가) */
export const DAILY_BASE_SECONDS = 600;
export const DAILY_STREAK_SECONDS = 300;
/** 신규 플레이어를 위한 최소 보상 */
export const DAILY_MIN_MONEY = 2000;

// ───────── 부스트 ─────────
export const BOOST_DURATION_SEC = 60;
export const BOOST_COOLDOWN_SEC = 300;
export const BOOST_MULT = 2;
export const BOOST_UNLOCK_LEVEL = 2;

// ───────── 황금 버그 ─────────
export const GOLDEN_MIN_INTERVAL_SEC = 100;
export const GOLDEN_MAX_INTERVAL_SEC = 210;
/** 화면에 머무는 시간 */
export const GOLDEN_LIFETIME_SEC = 9;
/** 보상: 초당 수익 × 이 초 수 */
export const GOLDEN_REWARD_SECONDS = 180;
export const GOLDEN_MIN_MONEY = 500;

// ───────── 자동 개발 ─────────
export const AUTODEV_UNLOCK_LEVEL = 16;

/** 로컬 기준 YYYY-MM-DD */
export function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** a 다음 날이 b 인지 (연속 출석 판정) */
export function isNextDay(prev: string, next: string): boolean {
  if (!prev) return false;
  const p = new Date(`${prev}T00:00:00`);
  const n = new Date(`${next}T00:00:00`);
  return Math.round((n.getTime() - p.getTime()) / 86400000) === 1;
}
