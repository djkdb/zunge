import type { Mood } from '../../game/types';
import type { Palette } from './PixelSprite';

/**
 * ZUN 폴백 스프라이트 (48 x 64).
 *
 * 평소에는 `public/characters/zun/01.png` ~ `32.png` 이미지를 쓴다.
 * 이 파일은 그 이미지가 아직 없을 때만 게임이 빈 화면이 되지 않도록 하는 대체 자산이다.
 * tools/zun-sprite/gen.py 로 생성했다.
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
