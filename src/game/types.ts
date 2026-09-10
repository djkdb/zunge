/** 게임 전체 상태와 데이터 정의 */

export type ProjectTier = 1 | 2 | 3 | 4;

export interface ProjectDef {
  id: string;
  name: string;
  icon: string;
  tier: ProjectTier;
  description: string;
  /** 기본 개발 비용 (원) */
  cost: number;
  /** 기본 개발 시간 (초, 개발력 1 기준) */
  devTime: number;
  /** 출시 시 초당 수익 (원/초) */
  income: number;
  /** 출시 시 즉시 확보되는 사용자 수 */
  users: number;
  /** 완성 시 경험치 */
  xp: number;
  /** 실패(버그) 확률 0~1 */
  risk: number;
  requiredLevel: number;
  requiredAi: number;
}

export type UpgradeId = 'pc' | 'monitor' | 'internet' | 'server' | 'automation' | 'team';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  costMult: number;
  maxLevel: number;
  requiredLevel: number;
  /** 레벨별 효과 요약 문자열 생성 */
  effectLabel: (level: number) => string;
}

export interface AiTierDef {
  tier: number;
  name: string;
  icon: string;
  description: string;
  cost: number;
  requiredLevel: number;
  devSpeedMult: number;
  costReduction: number;
  successBonus: number;
  incomeMult: number;
  /** 화면에 표시되는 AI 오브 색상 */
  color: string;
  orbs: number;
}

export interface StageDef {
  stage: number;
  name: string;
  subtitle: string;
  icon: string;
  cost: number;
  requiredLevel: number;
  incomeMult: number;
  devSpeedMult: number;
  description: string;
}

export interface LevelTitleDef {
  level: number;
  title: string;
}

// ───────── 개발 전략 ─────────

/** 프로젝트를 "어떻게" 만들지에 대한 플레이어의 선택 */
export type DevStrategy = 'fast' | 'stable' | 'quality';

export interface StrategyDef {
  id: DevStrategy;
  /** 화면에 크게 나오는 이름 */
  name: string;
  /** 한 줄 설명 */
  tagline: string;
  pro: string;
  con: string;
  /** 개발 시간 배율 */
  timeMult: number;
  /** 버그 확률 배율 */
  riskMult: number;
  /** 착수 비용 배율 */
  costMult: number;
  /** 출시 후 초당 수익 배율 (이 전략으로 낸 버전이 유지되는 동안 계속 적용) */
  incomeMult: number;
  /** 출시 시 확보 사용자 배율 */
  usersMult: number;
  /** 완성 경험치 배율 */
  xpMult: number;
  /** 강조 색 (accent 토큰 이름이 아니라 실제 색) */
  color: string;
}

export type EventEffectKind = 'income' | 'users' | 'devSpeed';

/** 선택형 이벤트의 선택지 하나 */
export interface EventChoiceDef {
  id: string;
  /** Icon 컴포넌트의 아이콘 이름 */
  icon: string;
  label: string;
  /** 고르면 어떻게 되는지 */
  detail: string;
  tone: 'good' | 'bad' | 'neutral';
  /** 즉시 자금 = 현재 초당 수익 × 초 (음수면 지출) */
  moneySeconds?: number;
  /** 즉시 사용자 증감 비율 */
  usersPct?: number;
  /** 지속 효과 */
  effect?: { kind: EventEffectKind; mult: number; duration: number };
  /**
   * 도박 선택지. chance 확률로 위 효과가 그대로 적용되고,
   * 실패하면 fail 쪽 효과가 대신 적용된다.
   */
  gamble?: {
    chance: number;
    failText: string;
    moneySeconds?: number;
    usersPct?: number;
    effect?: { kind: EventEffectKind; mult: number; duration: number };
  };
  /** 모달을 닫아버렸을 때 자동으로 고르는 안전한 선택지 */
  safe?: boolean;
}

export interface GameEventDef {
  id: string;
  icon: string;
  title: string;
  message: string;
  tone: 'good' | 'bad' | 'neutral';
  weight: number;
  /** 즉시 효과 */
  instantMoneyPct?: number; // 현재 초당 수익 × 초 단위
  instantMoneySeconds?: number;
  instantUsersPct?: number;
  /** 지속 효과 */
  effect?: { kind: EventEffectKind; mult: number; duration: number };
  minLevel?: number;
  /** 있으면 자동 적용 대신 플레이어에게 선택을 묻는다 */
  choices?: EventChoiceDef[];
}

export interface ActiveEffect {
  eventId: string;
  icon: string;
  title: string;
  kind: EventEffectKind;
  mult: number;
  endsAt: number; // epoch ms
}

