/** WebAudio 기반 초경량 효과음 (외부 파일 없음) */

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
