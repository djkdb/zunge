/**
 * ZUN 캐릭터 이미지 자산 관리.
 *
 * 세 곳에서 순서대로 그림을 찾는다.
 *   1) 사용자가 게임 안에서 직접 넣은 스프라이트 시트 (브라우저 IndexedDB 에 저장)
 *   2) 저장소에 포함된 public/characters/zun/NN.png
 *   3) 둘 다 없으면 코드로 그리는 폴백 스프라이트
 *
 * 시트 처리(체크무늬 배경 제거 → 32칸 분리)는 전부 브라우저 안에서 한다.
 * 터미널이나 빌드 도구 없이 이미지 한 장만 끌어다 놓으면 끝난다.
 */
import { createStore } from './createStore';

const DB_NAME = 'zun-character';
const DB_VERSION = 1;
const STORE = 'poses';

export interface PoseAsset {
  index: number; // 1 ~ 32
  blob: Blob;
  w: number;
  h: number;
}

export type AssetSource = 'loading' | 'imported' | 'bundled' | 'none';

export interface CharacterAssets {
  source: AssetSource;
  /** 포즈 번호 → 이미지 URL */
  urls: Record<number, string>;
  /** 포즈 번호 → 원본 픽셀 크기 */
  sizes: Record<number, { w: number; h: number }>;
  /** 크기 기준값 (중앙값 높이) */
  refHeight: number;
}

export const characterStore = createStore<CharacterAssets>({
  source: 'loading',
  urls: {},
  sizes: {},
  refHeight: 0,
});

// ───────────── IndexedDB ─────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'index' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readAll(): Promise<PoseAsset[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as PoseAsset[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function writeAll(assets: PoseAsset[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const os = tx.objectStore(STORE);
    os.clear();
    assets.forEach((a) => os.put(a));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAll(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ───────────── 시트 처리 ─────────────

export interface SliceOptions {
  cols: number;
  rows: number;
  /** 배경으로 볼 최대 채도 (0~1) */
  satMax: number;
  /** 배경으로 볼 최소 명도 (0~1) */
  valMin: number;
  /** 가장자리 halo 를 벗겨낼 횟수 */
  halo: number;
  /** 칸 좌상단 번호 라벨을 지울 영역 비율 */
  labelW: number;
  labelH: number;
  /** 잘라낼 때 남길 여백 (px) */
  pad: number;
}

export const DEFAULT_SLICE: SliceOptions = {
  cols: 8,
  rows: 4,
  satMax: 0.14,
  valMin: 0.72,
  halo: 1,
  labelW: 0.3,
  labelH: 0.12,
  pad: 2,
};

function saturationValue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max / 255;
  const s = max === 0 ? 0 : (max - min) / max;
  return [s, v];
}

