import type { Mood } from '../../game/types';
import type { Palette } from './PixelSprite';

/**
 * ZUN 픽셀 스프라이트 (48 x 64) — 치비 비율의 전신 캐릭터.
 *
 * scripts/zun-sprite/gen.py 로 생성한 결과를 옮겨 담은 것이다.
 * 실루엣 바깥은 자동 아웃라인 처리되어 있고, 광원은 좌측 상단이다.
 */
export const ZUN_PALETTE: Palette = {
  C: '#22305c', // 캡 기본
  D: '#1e2130', // 바지
  G: '#f1f4fa', // 신발
  H: '#191d2f', // 머리 기본
  I: '#232b4d', // 홍채
  L: '#2f4478', // 캡 하이라이트
  M: '#cd6d63', // 입
  N: '#22315a', // 후드 기본
  O: '#151a2b', // 아웃라인
  S: '#fbdcbb', // 피부
  V: '#1a2649', // 챙 윗면
  W: '#ffffff', // 흰색
  b: '#3b6cff', // 신발 포인트
  c: '#182246', // 캡 그림자
  d: '#141621', // 바지 그림자
  g: '#c6cfdd', // 신발 그림자
  h: '#0f1120', // 머리 그림자
  i: '#39477e', // 홍채 반사광
  k: '#f2a49b', // 볼터치
  l: '#2e4276', // 후드 하이라이트
  m: '#a24b43', // 입 안쪽
  n: '#172343', // 후드 그림자
  s: '#e7b992', // 피부 그림자
  t: '#fff1de', // 피부 하이라이트
  v: '#0f1732', // 챙 밑면
  z: '#eef2fb', // 후드 끈
};

/** 모자 ~ 눈썹 (y0 ~ y16) */
const HEAD_TOP = [
  '................................................',
  '................................................',
  '................................................',
  '..................OOOOOOOOOOOO..................',
  '................OOLCCCCCCCCCCCOO................',
  '..............OOLLLCCCCCCCCCCCCcOO..............',
  '.............OLLLLLCCCCCCCCCCCCcccO.............',
  '............OLLLLWWWCWCWCWWCWCCccccO............',
  '...........OLLLLLLLWCWCWCWWCWCCcccccO...........',
  '..........OLLLLLLLWCCWCWCWCWWCCccccccO..........',
  '..........OLLLLLLWLCCWCWCWCWWCCccccccO..........',
  '..........OLLLLLLWWWCWWWCWCCWCCccccccO..........',
  '.........OLLLLVVVVVVVVVVVVVVVVVVVVccccO.........',
  '.........OVVVVVVVVVVVVVVVVVVVVVVVVVVVVO.........',
  '........OVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVO........',
  '........OvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvO........',
  '.........OvvvvvvvvvvvvvvvvvvvvvvvvvvvvO.........',
];

/** 턱 ~ 신발 (y34 ~ y63) */
const BODY = [
  '............OOOOnNNNNSSSSSSNNNNnOOOO............',
  '...........ONllnnnNNNNNNNNNNNNnnnNNNO...........',
  '...........OllllnnnnnNNNNNNnnnnnNNNNO...........',
  '..........ONlllllnnnnnnnnnnnnnnNNNNNNO..........',
  '..........ONlllllllllnnnnnnNNNNNNNNNNO..........',
  '..........ONlllllllllzlllNzNNNnnnnnNNO..........',
  '..........ONlllllllllzlllNzNNnnnnnnnNO..........',
  '..........ONlllllllllzlllNzNnnnnnnnnnO..........',
  '..........ONNllllllllzllNNzNnnnnnnnnnO..........',
  '..........ONNllllnnnnnnnnnnnnnnnnnnnnO..........',
  '..........ONNNNllnllllNNNNNnnnnnnnnnnO..........',
  '..........OSSSSNNnlNNNNNNNNnnnnnnssssO..........',
  '..........OSSSSSNnNNNNNNNNNnnnnnsssssO..........',
  '..........OSSSSSNNNNNNNNNNNNnnnnsssssO..........',
  '..........OSSSSOOONNNNNNNNNNnnOOOssssO..........',
  '...........OSSO..OddDDDOODDDddO..OssO...........',
  '............OO...OddDDDOODDDddO...OO............',
  '.................OddDDDOODDDddO.................',
  '.................OddDDDOODDDddO.................',
  '.................OddDDDOODDDddO.................',
  '.................OddDDDOODDDddO.................',
  '.................OddDDDOODDDddO.................',
  '................OOGGGGDOODDGGGGOO...............',
  '...............OggggggggOggggggggO..............',
  '...............OGGGGGGGGOGGGGGGGGO..............',
  '...............ObbbbbbbbObbbbbbbbO..............',
  '...............OggggggggOggggggggO..............',
  '................OOOOOOOO.OOOOOOOO...............',
  '................................................',
  '................................................',
];

