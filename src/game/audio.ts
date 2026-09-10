/**
 * WebAudio 기반 초경량 사운드 (외부 파일 없음).
 *
 * 효과음도 배경음악도 오실레이터로 직접 만든다. mp3 를 넣으면 몇 백 KB 가
 * 늘고 오프라인 캐시도 그만큼 무거워지는데, 이 게임에 필요한 소리는
 * 그 정도로 복잡하지 않다.
 */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean): void {
  enabled = v;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'square', gain = 0.05): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

export const sfx = {
  tap(): void {
    if (!enabled) return;
    tone(880, 0, 0.06, 'square', 0.03);
  },
  coin(): void {
    if (!enabled) return;
    tone(1046, 0, 0.08, 'square', 0.04);
    tone(1568, 0.07, 0.12, 'square', 0.04);
  },
  buy(): void {
    if (!enabled) return;
    tone(523, 0, 0.07, 'triangle', 0.06);
    tone(784, 0.07, 0.1, 'triangle', 0.06);
  },
  complete(): void {
    if (!enabled) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.14, 'square', 0.05));
  },
  levelUp(): void {
    if (!enabled) return;
    [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.07));
  },
  error(): void {
    if (!enabled) return;
    tone(196, 0, 0.12, 'sawtooth', 0.04);
    tone(147, 0.1, 0.16, 'sawtooth', 0.04);
  },
  event(good: boolean): void {
    if (!enabled) return;
    if (good) [659, 880, 1174].forEach((f, i) => tone(f, i * 0.07, 0.15, 'square', 0.04));
    else [440, 330].forEach((f, i) => tone(f, i * 0.12, 0.2, 'sawtooth', 0.04));
  },
  stage(): void {
    if (!enabled) return;
    [262, 330, 392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.08, 0.3, 'triangle', 0.07));
  },
};

/* ───────────────────────── 배경음악 ───────────────────────── */

/*
 * 브금도 파일 없이 만든다.
 *
 * Dm7 - G7 - Cmaj7 - Am7 을 네 마디로 도는 느린 순환이다. 재즈에서 닳도록
 * 쓰인 진행이라 방치형처럼 오래 켜 두는 게임에서도 잘 물리지 않는다.
 * 베이스는 근음, 패드는 화음, 리드는 그 화음 안의 음만 골라 얹는다 —
 * 화음 밖 음을 쓰지 않으니 어느 마디에서 끊겨도 어긋나지 않는다.
 *
 * setTimeout 으로 소리를 내면 타이머가 밀릴 때마다 박자가 흔들린다.
 * 그래서 짧은 주기로 깨어나 "조금 앞의 것까지 미리 예약" 하고 다시 자는,
 * WebAudio 에서 흔히 쓰는 방식을 쓴다. 실제 발음 시각은 오디오 시계가 잡는다.
 */

const BPM = 74;
const STEP_SEC = 30 / BPM;        // 8분음표 한 칸
const STEPS_PER_BAR = 8;
const LOOKAHEAD_MS = 120;         // 스케줄러가 깨어나는 주기
const SCHEDULE_AHEAD_SEC = 0.5;   // 미리 예약해 두는 길이

/** 미디 번호 → 주파수 (A4 = 69 = 440Hz) */
function hz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface Bar {
  bass: number;
  pad: number[];
  /** 8칸 중 어디에 어떤 음을 놓을지. null 은 쉼표 */
  lead: (number | null)[];
}

const BARS: Bar[] = [
  // Dm7
  { bass: 38, pad: [62, 65, 69], lead: [null, 81, null, 77, null, null, 74, null] },
  // G7
  { bass: 43, pad: [59, 62, 65], lead: [79, null, null, 74, null, 71, null, null] },
  // Cmaj7
  { bass: 36, pad: [60, 64, 67], lead: [null, 76, null, null, 79, null, 72, null] },
  // Am7
  { bass: 45, pad: [60, 64, 67], lead: [76, null, null, 72, null, null, 69, null] },
];

const TOTAL_STEPS = BARS.length * STEPS_PER_BAR;

let musicEnabled = false;
let musicGain: GainNode | null = null;
let schedulerId: ReturnType<typeof setInterval> | null = null;
let nextStepTime = 0;
let stepIndex = 0;