export interface ActiveDev {
  projectId: string;
  /** 0 ~ 1 */
  progress: number;
  /** 버그 수정 중 여부 */
  bugged: boolean;
  startedAt: number;
  /** 착수할 때 고른 개발 전략 */
  strategy: DevStrategy;
}

export type Mood = 'idle' | 'focus' | 'happy' | 'panic' | 'shock' | 'confident' | 'meltdown';

export interface Settings {
  sound: boolean;
  /** 배경음악. 효과음과 따로 끄고 켤 수 있어야 한다 — 성격이 다른 소리다 */
  music: boolean;
  reducedMotion: boolean;
  /** 업그레이드 구매 단위 (1 / 10 / -1=최대) */
  buyMode: BuyMode;
}

export type BuyMode = 1 | 10 | -1;

export interface Stats {
  totalEarned: number;
  totalSpent: number;
  projectsCompleted: number;
  bugsFixed: number;
  eventsTriggered: number;
  playTime: number; // seconds
  bestIncome: number;
  peakUsers: number;
  offlineEarned: number;
  goldenBugs: number;
  dailyClaims: number;
  boostsUsed: number;
}

export interface GameState {
  version: number;
  money: number;
  users: number;
  level: number;
  xp: number;
  /** 프로젝트별 완성 횟수(버전) */
  projectLevels: Record<string, number>;
  /**
   * 프로젝트별로 "마지막에 출시한 버전을 어떤 전략으로 만들었는지".
   * 출시 후 초당 수익과 사용자 유입에 계속 영향을 준다.
   */
  projectStrategy: Record<string, DevStrategy>;
  activeDevs: ActiveDev[];
  upgrades: Record<UpgradeId, number>;
  aiTier: number;
  stage: number;
  effects: ActiveEffect[];
  lastSavedAt: number;
  lastEventAt: number;
  createdAt: number;
  settings: Settings;
  stats: Stats;
  /** 이미 확인한 스테이지 연출 */
  seenStage: number;

  // ── 튜토리얼 ──
  /** 이미 본 튜토리얼 id */
  seenTutorials: string[];

  // ── 업적 ──
  /** 달성한 업적 id */
  achievements: string[];

  // ── 리부트(프레스티지) ──
  /** 보유 인사이트 — 영구 배율의 원천 */
  insight: number;
  /** 리부트 누적 횟수 */
  prestigeCount: number;
  /** 이번 회차에 번 누적 금액 (리부트 시 인사이트로 환산) */
  runEarned: number;

  // ── 일일 보상 ──
  /** 마지막으로 보상을 받은 날짜 (YYYY-MM-DD, 로컬) */
  lastDailyDate: string;
  dailyStreak: number;

  // ── 부스트 ──
  /** 부스트를 다시 쓸 수 있는 시각 (epoch ms) */
  boostReadyAt: number;

  // ── 자동화 ──
  /** 자동 개발: 여유 슬롯에 가장 비싼 프로젝트를 자동으로 착수 */
  autoDev: boolean;
}

export interface LogEntry {
  id: number;
  time: number;
  icon: string;
  text: string;
  tone: 'good' | 'bad' | 'neutral';
}

export interface OfflineReport {
  seconds: number;
  money: number;
  users: number;
  projects: number;
  efficiency: number;
}

export interface Derived {
  incomePerSec: number;
  projectIncome: number;
  userIncome: number;
  userGrowthPerSec: number;
  maxUsers: number;
  devSpeed: number;
  slots: number;
  costMult: number;
  successBonus: number;
  offlineEfficiency: number;
  offlineCapHours: number;
  xpToNext: number;
  incomeMult: number;
  /** 인사이트 + 업적으로 얻은 영구 배율 */
  legacyIncomeMult: number;
  legacyDevMult: number;
}

// ───────── 업적 ─────────

export type AchievementMetric =
  | 'projects' | 'users' | 'money' | 'level' | 'aiTier' | 'stage'
  | 'bugs' | 'events' | 'offline' | 'prestige' | 'golden' | 'team' | 'allProjects' | 'maxUpgrade';

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  description: string;
  metric: AchievementMetric;
  goal: number;
  /** 달성 시 즉시 지급되는 보너스 (현재 초당 수익 × 초) */
  rewardSeconds: number;
}

// ───────── 튜토리얼 ─────────

export interface TutorialStep {
  /** 강조할 UI 요소의 data-tut 값 */
  target?: string;
  icon: string;
  title: string;
  body: string;
  /** 이 단계에서 이동시킬 탭 */
  tab?: string;
}

export interface TutorialDef {
  id: string;
  /** 첫 실행 안내 여부 — true면 게임 시작 직후 자동 재생 */
  intro?: boolean;
  steps: TutorialStep[];
}