/** 표정 17줄 (y17 ~ y33): 눈 · 볼 · 입 */
const FACES: Record<Mood, string[]> = {
  idle: [
    '.........OHHHCvvvvvvvvvvvvvvvvvvvvChhhO.........',
    '.........OHHHHCCCCCCCCCCCCCCCCCCCChhhhO.........',
    '.........OHHHHHtCCCCCCCCCCCCCCCChthhhhO.........',
    '.........OHHHHHSSSCCCCCCCCCCCCSSShhhhhO.........',
    '........OHHHHHHSSSSSSSSSSSSSSSSSShhhhhhO........',
    '.........OHHHHHSOOOOOSSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHSWWIIOSSSSSSWWIIOShhhhhO.........',
    '.........OHHHHHOWWIIIOSSSSOWWIIIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHOIIIiIOSSSSOIIIiIOhhhhhO.........',
    '.........OHHHHHSIIIIISSSSSSIIIIIShhhhhO.........',
    '.........OHkkkkSOIIIOSSSSSSOIIIOSkkkkhO.........',
    '.........OHHkkkSSSSSSSSSSSSSSSSSSkkkhhO.........',
    '.........OHHHHsSSSSSSSMMMMSSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSMSSMSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSSSSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
  ],
  focus: [
    '.........OHHHCvvvvvvvvvvvvvvvvvvvvChhhO.........',
    '.........OHHHHCCCCCCCCCCCCCCCCCCCChhhhO.........',
    '.........OHHHHHthhCCCCCCCCCCCChhhthhhhO.........',
    '.........OHHHHHSSShhhCCCCCChhhSSShhhhhO.........',
    '........OHHHHHHSSSSSSSSSSSSSSSSSShhhhhhO........',
    '.........OHHHHHSOOOOOSSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHSWWIIOSSSSSSWWIIOShhhhhO.........',
    '.........OHHHHHOWWIIIOSSSSOWWIIIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHOIIIiIOSSSSOIIIiIOhhhhhO.........',
    '.........OHHHHHSIIIIISSSSSSIIIIIShhhhhO.........',
    '.........OHHHHHSOIIIOSSSSSSOIIIOShhhhhO.........',
    '.........OHHHHHSSSSSSSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHsSSSSSSmmmmmmSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSSSSSSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSSSSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
  ],
  happy: [
    '.........OHHHCvvvvvvvvvvvvvvvvvvvvChhhO.........',
    '.........OHHHHCCCCCCCCCCCCCCCCCCCChhhhO.........',
    '.........OHHHHHtCCChhCCCCCChhCCChthhhhO.........',
    '.........OHHHHHShhhCCCCCCCCCChhhShhhhhO.........',
    '........OHHHHHHSSSSSSSSSSSSSSSSSShhhhhhO........',
    '.........OHHHHHSSSSSSSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHHSSSSSSSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHHSSSOSSSSSSSSSSOSSShhhhhO.........',
    '.........OHHHHHSSOOOSSSSSSSSOOOSShhhhhO.........',
    '.........OHHHHHOOOOOOOSSSSOOOOOOOhhhhhO.........',
    '.........OHHHHHOSOSOSOSSSSOSOSOSOhhhhhO.........',
    '.........OHkkkkOOSSSOOSSSSOOSSSOOkkkkhO.........',
    '.........OHHkkkSSSSSSSSSSSSSSSSSSkkkhhO.........',
    '.........OHHHHsSSSSSSSMSMSMSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSMMMMSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSmmSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
  ],
  panic: [
    '.........OHHHCvvvvvvhvvvvvvhvvvvvvChhhO.........',
    '.........OHHHHCCChhhCCCCCCCChhhCCChhhhbO........',
    '.........OHHHHHthCCCCCCCCCCCCCChhthhhhObO.......',
    '.........OHHHHHSSSCCCCCCCCCCCCSSShhhhhbO........',
    '........OHHHHHHSSOOOSSSSSSSSOOOSShhhhhhO........',
    '.........OHHHHHSOOOOOSSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHOWWIIOOSSSSOWWIIOOhhhhhO.........',
    '.........OHHHHHOWWIIIOSSSSOWWIIIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHOIIIiIOSSSSOIIIiIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHSOIIIOSSSSSSOIIIOShhhhhO.........',
    '.........OHHHHHSSOOOSSSSSSSSOOOSShhhhhO.........',
    '.........OHHHHsSSSSSSMSMSMSSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSMSMSSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSSSSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
  ],
  shock: [
    '.........OHHHCvvvvvhhvvvvvvhhvvvvvChhhO.........',
    '.........OHHHHCChhhCCCCCCCCCChhhCChhhhO.........',
    '.........OHHHHHtCCCCCCCCCCCCCCCChthhhhO.........',
    '.........OHHHHHSSSCCCCCCCCCCCCSSShhhhhO.........',
    '........OHHHHHHSSOOOSSSSSSSSOOOSShhhhhhO........',
    '.........OHHHHHSOOOOOSSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHOWWIIOOSSSSOWWIIOOhhhhhO.........',
    '.........OHHHHHOWWIIIOSSSSOWWIIIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHOIIIiIOSSSSOIIIiIOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOIIIIIOhhhhhO.........',
    '.........OHHHHHSOIIIOSSSSSSOIIIOShhhhhO.........',
    '.........OHHHHHSSOOOSSOOOOSSOOOSShhhhhO.........',
    '.........OHHHHsSSSSSSOmmmmOSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSmmMMmmSSSSSSOHHHO..........',
    '...........OOO.OSSSSSOMMMMOSSSSSO.OOO...........',
    '................OnSSSSOOOOSSSSnO................',
  ],
  confident: [
    '.........OHHHCvvvvvvvvvvvvvvvvvvvvChhhO.........',
    '.........OHHHHCCCCCCCCCCCCCCCCCCCChhhhO.........',
    '.........OHHHHHthhCCCCCCCCCCCChhhthhhhO.........',
    '.........OHHHHHSSShhhCCCCCChhhSSShhhhhO.........',
    '........OHHHHHHSSSSSSSSSSSSSSSSSShhhhhhO........',
    '.........OHHHHHSOOOOOSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHHSWWIIOSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHHOWWIIIOSSSSOSSSSSOhhhhhO.........',
    '.........OHHHHHOIIIIIOSSSSOOOSOOOhhhhhO.........',
    '.........OHHHHHOIIIiIOSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHSIIIIISSSSSSSSOSSShhhhhO.........',
    '.........OHkkkkSOIIIOSSSSSSSSSSSSkkkkhO.........',
    '.........OHHkkkSSSSSSSSSSSSSSSSSSkkkhhO.........',
    '.........OHHHHsSSSSSSSSSMMMMSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSMMSSSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSSSSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
  ],
  meltdown: [
    '.........OHHHCvvhvvvvvvvvvvvvvvhvvChhhO.........',
    '.........OHHHHCCChhhCCCCCCCChhhCCChhhhO.........',
    '.........OHHHHHtCCCChCCCCCChCCCChthhhhO.........',
    '.........OHHHHHSSSCCCCCCCCCCCCSSShhhhhO.........',
    '........OHHHHHHSSSSSSSSSSSSSSSSSShhhhhhO........',
    '.........OHHHHHSSSSSSSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHHOSSSSSOSSSSOSSSSSOhhhhhO.........',
    '.........OHHHHHOOOSOOOSSSSOOOSOOOhhhhhO.........',
    '.........OHHHHHSSOOOSSSSSSSSOOOSShhhhhO.........',
    '.........OHHHHHSOOOOOSSSSSSOOOOOShhhhhO.........',
    '.........OHHHHHOSOSOSOSSSSOSOSOSOhhhhhO.........',
    '.........OHHHHHOOSSSOOSSSSOOSSSOOhhhhhO.........',
    '.........OHHHHHSSSSSSSSSSSSSSSSSShhhhhO.........',
    '.........OHHHHsSSSSSSMSMSMSSSSSSSsHHHHO.........',
    '..........OHHHOSSSSSSSMSMSSSSSSSSOHHHO..........',
    '...........OOO.OSSSSSSSSSSSSSSSSO.OOO...........',
    '................OnSSSSSSSSSSSSnO................',
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

export const ZUN_WIDTH = 48;
export const ZUN_HEIGHT = 64;
/** 책상 위로 드러나는 상반신 높이 (행 수) — 아래는 책상에 가려 그리지 않는다 */
export const ZUN_BUST_ROWS = 42;

/**
 * 팀원 스프라이트 (28 x 40) — ZUN 과 같은 톤의 축소판.
 * A(머리) · T(상의) · u(상의 그림자) 는 팀원마다 색을 바꿔 넣는다.
 */
export const TEAMMATE_ROWS = [
  '............................',
  '............................',
  '............................',
  '............................',
  '...........OOOOOO...........',
  '.........OOAAAAAAOO.........',
  '.......OOAAAAAAAAAAOO.......',
  '......OAAAAAAAAAAAAAAO......',
  '.....OAAAAAAAAAAAAAAAAO.....',
  '.....OAAAAAAAAAAAAAAAAO.....',
  '....OAAAAAAAAAAAAAAAAAAO....',
  '....OAAAAAAAAAAAAAAAAAAO....',
  '....OAAtASAAASASAAASAAAO....',
  '...OAAAASSSASSSSSASSAAAAO...',
  '...OAAAASOOOSSSSOOOSAAAAO...',
  '...OAAAAOWWWOSSOWWWOAAAAO...',
  '...OAAAAOWIWOSSOWIWOAAAAO...',
  '...OAAAAOIIIOSSOIIIOAAAAO...',
  '....OAASSOWOSSSSOWOSSAAO....',
  '....OAkkkkSSSSSSSSkkkkAO....',
  '.....OOOSSSSSMMSSSSSOOO.....',
  '.......OOOSSSSSSSSOOO.......',
  '......OuuuuussssTTTTTO......',
  '......OuuuuuuuuTTTTTTO......',
  '......OuuuuuuuuTTTTTTO......',
  '.....OuuuuuuuuuTTTTTTTO.....',
  '.....OuuuuuuuuuTTTTTTTO.....',
  '.....OTuuuuuuuTTTTTTTTO.....',
  '......OTuuuuuTTTTTTTTO......',
  '......OSSSTTTTTTTTsssO......',
  '......OSSSTTTTTTTTsssO......',
  '......OSSSDTTTTTTDsssO......',
  '.......OOODDDOODDDOOO.......',
  '.........ODDDOODDDO.........',
  '.........ODDDOODDDO.........',
  '.........ODDDOODDDO.........',
  '........OGGGGGGGGGGO........',
  '........OGGGGGGGGGGO........',
  '........OggggggggggO........',
  '.........OOOOOOOOOO.........',
];

export function teammatePalette(hair: string, shirt: string): Palette {
  return {
    ...ZUN_PALETTE,
    A: hair,
    T: shirt,
    u: shade(shirt, -28),
  };
}

/** hex 색을 밝게(+) / 어둡게(-) 보정 */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, v + amount));
  const r = ch(n >> 16);
  const g = ch((n >> 8) & 0xff);
  const b = ch(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const TEAMMATE_STYLES: [string, string][] = [
  ['#4a3226', '#e05a72'],
  ['#d9b451', '#3b6cff'],
  ['#20222e', '#22c55e'],
  ['#9d4331', '#f5a524'],
  ['#33336e', '#7c5cff'],
  ['#5d4023', '#0ea5e9'],
];