/** 음악용 목소리 하나. 효과음과 달리 서서히 열리고 서서히 닫힌다 */
function voice(c: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, peak: number, attack = 0.04): void {
  if (!musicGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(musicGain);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** 부드러운 킥 — 사인파의 음을 빠르게 떨어뜨리면 클릭음 없이 깔끔하다 */
function kick(c: AudioContext, at: number): void {
  if (!musicGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, at);
  osc.frequency.exponentialRampToValueAtTime(48, at + 0.11);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.16, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
  osc.connect(g).connect(musicGain);
  osc.start(at);
  osc.stop(at + 0.26);
}

function scheduleStep(c: AudioContext, s: number, at: number): void {
  const bar = BARS[Math.floor(s / STEPS_PER_BAR)];
  const inBar = s % STEPS_PER_BAR;

  if (inBar === 0) {
    // 마디 첫 박에 베이스와 패드를 길게 깐다
    voice(c, hz(bar.bass), at, STEP_SEC * STEPS_PER_BAR * 0.95, 'triangle', 0.09, 0.06);
    for (const n of bar.pad) voice(c, hz(n), at, STEP_SEC * STEPS_PER_BAR * 0.9, 'sine', 0.035, 0.35);
  }
  if (inBar === 0 || inBar === 4) kick(c, at);

  const lead = bar.lead[inBar];
  if (lead !== null) voice(c, hz(lead), at, STEP_SEC * 1.6, 'sine', 0.05, 0.03);
}

function runScheduler(): void {
  const c = getCtx();
  if (!c || !musicGain) return;
  while (nextStepTime < c.currentTime + SCHEDULE_AHEAD_SEC) {
    // 이미 지난 시각에 예약하면 소리가 뭉치므로 현재보다 앞으로 당겨 둔다
    if (nextStepTime < c.currentTime) nextStepTime = c.currentTime + 0.05;
    scheduleStep(c, stepIndex, nextStepTime);
    nextStepTime += STEP_SEC;
    stepIndex = (stepIndex + 1) % TOTAL_STEPS;
  }
}

function startMusic(): void {
  if (!musicEnabled || schedulerId !== null) return;
  const c = getCtx();
  // 첫 조작 전에는 오디오가 잠겨 있다. 그때는 조용히 물러나고 다음 기회를 기다린다
  if (!c || c.state !== 'running') return;
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.0001;
    musicGain.connect(c.destination);
  }
  musicGain.gain.cancelScheduledValues(c.currentTime);
  musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), c.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 1.2);
  nextStepTime = c.currentTime + 0.1;
  schedulerId = setInterval(runScheduler, LOOKAHEAD_MS);
  runScheduler();
}

function stopMusic(): void {
  if (schedulerId !== null) {
    clearInterval(schedulerId);
    schedulerId = null;
  }
  const c = ctx;
  if (c && musicGain) {
    // 뚝 끊지 않고 내린다. 이미 예약된 음들은 이 볼륨을 따라 사라진다
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), c.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
  }
  stepIndex = 0;
}

/**
 * 오디오 잠금을 풀고 나서 음악을 건다.
 *
 * resume() 은 약속을 돌려주는 비동기다. 부른 직후에 state 를 보면 아직
 * 'suspended' 라서, 바로 startMusic() 을 부르면 조용히 실패한다.
 * 풀린 뒤에 걸도록 한 단계를 둔다.
 */
function resumeThenStart(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'running') { startMusic(); return; }
  void c.resume().then(startMusic).catch(() => undefined);
}

export function setMusicEnabled(v: boolean): void {
  musicEnabled = v;
  if (v) resumeThenStart();
  else stopMusic();
}

export function isMusicPlaying(): boolean {
  return schedulerId !== null;
}

if (typeof window !== 'undefined') {
  /*
   * 브라우저는 사용자가 한 번 건드리기 전에는 소리를 내주지 않는다.
   * 그래서 첫 조작을 기다렸다가 그때 음악을 건다. 이미 켜져 있으면 아무 일도 없다.
   */
  // 계속 듣고 있는다 — 한 번 실패해도 다음 조작에서 다시 시도한다
  const unlock = () => { if (musicEnabled && !isMusicPlaying()) resumeThenStart(); };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);

  // 탭을 덮어 두면 소리를 끈다. 돌아오면 다시 건다
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMusic();
    else if (musicEnabled) resumeThenStart();
  });
}
