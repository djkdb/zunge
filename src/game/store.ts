import type { GameState, LogEntry, Mood, OfflineReport, Settings, UpgradeId } from './types';
import { AUTOSAVE_MS, OFFLINE_THRESHOLD_SEC, TICK_MS } from './constants';
import { createStore } from './createStore';
import {
  buyAi, buyStage, buyUpgrade, cancelProject, createInitialState, markStageSeen, startProject, tapZun, tick, updateSettings, type Signal,
} from './engine';
import { clearSave, exportSave, importSave, loadGame, saveGame } from './save';
import { simulateOffline } from './offline';
import { PROJECT_MAP } from './data/projects';
import { UPGRADE_MAP } from './data/upgrades';
import { aiTier } from './data/ai';
import { stageDef } from './data/stages';
import { formatMoney, formatUsers } from './format';
import { computeDerived } from './calc';
import type { Derived } from './types';
import { setSoundEnabled, sfx } from './audio';

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

export interface UiState {
  mood: Mood;
  logs: LogEntry[];
  toasts: Toast[];
  floats: FloatingText[];
  offlineReport: OfflineReport | null;
  levelUpTo: number | null;
  stageIntro: number | null;
  lastSaveAt: number;
  ready: boolean;
}

export const uiStore = createStore<UiState>({
  mood: 'idle',
  logs: [],
  toasts: [],
  floats: [],
  offlineReport: null,
  levelUpTo: null,
  stageIntro: null,
  lastSaveAt: 0,
  ready: false,
});

let idSeq = 1;
const nextId = () => idSeq++;

let moodTimer: ReturnType<typeof setTimeout> | null = null;

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
  uiStore.set((u) => ({ ...u, toasts: [...u.toasts, { id, icon, title, message, tone }].slice(-3) }));
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
        pushLog('🛠️', `${p.name} 개발을 시작했습니다.`);
        setMood('focus', 1200);
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
        setMood(s.version >= 3 || p.tier >= 3 ? 'shock' : 'happy', 3000);
        sfx.complete();
        break;
      }
      case 'bug': {
        const p = PROJECT_MAP[s.projectId];
        pushLog('🐛', `${p.name}에서 버그 발생! 수정 중...`, 'bad');
        pushToast('🐛', '버그 발생!', `${p.name} 출시 직전에 버그가 발견됐습니다. ZUN이 멘붕에 빠졌습니다.`, 'bad', 3500);
        pushFloat('🐛 BUG!', 'bad', 45, 45);
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
    }
  }
}

// ───────────── 액션 ─────────────
export const actions = {
  startProject(id: string): void {
    const r = startProject(gameStore.get(), id, Date.now());
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
    refreshBaseMood();
  },
  cancelProject(id: string): void {
    const r = cancelProject(gameStore.get(), id);
    gameStore.set(r.state);
    pushLog('↩️', `${PROJECT_MAP[id].name} 개발을 취소했습니다. (비용 50% 환불)`);
    refreshBaseMood();
  },
  buyUpgrade(id: UpgradeId): void {
    const r = buyUpgrade(gameStore.get(), id);
    gameStore.set(r.state);
    handleSignals(r.signals, Date.now());
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
    uiStore.set((u) => ({ ...u, logs: [], toasts: [], floats: [], offlineReport: null, levelUpTo: null, stageIntro: null, mood: 'idle' }));
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
    uiStore.set((u) => ({ ...u, logs: [], toasts: [], floats: [], mood: baseMood(parsed) }));
    pushLog('📥', '저장 데이터를 불러왔습니다.', 'good');
    save();
    return true;
  },
};

function save(): boolean {
  const now = Date.now();
  gameStore.set((s) => ({ ...s, lastSavedAt: now }));
  const ok = saveGame(gameStore.get());
  if (ok) uiStore.set((u) => ({ ...u, lastSaveAt: now }));
  return ok;
}

// ───────────── 게임 루프 ─────────────
let loopHandle: ReturnType<typeof setInterval> | null = null;
let lastTick = 0;
let lastSave = 0;
let booted = false;

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
  const now = Date.now();
  const loaded = loadGame();
  if (loaded) {
    gameStore.set(loaded);
    setSoundEnabled(loaded.settings.sound);
    applyOffline(now);
    pushLog('👋', '다시 돌아온 걸 환영합니다! ZUN이 기다리고 있었어요.');
  } else {
    gameStore.set(createInitialState(now));
    pushLog('🌱', '작은 자취방에서 ZUN의 개발자 인생이 시작됩니다. 첫 프로젝트를 만들어보세요!');
    save();
  }
  uiStore.set((u) => ({ ...u, ready: true, mood: baseMood(gameStore.get()) }));
  lastTick = now;
  lastSave = now;

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
    const r = tick(gameStore.get(), Math.min(dtSec, 5), t);
    gameStore.set(r.state);
    handleSignals(r.signals, t);
    refreshBaseMood();
    if (t - lastSave > AUTOSAVE_MS) {
      lastSave = t;
      save();
    }
  }, TICK_MS);

  const onHide = () => {
    if (document.visibilityState === 'hidden') save();
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('beforeunload', () => save());
  window.addEventListener('pagehide', () => save());
}

export function stopGame(): void {
  if (loopHandle) clearInterval(loopHandle);
  loopHandle = null;
  booted = false;
}
