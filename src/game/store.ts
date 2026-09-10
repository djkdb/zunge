import type { BuyMode, DevStrategy, GameEventDef, GameState, LogEntry, Mood, OfflineReport, Settings, UpgradeId } from './types';
import {
  AUTOSAVE_MS, GOLDEN_LIFETIME_SEC, GOLDEN_MAX_INTERVAL_SEC, GOLDEN_MIN_INTERVAL_SEC, OFFLINE_THRESHOLD_SEC, TICK_MS,
} from './constants';
import { createStore } from './createStore';
import {
  buyAi, buyStage, buyUpgrade, cancelProject, catchGolden, claimDaily, createInitialState, dailyAvailable, markStageSeen,
  markTutorialSeen, prestige, setAutoDev, startProject, tapZun, tick, updateSettings, useBoost, applyEventChoice, type Signal,
} from './engine';
import { strategyDef } from './data/strategies';
import { TUTORIAL_MAP, pendingTutorial } from './data/tutorials';
import { SAVE_KEY } from './constants';
import { clearSave, exportSave, importSave, loadGame, saveGame, storedSavedAt } from './save';
import { simulateOffline } from './offline';
import { PROJECT_MAP } from './data/projects';
import { UPGRADE_MAP } from './data/upgrades';
import { aiTier } from './data/ai';
import { stageDef } from './data/stages';
import { formatMoney, formatUsers } from './format';
import { computeDerived } from './calc';
import type { Derived } from './types';
import { setMusicEnabled, setSoundEnabled, sfx } from './audio';
import { initCharacterAssets } from './characterAssets';

// ───────────── 게임 상태 스토어 ─────────────
export const gameStore = createStore<GameState>(createInitialState());

/** 파생 스탯 캐시: 게임 상태가 바뀔 때마다 한 번만 계산 */
export const derivedStore = createStore<Derived>(computeDerived(gameStore.get()));
gameStore.subscribe(() => derivedStore.set(computeDerived(gameStore.get())));

// ───────────── UI(휘발성) 상태 ─────────────
export interface FloatingText {
  id: number;
  text: string;
  x: number; // 0~100 (%)
  y: number;
  tone: 'money' | 'users' | 'xp' | 'good' | 'bad';
}

export interface Toast {
  id: number;
  icon: string;
  title: string;
  message: string;
  tone: 'good' | 'bad' | 'neutral';
}

/** 화면에 떠 있는 황금 버그 */
export interface GoldenBug {
  id: number;
  /** 씬 기준 위치 (%) */
  x: number;
  y: number;
  expiresAt: number;
}

export interface UiState {
  mood: Mood;
  /** 다른 탭이 같은 저장본을 이어받아 이 탭이 멈춘 상태 */
  conflict: boolean;
  /** 전략 선택 창을 띄운 프로젝트 id */
  strategyFor: string | null;
  /** 선택을 기다리는 이벤트 */
  eventChoice: GameEventDef | null;
  logs: LogEntry[];
  toasts: Toast[];
  floats: FloatingText[];
  offlineReport: OfflineReport | null;
  levelUpTo: number | null;
  stageIntro: number | null;
  /** 재생 중인 튜토리얼 id */
  tutorial: string | null;
  /** 튜토리얼 내 현재 단계 */
  tutorialStep: number;
  dailyOpen: boolean;
  prestigeResult: number | null;
  golden: GoldenBug | null;
  lastSaveAt: number;
  ready: boolean;
}

export const uiStore = createStore<UiState>({
  mood: 'idle',
  conflict: false,
  strategyFor: null,
  eventChoice: null,
  logs: [],
  toasts: [],
  floats: [],
  offlineReport: null,
  levelUpTo: null,
  stageIntro: null,
  tutorial: null,
  tutorialStep: 0,
  dailyOpen: false,
  prestigeResult: null,
  golden: null,
  lastSaveAt: 0,
  ready: false,
});

/** 튜토리얼이 탭 이동을 요청할 때 App 이 구독하는 콜백 */
let tabRequestHandler: ((tab: string) => void) | null = null;
export function onTabRequest(fn: ((tab: string) => void) | null): void {
  tabRequestHandler = fn;
}
export function requestTab(tab: string): void {
  tabRequestHandler?.(tab);
}

