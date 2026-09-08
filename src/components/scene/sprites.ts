import type { Palette } from './PixelSprite';

/**
 * AI 로봇 (16 x 18)
 * O 아웃라인 · l 본체 하이라이트 · B 본체 그림자 · F 페이스 스크린 · E 발광 아이
 * A 안테나 · W 흰색
 */
export const ROBOT_ROWS = [
  '.......OO.......',
  '.......AA.......',
  '......OAAO......',
  '..OOOOOOOOOOOO..',
  '..OllllllllBBO..',
  '..OlOOOOOOOOBO..',
  '..OlOFFFFFFOBO..',
  '..OlOEEFFEEOBO..',
  '..OlOFFFFFFOBO..',
  '..OlOFFEEFFOBO..',
  '..OlOOOOOOOOBO..',
  '..OllllllllBBO..',
  '..OOOOOOOOOOOO..',
  '...OOOOOOOOOO...',
  '..OllllllllBBO..',
  '..OllllllllBBO..',
  '...OllllllllO...',
  '....OOOOOOOO....',
];

/** 보조 에이전트 (10 x 11) */
export const MINI_ROBOT_ROWS = [
  '....OO....',
  '..OOOOOO..',
  '.OllllBBO.',
  '.OlOOOOBO.',
  '.OlOEEFOBO',
  '.OlOFFEOBO',
  '.OlOOOOBO.',
  '.OllllBBO.',
  '..OOOOOO..',
  '..OllllO..',
  '...OOOO...',
];

/** 날개 (좌측 8 x 10, 우측은 미러링) */
export const WING_ROWS = [
  '.......W',
  '.....WWW',
  '...WWWWW',
  '..WWWWWw',
  '.WWWWWWw',
  'WWWWWWWw',
  '.WWWWWWw',
  '..WWWWWw',
  '....WWWw',
  '......Ww',
];

export const WING_PALETTE: Palette = { W: '#e4ecfb', w: '#a8bbdd' };

export function robotPalette(color: string, face = '#0b1226', eye = '#7cf0ff'): Palette {
  return {
    O: '#0a0d1a',
    l: tint(color, 34),
    B: tint(color, -34),
    F: face,
    E: eye,
    A: '#ffd166',
    W: '#ffffff',
  };
}

/**
 * 펫 / 마스코트 (12 x 12)
 * 각 스프라이트는 자기 팔레트를 들고 있어 방 어디에 두어도 톤이 유지된다.
 */
export const PET_SPRITES: Record<string, { rows: string[]; palette: Palette }> = {
  cat: {
    rows: [
      '..O......O..',
      '..OO....OO..',
      '.OGOO..OOGO.',
      '.OGGGGGGGGO.',
      '.OGEGGGGEGO.',
      '.OGGGkkGGGO.',
      '..OGGGGGGO..',
      '...OGGGGO...',
      '..OGGGGGGO..',
      '.OGGGGGGGGO.',
      '.OGGOOOOGGO.',
      '..OO....OO..',
    ],
    palette: { O: '#0a0d1a', G: '#98a2ba', E: '#5ee596', k: '#f3aa9c' },
  },
  codi: {
    rows: [
      '.OO......OO.',
      '.OYO....OYO.',
      '.OYYOOOOYYO.',
      '.OYYYYYYYYO.',
      '.OYEYYYYEYO.',
      '.OYYYKKYYYO.',
      '..OYYYYYYO..',
      '...OYYYYO...',
      '..OYYYYYYO..',
      '.OYYYYYYYYO.',
      '.OYYOOOOYYO.',
      '..OO....OO..',
    ],
    palette: { O: '#0a0d1a', Y: '#dd9553', E: '#20242f', K: '#20242f' },
  },
  minipc: {
    rows: [
      '............',
      '.OOOOOOOOOO.',
      '.OBBBBBBBBO.',
      '.OBFFFFFFBO.',
      '.OBFEFFEFBO.',
      '.OBFFFFFFBO.',
      '.OBFFEEFFBO.',
      '.OBBBBBBBBO.',
      '.OOOOOOOOOO.',
      '...OOOOOO...',
      '..OOOOOOOO..',
      '............',
    ],
    palette: { O: '#0a0d1a', B: '#c2cadb', F: '#101833', E: '#7cf0ff' },
  },
  byte: {
    rows: [
      '....OOOO....',
      '..OOWWWWOO..',
      '.OWWWWWWWWO.',
      '.OWWPWWPWWO.',
      '.OWWWWWWWWO.',
      '.OWkWWWWkWO.',
      '.OWWWWWWWWO.',
      '.OWWWWWWWWO.',
      '.OWWWWWWWWO.',
      '.OWWWWWWWWO.',
      '.OWWOWWOWWO.',
      '..OO.OO.OO..',
    ],
    palette: { O: '#0a0d1a', W: '#e9eefb', P: '#141828', k: '#c9d3ea' },
  },
  plant: {
    rows: [
      '...OO..OO...',
      '..OGGOOGGO..',
      '..OGGGGGGO..',
      '...OGGGGO...',
      '....OGGO....',
      '....OGGO....',
      '..OOOOOOOO..',
      '..OPPPPPPO..',
      '..OPPPPPPO..',
      '..OPPPPPPO..',
      '...OPPPPO...',
      '....OOOO....',
    ],
    palette: { O: '#0a0d1a', G: '#3fb972', P: '#c47b52' },
  },
  duck: {
    rows: [
      '............',
      '...OOOO.....',
      '..OYYYYO....',
      '..OYEYYORRO.',
      '..OYYYYORRO.',
      '.OYYYYYYO...',
      '.OYYYYYYO...',
      'OYYYYYYYYO..',
      'OYYYYYYYYO..',
      '.OYYYYYYO...',
      '..OOOOOO....',
      '............',
    ],
    palette: { O: '#0a0d1a', Y: '#f5cd3c', E: '#141828', R: '#f08a3d' },
  },
};

/** hex 색을 밝게(+) / 어둡게(-) 보정 */
function tint(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, v + amount));
  const r = ch(n >> 16);
  const g = ch((n >> 8) & 0xff);
  const b = ch(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
