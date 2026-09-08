import type { Mood } from '../../game/types';
import type { Palette } from './PixelSprite';

/**
 * ZUN 픽셀 스프라이트 (32 x 42)
 *
 * 광원은 좌측 상단. 모든 재질은 그림자 / 기본 / 하이라이트 3톤 + 선택적 아웃라인으로 구성한다.
 *
 * O 아웃라인   L 캡 하이라이트  C 캡 기본   c 캡 밑동
 * B 챙 윗면    b 챙 밑면        W 흰색
 * H 머리 기본  h 머리 그림자    j 머리 하이라이트
 * S 피부       s 피부 그림자    k 볼터치
 * I 홍채       P 동공           M 입
 * N 후드 기본  n 후드 그림자    l 후드 하이라이트  z 후드 끈
 * D 바지       d 바지 그림자    G 신발
 */
export const ZUN_PALETTE: Palette = {
  O: '#0a0d1a',
  L: '#2e4076',
  C: '#22305c',
  c: '#16203f',
  B: '#1b2749',
  b: '#0d1430',
  W: '#ffffff',
  H: '#1d2140',
  h: '#12152b',
  j: '#303760',
  S: '#f7d3af',
  s: '#e2b189',
  k: '#f3aa9c',
  I: '#3c5cab',
  P: '#0d1024',
  M: '#c46059',
  N: '#27365f',
  n: '#19244b',
  l: '#33477e',
  z: '#e7edf9',
  D: '#2b3152',
  d: '#1f2442',
  G: '#eaeef7',
};

/** 머리 위쪽: 캡(ZUN 자수) + 챙 + 앞머리 (y0 ~ y16) */
const HEAD_TOP = [
  '...........OOOOOOOOOO...........',
  '.........OLLLLLLLCCCCCO.........',
  '.......OLLLLLLLLLLCCCCCCO.......',
  '......OLLLLLLLLLLLCCCCCCCO......',
  '.....OLLLLWWWLWLWCWWCWCCCCO.....',
  '.....OLLLLLLWLWLWCWWCWCCCCO.....',
  '.....OLLLLLWLLWLWCWCWWCCCCO.....',
  '.....OLLLLWLLLWLWCWCWWCCCCO.....',
  '.....OLLLLWWWLWWWCWCCWCCCCO.....',
  '....OccccccccccccccccccccccO....',
  '...OBBBBBBBBBBBBBBBBBBBBBBBBO...',
  '....ObbbbbbbbbbbbbbbbbbbbbbO....',
  '......OHHHHHHHHHHHHHHHHHHO......',
  '......OHHjjHHHHHHHHHHjjHHO......',
  '......OHHHHHHHssssHHHHHHHO......',
  '......OHHHHHssssssssHHHHHO......',
  '......OHHHSSSSSSSSSSSSHHHO......',
];

/** 몸: 턱 → 목 → 후드티 → 바지 → 신발 (y23 ~ y41) */
const BODY = [
  '.......OhsSSSSSSSSSSSSshO.......',
  '........OsSSSSSSSSSSSSsO........',
  '............OssssssO............',
  '........ONNNNnnnnnnNNNNO........',
  '.....OlllllllNNNNNNNNNNNNNO.....',
  '....OlllllllNNzNNzNNNNNNNNNO....',
  '...OllllllllNNzNNzNNNNNNNNNNO...',
  '...OllllllllNNzNNzNNNNNNNNNNO...',
  '...OllllllllNNNNNNNNNNNNNNNNO...',
  '...OllllnnnnnnnnnnnnnnnnNNNNO...',
  '...OllllnnnnnnnnnnnnnnnnNNNNO...',
  '...OllllnnnnnnnnnnnnnnnnNNNNO...',
  '...OnnnnnnnnnnnnnnnnnnnnnnnnO...',
  '.......ODDDDDDO..ODDDDDDO.......',
  '.......OdddDDDO..OdddDDDO.......',
  '.......OdddDDDO..OdddDDDO.......',
  '......OGGGGGGGGOOGGGGGGGGO......',
  '......OGGGGGGGGOOGGGGGGGGO......',
  '......OOOOOOOOOOOOOOOOOOOO......',
];