/** 테두리에서 시작하는 flood fill 로 배경만 투명하게 만든다 */
function stripBackground(data: Uint8ClampedArray, w: number, h: number, o: SliceOptions): void {
  const n = w * h;
  const cand = new Uint8Array(n);
  for (let i = 0; i < n; i += 1) {
    const p = i * 4;
    if (data[p + 3] === 0) {
      cand[i] = 1;
      continue;
    }
    const [s, v] = saturationValue(data[p], data[p + 1], data[p + 2]);
    if (s <= o.satMax && v >= o.valMin) cand[i] = 1;
  }

  const seen = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const push = (i: number) => {
    if (cand[i] && !seen[i]) {
      seen[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < w; x += 1) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  for (let i = 0; i < n; i += 1) if (seen[i]) data[i * 4 + 3] = 0;

  // 가장자리에 남는 밝은 halo 를 몇 번 더 벗겨낸다
  for (let pass = 0; pass < o.halo; pass += 1) {
    const peel: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const p = i * 4;
      if (data[p + 3] === 0) continue;
      const [s, v] = saturationValue(data[p], data[p + 1], data[p + 2]);
      if (s > o.satMax + 0.06 || v < o.valMin - 0.06) continue;
      const x = i % w;
      const y = (i / w) | 0;
      const touching =
        (x > 0 && data[(i - 1) * 4 + 3] === 0) ||
        (x < w - 1 && data[(i + 1) * 4 + 3] === 0) ||
        (y > 0 && data[(i - w) * 4 + 3] === 0) ||
        (y < h - 1 && data[(i + w) * 4 + 3] === 0);
      if (touching) peel.push(i);
    }
    if (!peel.length) break;
    peel.forEach((i) => {
      data[i * 4 + 3] = 0;
    });
  }
}

export interface SliceResult {
  assets: PoseAsset[];
  /** 캐릭터가 1명이 아니거나 배경이 남은 칸 */
  failures: { index: number; reason: string }[];
}

/** 시트 한 장을 32개 포즈로 잘라낸다 */
export async function sliceSheet(source: Blob | HTMLImageElement, opts: Partial<SliceOptions> = {}): Promise<SliceResult> {
  const o = { ...DEFAULT_SLICE, ...opts };
  const img = source instanceof HTMLImageElement ? source : await blobToImage(source);
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('캔버스를 만들 수 없습니다.');
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, W, H);
  stripBackground(image.data, W, H, o);

  const cw = Math.floor(W / o.cols);
  const ch = Math.floor(H / o.rows);
  const assets: PoseAsset[] = [];
  const failures: { index: number; reason: string }[] = [];

  for (let i = 0; i < o.cols * o.rows; i += 1) {
    const col = i % o.cols;
    const row = Math.floor(i / o.cols);
    const x0 = col * cw;
    const y0 = row * ch;

    // 칸 좌상단의 번호 라벨을 지운다
    const lw = Math.floor(cw * o.labelW);
    const lh = Math.floor(ch * o.labelH);
    for (let y = y0; y < Math.min(y0 + lh, H); y += 1) {
      for (let x = x0; x < Math.min(x0 + lw, W); x += 1) {
        image.data[(y * W + x) * 4 + 3] = 0;
      }
    }

    // 캐릭터 경계 상자
    let minX = x0 + cw;
    let minY = y0 + ch;
    let maxX = x0;
    let maxY = y0;
    for (let y = y0; y < y0 + ch; y += 1) {
      for (let x = x0; x < x0 + cw; x += 1) {
        if (image.data[(y * W + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) {
      failures.push({ index: i + 1, reason: '캐릭터를 찾지 못했습니다' });
      continue;
    }
    const bx = Math.max(x0, minX - o.pad);
    const by = Math.max(y0, minY - o.pad);
    const bw = Math.min(x0 + cw, maxX + 1 + o.pad) - bx;
    const bh = Math.min(y0 + ch, maxY + 1 + o.pad) - by;

    // 캐릭터가 정확히 1명인지 확인: 가운데에 빈 열이 길게 이어지면 2명 이상이다
    let blobs = 1;
    let run = 0;
    for (let x = bx + 2; x < bx + bw - 2; x += 1) {
      let filled = false;
      for (let y = by; y < by + bh; y += 1) {
        if (image.data[(y * W + x) * 4 + 3] > 8) {
          filled = true;
          break;
        }
      }
      if (!filled) run += 1;
      else {
        if (run >= 8) blobs += 1;
        run = 0;
      }
    }
    if (blobs !== 1) {
      failures.push({ index: i + 1, reason: `캐릭터가 ${blobs}명 들어 있습니다` });
      continue;
    }

    const cell = document.createElement('canvas');
    cell.width = bw;
    cell.height = bh;
    const cctx = cell.getContext('2d');
    if (!cctx) continue;
    cctx.putImageData(image, -bx, -by, bx, by, bw, bh);
    const blob = await new Promise<Blob | null>((res) => cell.toBlob(res, 'image/png'));
    if (!blob) {
      failures.push({ index: i + 1, reason: 'PNG 변환에 실패했습니다' });
      continue;
    }
    assets.push({ index: i + 1, blob, w: bw, h: bh });
  }

  return { assets, failures };
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 읽을 수 없습니다.'));
    };
    img.src = url;
  });
}

// ───────────── 스토어 반영 ─────────────

let objectUrls: string[] = [];

function publish(assets: PoseAsset[], source: AssetSource): void {
  objectUrls.forEach((u) => URL.revokeObjectURL(u));
  objectUrls = [];
  const urls: Record<number, string> = {};
  const sizes: Record<number, { w: number; h: number }> = {};
  assets.forEach((a) => {
    const u = URL.createObjectURL(a.blob);
    objectUrls.push(u);
    urls[a.index] = u;
    sizes[a.index] = { w: a.w, h: a.h };
  });
  const heights = assets.map((a) => a.h).sort((x, y) => x - y);
  characterStore.set({
    source,
    urls,
    sizes,
    refHeight: heights.length ? heights[Math.floor(heights.length / 2)] : 0,
  });
}

/** 저장소에 포함된 PNG가 있는지 확인 */
function probeBundled(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = `${import.meta.env.BASE_URL}characters/zun/01.png`;
  });
}

/** 앱 시작 시 한 번 호출 */
export async function initCharacterAssets(): Promise<void> {
  const stored = await readAll();
  if (stored.length) {
    publish(stored.sort((a, b) => a.index - b.index), 'imported');
    return;
  }
  const bundled = await probeBundled();
  characterStore.set({
    source: bundled ? 'bundled' : 'none',
    urls: {},
    sizes: {},
    refHeight: 0,
  });
}

/** 사용자가 넣은 시트를 처리해 저장한다 */
export async function importSheet(file: Blob, opts: Partial<SliceOptions> = {}): Promise<SliceResult> {
  const result = await sliceSheet(file, opts);
  if (result.assets.length) {
    await writeAll(result.assets);
    publish(result.assets, 'imported');
  }
  return result;
}

/** 넣었던 시트를 지우고 기본 상태로 되돌린다 */
export async function resetCharacterAssets(): Promise<void> {
  await clearAll();
  await initCharacterAssets();
}
