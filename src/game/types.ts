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

export type EventEffectKind = 'income' | 'users' | 'devSpeed';

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
}

export type Mood = 'idle' | 'focus' | 'happy' | 'panic' | 'shock' | 'confident' | 'meltdown';

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
}

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
}

export interface GameState {
  version: number;
  money: number;
  users: number;
  level: number;
  xp: number;
  /** 프로젝트별 완성 횟수(버전) */
  projectLevels: Record<string, number>;
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
}
