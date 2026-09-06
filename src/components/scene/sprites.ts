import type { Palette } from './PixelSprite';

/** AI 로봇 (12 x 14). B 본체  b 본체 그림자  F 얼굴(스크린)  E 눈  A 안테나  W 흰색 */
export const ROBOT_ROWS = [
  '.....AA.....',
  '.....AA.....',
  '..BBBBBBBB..',
  '.BBFFFFFFBB.',
  '.BBFEFFEFBB.',
  '.BBFFFFFFBB.',
  '.BBFFEEFFBB.',
  '..BBBBBBBB..',
  '..BbbbbbbB..',
  '.BBBBBBBBBB.',
  'BBBbBBBBbBBB',
  'BB.BBBBBB.BB',
  '...BBBBBB...',
  '...bb..bb...',
];

export function robotPalette(color: string, face = '#0f1a33', eye = '#7cf0ff'): Palette {
  return { B: color, b: shade(color, -30), F: face, E: eye, A: '#ffd166', W: '#ffffff' };
}

export const MINI_ROBOT_ROWS = [
  '..AA..',
  '.BBBB.',
  'BFEEFB',
  'BFFFFB',
  '.BBBB.',
  '.b..b.',
];

/** 날개 (좌측, 8 x 8) — 우측은 미러링 */
export const WING_ROWS = [
  '......WW',
  '....WWWW',
  '..WWWWWW',
  'WWWWWWWW',
  '.WWWWWWW',
  '...WWWWW',
  '.....WWW',
  '.......W',
];

export const PET_SPRITES: Record<string, { rows: string[]; palette: Palette }> = {
  cat: {
    rows: [
      'G.G.....',
      'GGGGGG..',
      'GEGEGG..',
      'GGGGGGG.',
      'WGGGGGGG',
      '.GGGGGGG',
      '.GG.GG..',
    ],
    palette: { G: '#8f97ad', E: '#22c55e', W: '#ffffff' },
  },
  codi: {
    rows: [
      'OO.....O',
      'OOOOOOOO',
      'OEOOEOOO',
      'OOOKOOO.',
      '.OOOOOOO',
      '.OOOOOO.',
      '.OO..OO.',
    ],
    palette: { O: '#e39a5b', E: '#16171f', K: '#16171f' },
  },
  minipc: {
    rows: [
      'BBBBBBBB',
      'BFFFFFFB',
      'BFEFFEFB',
      'BFFEEFFB',
      'BBBBBBBB',
      '..BBBB..',
      '.BBBBBB.',
    ],
    palette: { B: '#c9cfdd', F: '#141a33', E: '#7cf0ff' },
  },
  byte: {
    rows: [
      '..WWWW..',
      '.WWWWWW.',
      'WWEWWEWW',
      'WWWWWWWW',
      'WWWWWWWW',
      'WWWWWWWW',
      'W.WW.WW.',
    ],
    palette: { W: '#eef2ff', E: '#141a33' },
  },
  plant: {
    rows: [
      '..GG.G..',
      '.GGGGGG.',
      '..GGGG..',
      '...GG...',
      '.PPPPPP.',
      '.PPPPPP.',
      '..PPPP..',
    ],
    palette: { G: '#3cb56a', P: '#c9805a' },
  },
  duck: {
    rows: [
      '..YYYY..',
      '.YYEYYY.',
      '.YYYYOO.',
      '..YYYY..',
      'YYYYYYY.',
      'YYYYYYYY',
      '.YYYYYY.',
    ],
    palette: { Y: '#ffd93b', E: '#16171f', O: '#ff8a3d' },
  },
};

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
