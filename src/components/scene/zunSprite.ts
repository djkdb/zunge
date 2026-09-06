import type { Mood } from '../../game/types';
import type { Palette } from './PixelSprite';

/**
 * ZUN 픽셀 스프라이트 (16 x 24)
 * . 투명  C 캡  c 캡 챙  W 흰색  K 머리카락/검정  S 피부  s 피부 그림자
 * N 후드티  n 후드티 그림자  P 눈동자  R 입  r 볼터치  X 땀방울  Y 반짝이
 */
export const ZUN_PALETTE: Palette = {
  C: '#1f2b4d',
  c: '#111a33',
  W: '#ffffff',
  K: '#16171f',
  S: '#f7d3b1',
  s: '#e5b48d',
  N: '#243466',
  n: '#182348',
  P: '#1b1c2e',
  R: '#d9736b',
  r: '#f3a7a0',
  X: '#7cc2ff',
  Y: '#ffd54a',
};

const HEAD_TOP = [
  '....CCCCCCCC....',
  '...CCCCCCCCCC...',
  '..CCCCWWCCCCCC..',
  '..CCCCWWCCCCCC..',
  '..CCCCCCCCCCCC..',
  '.cccccccccccccc.',
  '..KKKKKKKKKKKK..',
  '..KSSSSSSSSSSK..',
  '..KSSSSSSSSSSK..',
];

const BODY = [
  '....SSSSSSSS....',
  '..NNNNnSSnNNNN..',
  '.NNNNNNWWNNNNNN.',
  '.NNNNNNWWNNNNNN.',
  'NNNNNNNNNNNNNNNN',
  'NNNNNNNNNNNNNNNN',
  'NNNNnnNNNNNNnnNN',
  'NNNnNNNNNNNNNnNN',
  'SSnNNNNNNNNNNnSS',
  'SS.NNNNNNNNNN.SS',
];

/** 표정 (5줄: 눈 3줄 + 볼 + 입) */
const FACES: Record<Mood, string[]> = {
  idle: [
    '..KSWWSSSSWWSK..',
    '..KSPPSSSSPPSK..',
    '..KSPPSSSSPPSK..',
    '..sSrSSSSSSrSs..',
    '...SSSSRRSSSS...',
  ],
  focus: [
    '..KSKKSSSSKKSK..',
    '..KSWWSSSSWWSK..',
    '..KSPPSSSSPPSK..',
    '..sSSSSSSSSSSs..',
    '...SSSSRRSSSS...',
  ],
  happy: [
    '..KSSPSSSSPSSK..',
    '..KSPSPSSPSPSK..',
    '..KSSSSSSSSSSK..',
    '..srSSSSSSSSrs..',
    '...SSSRRRRSSS...',
  ],
  panic: [
    '..KSWWSSSSWWSKX.',
    '..KSWPSSSSPWSKX.',
    '..KSWWSSSSWWSK..',
    '..sSSSSSSSSSSs..',
    '...SSSRSRSRSS...',
  ],
  shock: [
    '..KSWWWSSWWWSK..',
    '..KSWPWSSWPWSK..',
    '..KSWWWSSWWWSK..',
    '..sSSSSSSSSSSs..',
    '...SSSSPPSSSS...',
  ],
  confident: [
    '..KSKKSSSSWWSKY.',
    '..KSWWSSSSPPSK..',
    '..KSPPSSSSPPSK..',
    '..sSSSSSSSSSSs..',
    '...SSSSSRRRSS...',
  ],
  meltdown: [
    '.XKSPSPSSPSPSKX.',
    '..KSSPSSSSPSSK..',
    '..KSPSPSSPSPSK..',
    '..sSSSSSSSSSSs..',
    '...SSRSRSRSRS...',
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

export const ZUN_WIDTH = 16;
export const ZUN_HEIGHT = 24;

/** 팀원 스프라이트 (12 x 16) */
export const TEAMMATE_ROWS = [
  '...HHHHHH...',
  '..HHHHHHHH..',
  '..HSSSSSSH..',
  '..HSWSSWSH..',
  '..HSPSSPSH..',
  '...SSSSSS...',
  '....SRRS....',
  '..TTTSSTTT..',
  '.TTTTTTTTTT.',
  '.TTTTTTTTTT.',
  'TTTTTTTTTTTT',
  'SSTTTTTTTTSS',
  '..TTTTTTTT..',
  '..LLL..LLL..',
  '..LLL..LLL..',
  '..KKK..KKK..',
];

export function teammatePalette(hair: string, shirt: string): Palette {
  return { H: hair, S: '#f7d3b1', W: '#ffffff', P: '#1b1c2e', R: '#d9736b', T: shirt, L: '#3a3f55', K: '#16171f' };
}

export const TEAMMATE_STYLES: [string, string][] = [
  ['#5a3b2e', '#e85d75'],
  ['#e8c25a', '#3b6cff'],
  ['#2a2a35', '#22c55e'],
  ['#b04a3a', '#f5a524'],
  ['#3d3d8a', '#7c5cff'],
  ['#6b4a2b', '#0ea5e9'],
];