let idSeq = 1;
const nextId = () => idSeq++;

let moodTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 튜토리얼 사이의 최소 간격.
 * 첫 출시 직후에는 전략 · 업그레이드 · 업적 안내 조건이 한꺼번에 충족돼
 * 축하 순간이 카드 다섯 장으로 덮인다. 직전 안내를 닫고 나서 한 박자 쉰다.
 */
const TUTORIAL_GAP_MS = 25000;

/** 한 번의 tick 에 넘기는 최대 시간 — 밀린 시간은 이 단위로 나눠 따라잡는다 */
const MAX_STEP_SEC = 5;
let lastTutorialAt = 0;

function baseMood(state: GameState): Mood {
  if (state.activeDevs.some((a) => a.bugged)) return 'meltdown';
  if (state.activeDevs.length > 0) return 'focus';
  return 'idle';
}

/** 일시적인 감정 표현 후 기본 상태로 복귀 */
export function setMood(mood: Mood, ms = 2500): void {
  uiStore.set((u) => ({ ...u, mood }));
  if (moodTimer) clearTimeout(moodTimer);
  moodTimer = setTimeout(() => {
    moodTimer = null;
    uiStore.set((u) => ({ ...u, mood: baseMood(gameStore.get()) }));
  }, ms);
}

function refreshBaseMood(): void {
  if (moodTimer) return;
  const m = baseMood(gameStore.get());
  if (uiStore.get().mood !== m) uiStore.set((u) => ({ ...u, mood: m }));
}

export function pushLog(icon: string, text: string, tone: LogEntry['tone'] = 'neutral'): void {
  uiStore.set((u) => ({
    ...u,
    logs: [{ id: nextId(), time: Date.now(), icon, text, tone }, ...u.logs].slice(0, 60),
  }));
}

export function pushToast(icon: string, title: string, message: string, tone: Toast['tone'] = 'neutral', ms = 4200): void {
  const id = nextId();
  uiStore.set((u) => ({ ...u, toasts: [...u.toasts, { id, icon, title, message, tone }].slice(-2) }));
  setTimeout(() => uiStore.set((u) => ({ ...u, toasts: u.toasts.filter((t) => t.id !== id) })), ms);
}

export function dismissToast(id: number): void {
  uiStore.set((u) => ({ ...u, toasts: u.toasts.filter((t) => t.id !== id) }));
}

export function pushFloat(text: string, tone: FloatingText['tone'], x?: number, y?: number): void {
  if (gameStore.get().settings.reducedMotion) return;
  const id = nextId();
  const fx = x ?? 35 + Math.random() * 30;
  const fy = y ?? 45 + Math.random() * 20;
  uiStore.set((u) => ({ ...u, floats: [...u.floats, { id, text, x: fx, y: fy, tone }].slice(-12) }));
  setTimeout(() => uiStore.set((u) => ({ ...u, floats: u.floats.filter((f) => f.id !== id) })), 1400);
}

// ───────────── 신호 처리 ─────────────
let incomeFloatAcc = 0;
let incomeFloatTimer = 0;