/** 표정 6줄 (y17 ~ y22): 눈썹/속눈썹 · 눈 3줄 · 볼 · 입 */
const FACES: Record<Mood, string[]> = {
  idle: [
    '......OHHHOOOOSSSSOOOOHHHO......',
    '......OHHHWWWWSSSSWWWWHHHO......',
    '......OHHHWIPWSSSSWPIWHHHO......',
    '......OHHsWIIWSSSSWIIWsHHO......',
    '......OHsSkkSSSSSSSSkkSsHO......',
    '......OHsSSSSSSMMSSSSSSsHO......',
  ],
  focus: [
    '......OHHHhhhhSSSShhhhHHHO......',
    '......OHHHOOOOSSSSOOOOHHHO......',
    '......OHHHWIPWSSSSWPIWHHHO......',
    '......OHHsWIIWSSSSWIIWsHHO......',
    '......OHsSSSSSSSSSSSSSSsHO......',
    '......OHsSSSSSSMMSSSSSSsHO......',
  ],
  happy: [
    '......OHHHSSSSSSSSSSSSHHHO......',
    '......OHHHSOOSSSSSSOOSHHHO......',
    '......OHHHOSSOSSSSOSSOHHHO......',
    '......OHHskkSSSSSSSSkksHHO......',
    '......OHsSSSSSSSSSSSSSSsHO......',
    '......OHsSSSSOMMMMOSSSSsHO......',
  ],
  panic: [
    '......OHHHOOOOSSSSOOOOHHHO......',
    '......OHHHWWWWSSSSWWWWHHHO......',
    '......OHHHWPWWSSSSWWPWHHHO......',
    '......OHHsWWWWSSSSWWWWsHHO......',
    '......OHsSSSSSSSSSSSSSSsHO......',
    '......OHsSSSSSMOMSSSSSSsHO......',
  ],
  shock: [
    '......OHHHOOOOSSSSOOOOHHHO......',
    '......OHHHWWWWSSSSWWWWHHHO......',
    '......OHHHWPPWSSSSWPPWHHHO......',
    '......OHHsWIIWSSSSWIIWsHHO......',
    '......OHsSSSSSSSSSSSSSSsHO......',
    '......OHsSSSSSOMMOSSSSSsHO......',
  ],
  confident: [
    '......OHHHhhhhSSSShhhhHHHO......',
    '......OHHHWWWWSSSSOOOOHHHO......',
    '......OHHHWIPWSSSSSSSSHHHO......',
    '......OHHsWIIWSSSSSSSSsHHO......',
    '......OHsSkkSSSSSSSSkkSsHO......',
    '......OHsSSSSSSSMMMOSSSsHO......',
  ],
  meltdown: [
    '......OHHHhhhhSSSShhhhHHHO......',
    '......OHHHOSSOSSSSOSSOHHHO......',
    '......OHHHSOOSSSSSSOOSHHHO......',
    '......OHHsOSSOSSSSOSSOsHHO......',
    '......OHsSSSSSSSSSSSSSSsHO......',
    '......OHsSSSMOMOMSSSSSSsHO......',
  ],
};

const cache = new Map<Mood, string[]>();

export function zunRows(mood: Mood): string[] {
  let rows = cache.get(mood);
  if (!rows) {
    rows = [...HEAD_TOP, ...FACES[mood], ...BODY];
    cache.set(mood, rows);
  }
  return rows;
}

export const ZUN_WIDTH = 32;
export const ZUN_HEIGHT = 42;
/** 책상 위로 드러나는 상반신 높이 (행 수) — 아래 다리·신발은 책상에 가려 그리지 않는다 */
export const ZUN_BUST_ROWS = 36;

/**
 * 팀원 스프라이트 (16 x 22)
 * H 머리 · S 피부 · W 흰자 · P 동공 · M 입 · T 상의 · L 바지 · K 신발 · O 아웃라인
 */
export const TEAMMATE_ROWS = [
  '.....OOOOOO.....',
  '...OOHHHHHHOO...',
  '..OHHHHHHHHHHO..',
  '..OHSSSSSSSSHO..',
  '..OHSWWSSWWSHO..',
  '..OHSWPSSWPSHO..',
  '..OHSSSSSSSSHO..',
  '...OSSSMMSSSO...',
  '....OSSSSSSO....',
  '.....OOSSOO.....',
  '..OOOOTTTTOOOO..',
  '.OTTTTTTTTTTTTO.',
  '.OTTTTTTTTTTTTO.',
  '.OTTTTTTTTTTTTO.',
  '.OTTTTTTTTTTTTO.',
  '..OTTTTTTTTTTO..',
  '..OTTTTTTTTTTO..',
  '..OLLLLOOLLLLO..',
  '..OLLLLOOLLLLO..',
  '..OLLLLOOLLLLO..',
  '.OKKKKKOOKKKKKO.',
  '.OOOOOOOOOOOOOO.',
];

export function teammatePalette(hair: string, shirt: string): Palette {
  return {
    O: '#0a0d1a',
    H: hair,
    S: '#f2cba6',
    W: '#ffffff',
    P: '#141828',
    M: '#c46059',
    T: shirt,
    L: '#2b3152',
    K: '#1a1f36',
  };
}

export const TEAMMATE_STYLES: [string, string][] = [
  ['#4a3226', '#e05a72'],
  ['#d9b451', '#3b6cff'],
  ['#20222e', '#22c55e'],
  ['#9d4331', '#f5a524'],
  ['#33336e', '#7c5cff'],
  ['#5d4023', '#0ea5e9'],
];