function handleSignals(signals: Signal[], now: number): void {
  for (const s of signals) {
    switch (s.type) {
      case 'income': {
        incomeFloatAcc += s.amount;
        if (now - incomeFloatTimer > 2200 && incomeFloatAcc >= 1) {
          incomeFloatTimer = now;
          pushFloat(`+${formatMoney(incomeFloatAcc)}`, 'money', 58 + Math.random() * 20, 30 + Math.random() * 15);
          incomeFloatAcc = 0;
        }
        break;
      }
      case 'projectStart': {
        const p = PROJECT_MAP[s.projectId];
        const st = strategyDef(s.strategy);
        pushLog('🛠️', `${p.name} 개발 시작 — ${st.name} (${st.tagline})`);
        // 어떤 전략을 골랐는지 ZUN의 표정으로도 알려준다
        setMood(s.strategy === 'fast' ? 'focus' : s.strategy === 'quality' ? 'shock' : 'confident', 1600);
        sfx.tap();
        break;
      }
      case 'projectComplete': {
        const p = PROJECT_MAP[s.projectId];
        const v = s.version > 1 ? ` v${s.version}` : '';
        pushLog('🚀', `${p.name}${v} 출시! +${formatMoney(s.money)}, 사용자 +${formatUsers(s.users)}, XP +${s.xp}`, 'good');
        pushToast(p.icon, `${p.name}${v} 출시!`, `출시 보너스 +${formatMoney(s.money)} · 사용자 +${formatUsers(s.users)}`, 'good', 3500);
        pushFloat(`+${formatMoney(s.money)}`, 'money', 50, 40);
        pushFloat(`+${formatUsers(s.users)} 사용자`, 'users', 60, 52);
        pushFloat(`+${s.xp} XP`, 'xp', 40, 58);
        // 큰 성공이면 자신만만하게, 평범하면 기쁘게
        setMood(s.version >= 3 || p.tier >= 3 ? 'confident' : 'happy', 3000);
        sfx.complete();
        break;
      }
      case 'bug': {
        const p = PROJECT_MAP[s.projectId];
        pushLog('🐛', `${p.name}에서 버그 발생! 수정 중...${s.cost > 0 ? ` (대응 비용 -${formatMoney(s.cost)})` : ''}`, 'bad');
        pushToast(
          '🐛',
          '버그 발생!',
          s.cost > 0
            ? `${p.name} 출시 직전에 버그가 터졌습니다. 긴급 대응 비용 -${formatMoney(s.cost)}`
            : `${p.name} 출시 직전에 버그가 발견됐습니다. ZUN이 멘붕에 빠졌습니다.`,
          'bad',
          3500,
        );
        pushFloat(s.cost > 0 ? `-${formatMoney(s.cost)}` : '🐛 BUG!', 'bad', 45, 45);
        setMood('meltdown', 3500);
        sfx.error();
        break;
      }
      case 'levelUp': {
        pushLog('⭐', `레벨 ${s.level} 달성!`, 'good');
        uiStore.set((u) => ({ ...u, levelUpTo: s.level }));
        setMood('confident', 4000);
        sfx.levelUp();
        break;
      }
      case 'eventChoice': {
        // 자동으로 처리하지 않고 플레이어에게 묻는다
        uiStore.set((u) => ({ ...u, eventChoice: s.def }));
        setMood(s.def.tone === 'bad' ? 'panic' : 'shock', 2500);
        sfx.event(s.def.tone !== 'bad');
        break;
      }
      case 'event': {
        const extra = s.money ? ` (+${formatMoney(s.money)})` : s.users ? ` (+${formatUsers(s.users)})` : '';
        pushLog(s.def.icon, `${s.def.message}${extra}`, s.def.tone);
        pushToast(s.def.icon, s.def.title, s.def.message + extra, s.def.tone, 5000);
        if (s.money) pushFloat(`+${formatMoney(s.money)}`, 'money', 50, 35);
        if (s.users) pushFloat(`+${formatUsers(s.users)}`, 'users', 55, 50);
        setMood(s.def.tone === 'bad' ? 'panic' : s.def.tone === 'good' ? 'shock' : 'happy', 3000);
        sfx.event(s.def.tone !== 'bad');
        break;
      }
      case 'upgrade': {
        const u = UPGRADE_MAP[s.id];
        pushLog(u.icon, `${u.name} Lv.${s.level} 업그레이드!`, 'good');
        setMood('happy', 1500);
        sfx.buy();
        break;
      }
      case 'ai': {
        const t = aiTier(s.tier);
        pushLog(t.icon, `${t.name} 도입! 개발 속도 ${t.devSpeedMult}배`, 'good');
        pushToast(t.icon, `${t.name} 도입!`, t.description, 'good', 4500);
        setMood('shock', 3000);
        sfx.levelUp();
        break;
      }
      case 'stage': {
        const st = stageDef(s.stage);
        pushLog(st.icon, `${st.name}(으)로 이사했습니다!`, 'good');
        uiStore.set((u) => ({ ...u, stageIntro: s.stage }));
        setMood('shock', 5000);
        sfx.stage();
        break;
      }
      case 'error': {
        pushToast('⚠️', '앗!', s.message, 'bad', 2200);
        setMood('panic', 1500);
        sfx.error();
        break;
      }
      case 'tap': {
        pushFloat(`+${formatMoney(s.money)}`, 'money', 40 + Math.random() * 20, 35 + Math.random() * 10);
        sfx.tap();
        break;
      }
      case 'achievement': {
        pushLog('🏆', `업적 달성: ${s.def.name} (+${formatMoney(s.money)})`, 'good');
        pushToast(s.def.icon, `업적 달성! ${s.def.name}`, `보너스 +${formatMoney(s.money)} · 영구 수익 +1%`, 'good', 3800);
        pushFloat(`🏆 +${formatMoney(s.money)}`, 'good', 50, 42);
        setMood('confident', 2500);
        sfx.levelUp();
        break;
      }
      case 'boost': {
        pushLog('☕', '커피 부스트! 60초 동안 수익 2배', 'good');
        pushFloat('☕ x2!', 'good', 50, 40);
        setMood('confident', 2000);
        sfx.buy();
        break;
      }
      case 'golden': {
        pushLog('✨', `황금 버그를 잡았습니다! +${formatMoney(s.money)}`, 'good');
        pushToast('✨', '황금 버그 포획!', `보너스 +${formatMoney(s.money)}`, 'good', 3000);
        pushFloat(`+${formatMoney(s.money)}`, 'money', 50, 40);
        setMood('shock', 2500);
        sfx.coin();
        break;
      }
      case 'daily': {
        pushLog('🎁', `${s.streak}일 연속 출석 보상 +${formatMoney(s.money)}`, 'good');
        setMood('happy', 2500);
        sfx.complete();
        break;
      }
      case 'prestige': {
        pushLog('🔄', `회사를 리부트했습니다. 인사이트 +${s.insight}`, 'good');
        uiStore.set((u) => ({ ...u, prestigeResult: s.insight }));
        setMood('confident', 4000);
        sfx.stage();
        break;
      }
    }
  }
}

// ───────────── 액션 ─────────────
export const actions = {
  /** 전략 선택 창을 연다 (실제 착수는 confirmStrategy 에서) */
  openStrategy(id: string): void {
    uiStore.set((u) => ({ ...u, strategyFor: id }));
  },
  closeStrategy(): void {
    uiStore.set((u) => ({ ...u, strategyFor: null }));
  },
  /** 전략을 골라 실제로 착수한다 */
  confirmStrategy(id: string, strategy: DevStrategy): void {
    uiStore.set((u) => ({ ...u, strategyFor: null }));
    actions.startProject(id, strategy);
  },
  startProject(id: string, strategy: DevStrategy = 'stable'): void {
    const r = startProject(gameStore.get(), id, Date.now(), strategy);
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
    refreshBaseMood();
  },
  /** 선택형 이벤트에서 하나를 고른다 */
  resolveEventChoice(choiceId: string): void {
    const def = uiStore.get().eventChoice;
    if (!def) return;
    uiStore.set((u) => ({ ...u, eventChoice: null }));
    const now = Date.now();
    const { state, signals, choice, failed } = applyEventChoice(gameStore.get(), def, choiceId, now);
    gameStore.set(state);
    if (!choice) return;

    // 금액·사용자 변화 연출(플로팅 숫자)은 event 시그널이 처리한다
    for (const sig of signals) {
      if (sig.type !== 'event') continue;
      if (sig.money) pushFloat(`${sig.money > 0 ? '+' : ''}${formatMoney(sig.money)}`, sig.money > 0 ? 'money' : 'bad', 50, 35);
      if (sig.users) pushFloat(`${sig.users > 0 ? '+' : ''}${formatUsers(sig.users)}`, sig.users > 0 ? 'users' : 'bad', 55, 50);
    }

    const result = failed && choice.gamble ? choice.gamble.failText : choice.detail;
    const tone = failed ? 'bad' : choice.tone;
    pushLog(def.icon, `${def.title} — ${choice.label}: ${result}`, tone);
    pushToast(def.icon, `${def.title} · ${choice.label}`, result, tone, 4200);
    setMood(tone === 'bad' ? 'panic' : tone === 'good' ? 'shock' : 'confident', 2600);
    sfx.event(tone !== 'bad');
    refreshBaseMood();
  },
  cancelProject(id: string): void {
    const r = cancelProject(gameStore.get(), id);
    gameStore.set(r.state);
    pushLog('↩️', `${PROJECT_MAP[id].name} 개발을 취소했습니다. (비용 50% 환불)`);
    refreshBaseMood();
  },
  buyUpgrade(id: UpgradeId, mode: BuyMode = gameStore.get().settings.buyMode): void {
    const r = buyUpgrade(gameStore.get(), id, mode);
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  setBuyMode(mode: BuyMode): void {
    gameStore.set((st) => updateSettings(st, { buyMode: mode }));
  },
  useBoost(): void {
    const r = useBoost(gameStore.get(), Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  openDaily(): void {
    uiStore.set((u) => ({ ...u, dailyOpen: true }));
  },
  closeDaily(): void {
    uiStore.set((u) => ({ ...u, dailyOpen: false }));
  },
  claimDaily(): void {
    const r = claimDaily(gameStore.get(), Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
    save();
  },
  catchGolden(): void {
    if (!uiStore.get().golden) return;
    uiStore.set((u) => ({ ...u, golden: null }));
    const r = catchGolden(gameStore.get(), Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  setAutoDev(on: boolean): void {
    gameStore.set((st) => setAutoDev(st, on));
    pushLog('🔁', on ? '자동 개발을 켰습니다.' : '자동 개발을 껐습니다.');
    save();
  },
  prestige(): void {
    const r = prestige(gameStore.get(), Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
    save();
  },
  closePrestigeResult(): void {
    uiStore.set((u) => ({ ...u, prestigeResult: null }));
  },
  nextTutorialStep(): void {
    const u = uiStore.get();
    if (!u.tutorial) return;
    const def = TUTORIAL_MAP[u.tutorial];
    const step = u.tutorialStep + 1;
    if (!def || step >= def.steps.length) {
      gameStore.set((st) => markTutorialSeen(st, u.tutorial as string));
      uiStore.set((x) => ({ ...x, tutorial: null, tutorialStep: 0 }));
      lastTutorialAt = Date.now();
      save();
      return;
    }
    uiStore.set((x) => ({ ...x, tutorialStep: step }));
    const target = def.steps[step]?.tab;
    if (target) requestTab(target);
  },
  skipTutorial(): void {
    const u = uiStore.get();
    if (!u.tutorial) return;
    gameStore.set((st) => markTutorialSeen(st, u.tutorial as string));
    uiStore.set((x) => ({ ...x, tutorial: null, tutorialStep: 0 }));
    lastTutorialAt = Date.now();
    save();
  },
  /** 설정에서 모든 튜토리얼 다시 보기 */
  resetTutorials(): void {
    lastTutorialAt = 0;
    gameStore.set((st) => ({ ...st, seenTutorials: [] }));
    uiStore.set((u) => ({ ...u, tutorial: null, tutorialStep: 0 }));
    pushToast('📘', '튜토리얼 초기화', '처음부터 다시 안내해 드릴게요.', 'good', 2500);
    save();
  },
  buyAi(): void {
    const r = buyAi(gameStore.get());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  buyStage(): void {
    const r = buyStage(gameStore.get());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  tapZun(): void {
    const r = tapZun(gameStore.get(), Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
  },
  updateSettings(patch: Partial<Settings>): void {
    gameStore.set((s) => updateSettings(s, patch));
    if (patch.sound !== undefined) setSoundEnabled(patch.sound);
    if (patch.music !== undefined) setMusicEnabled(patch.music);
    save();
  },
  closeOfflineReport(): void {
    uiStore.set((u) => ({ ...u, offlineReport: null }));
  },
  closeLevelUp(): void {
    uiStore.set((u) => ({ ...u, levelUpTo: null }));
  },
  closeStageIntro(): void {
    gameStore.set((s) => markStageSeen(s));
    uiStore.set((u) => ({ ...u, stageIntro: null }));
    save();
  },
  save(): boolean {
    return save();
  },
  reset(): void {
    clearSave();
    const fresh = createInitialState();
    gameStore.set(fresh);
    uiStore.set((u) => ({
      ...u, logs: [], toasts: [], floats: [], offlineReport: null, levelUpTo: null,
      stageIntro: null, tutorial: null, tutorialStep: 0, dailyOpen: false, prestigeResult: null, golden: null, mood: 'idle',
      strategyFor: null, eventChoice: null, conflict: false,
    }));
    pushLog('🌱', '새로운 시작! ZUN의 자취방에서 다시 출발합니다.');
    save();
  },
  exportSave(): string {
    return exportSave(gameStore.get());
  },
  importSave(code: string): boolean {
    const parsed = importSave(code);
    if (!parsed) return false;
    gameStore.set({ ...parsed, lastSavedAt: Date.now() });
    setSoundEnabled(parsed.settings.sound);
    setMusicEnabled(parsed.settings.music);
    uiStore.set((u) => ({ ...u, logs: [], toasts: [], floats: [], mood: baseMood(parsed) }));
    pushLog('📥', '저장 데이터를 불러왔습니다.', 'good');
    save();
    return true;
  },
};

/**
 * 이 탭이 마지막으로 저장한 시각.
 * 저장본이 이것보다 새로우면 다른 탭이 같은 세이브를 이어받았다는 뜻이다.
 */
let mySavedAt = 0;

function save(): boolean {
  if (uiStore.get().conflict) return false;
  // 다른 탭이 먼저 저장했다면 덮어쓰지 않는다.
  // 덮어쓰면 그 탭에서 산 업그레이드·프로젝트가 조용히 사라진다.
  const disk = storedSavedAt();
  if (mySavedAt && disk !== null && disk > mySavedAt + 1) {
    stopGame();
    uiStore.set((u) => ({ ...u, conflict: true }));
    return false;
  }
  const now = Date.now();
  gameStore.set((s) => ({ ...s, lastSavedAt: now }));
  const ok = saveGame(gameStore.get());
  if (ok) {
    mySavedAt = now;
    uiStore.set((u) => ({ ...u, lastSaveAt: now }));
  }
  return ok;
}

// ───────────── 게임 루프 ─────────────
let loopHandle: ReturnType<typeof setInterval> | null = null;
let lastTick = 0;
let lastSave = 0;
let booted = false;
let nextGoldenAt = 0;

function scheduleGolden(now: number): void {
  nextGoldenAt = now + (GOLDEN_MIN_INTERVAL_SEC + Math.random() * (GOLDEN_MAX_INTERVAL_SEC - GOLDEN_MIN_INTERVAL_SEC)) * 1000;
}

/** 황금 버그 등장/소멸 관리 */
function updateGolden(now: number): void {
  const ui = uiStore.get();
  if (ui.golden) {
    if (ui.golden.expiresAt <= now) uiStore.set((u) => ({ ...u, golden: null }));
    return;
  }
  if (now < nextGoldenAt) return;
  scheduleGolden(now);
  // 아직 수익이 없으면 등장시키지 않는다
  if (derivedStore.get().incomePerSec <= 0) return;
  uiStore.set((u) => ({
    ...u,
    golden: {
      id: Date.now(),
      x: 10 + Math.random() * 76,
      y: 22 + Math.random() * 46,
      expiresAt: now + GOLDEN_LIFETIME_SEC * 1000,
    },
  }));
}

/** 조건이 충족된 튜토리얼을 자동으로 재생 */
function updateTutorial(): void {
  const ui = uiStore.get();
  if (ui.tutorial) return;
  // 다른 모달이 떠 있으면 순서를 양보한다
  if (ui.offlineReport || ui.levelUpTo || ui.stageIntro || ui.dailyOpen || ui.prestigeResult || ui.eventChoice || ui.strategyFor) return;
  const id = pendingTutorial(gameStore.get());
  if (!id) return;
  // 첫 안내(intro)는 기다리지 않는다
  const now = Date.now();
  if (id !== 'intro' && lastTutorialAt && now - lastTutorialAt < TUTORIAL_GAP_MS) return;
  lastTutorialAt = now;
  uiStore.set((u) => ({ ...u, tutorial: id, tutorialStep: 0 }));
  const first = TUTORIAL_MAP[id]?.steps[0]?.tab;
  if (first) requestTab(first);
}

function applyOffline(now: number): void {
  const { state, report } = simulateOffline(gameStore.get(), now);
  gameStore.set({ ...state, lastSavedAt: now });
  if (report && (report.money > 0 || report.projects > 0 || report.users > 0)) {
    uiStore.set((u) => ({ ...u, offlineReport: report }));
    pushLog('💤', `부재중 ${Math.round(report.seconds / 60)}분 동안 ${formatMoney(report.money)}을 벌었습니다.`, 'good');
  }
  save();
}

export function bootGame(): void {
  if (booted) return;
  booted = true;
  void initCharacterAssets();
  const now = Date.now();
  const loaded = loadGame();
  if (loaded) {
    gameStore.set(loaded);
    applyOffline(now);
    pushLog('👋', '다시 돌아온 걸 환영합니다! ZUN이 기다리고 있었어요.');
  } else {
    gameStore.set(createInitialState(now));
    pushLog('🌱', '작은 자취방에서 ZUN의 개발자 인생이 시작됩니다. 첫 프로젝트를 만들어보세요!');
    save();
  }
  // 새로 온 사람에게도 똑같이 걸어야 한다 — 불러온 경우에만 하면 첫 방문자는 소리가 없다
  const { sound, music } = gameStore.get().settings;
  setSoundEnabled(sound);
  setMusicEnabled(music);
  if (dailyAvailable(gameStore.get(), now) && gameStore.get().stats.projectsCompleted > 0) {
    uiStore.set((u) => ({ ...u, dailyOpen: true }));
  }
  uiStore.set((u) => ({ ...u, ready: true, mood: baseMood(gameStore.get()) }));
  lastTick = now;
  lastSave = now;
  scheduleGolden(now);

  loopHandle = setInterval(() => {
    const t = Date.now();
    const dtSec = (t - lastTick) / 1000;
    lastTick = t;
    if (dtSec <= 0) return;
    if (dtSec > OFFLINE_THRESHOLD_SEC) {
      // 탭이 오래 멈춰 있었음 → 오프라인 처리
      gameStore.set((s) => ({ ...s, lastSavedAt: t - dtSec * 1000 }));
      applyOffline(t);
      return;
    }
    // 탭이 잠깐 멈췄다 돌아오면 밀린 시간만큼 따라잡는다.
    // 한 번에 큰 dt 를 넘기면 개발 진행·버그 판정이 뭉개지므로 5초씩 나눠 돌린다.
    let remain = dtSec;
    let st = gameStore.get();
    const signals: Signal[] = [];
    let guard = 0;
    while (remain > 0 && guard < 16) {
      guard += 1;
      const step = Math.min(MAX_STEP_SEC, remain);
      remain -= step;
      // 선택 창이 떠 있으면 새 선택형 이벤트는 뽑지 않는다
      const r = tick(st, step, t - remain * 1000, {
        allowChoiceEvents: uiStore.get().eventChoice === null && !signals.some((sig) => sig.type === 'eventChoice'),
      });
      st = r.state;
      signals.push(...r.signals);
    }
    gameStore.set(st);
    handleSignals(signals, t);
    refreshBaseMood();
    updateGolden(t);
    updateTutorial();
    if (t - lastSave > AUTOSAVE_MS) {
      lastSave = t;
      save();
    }
  }, TICK_MS);

  const onHide = () => {
    if (document.visibilityState === 'hidden') save();
  };
  document.addEventListener('visibilitychange', onHide);
  // 다른 탭이 같은 세이브에 쓰면 즉시 알아챈다 (자동저장 주기를 기다리지 않는다)
  window.addEventListener('storage', (e) => {
    if (e.key !== SAVE_KEY || uiStore.get().conflict) return;
    const disk = storedSavedAt();
    if (mySavedAt && disk !== null && disk > mySavedAt + 1) {
      stopGame();
      uiStore.set((u) => ({ ...u, conflict: true }));
    }
  });
  window.addEventListener('beforeunload', () => save());
  window.addEventListener('pagehide', () => save());
}

export function stopGame(): void {
  if (loopHandle) clearInterval(loopHandle);
  loopHandle = null;
  booted = false;
}
