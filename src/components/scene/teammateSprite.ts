import type { Palette } from './PixelSprite';

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
    O: '#151a2b',   // 아웃라인
    S: '#fbdcbb',   // 피부
    s: '#e7b992',   // 피부 그림자
    t: '#fff1de',   // 피부 하이라이트
    W: '#ffffff',
    I: '#232b4d',   // 눈
    M: '#cd6d63',   // 입
    k: '#f2a49b',   // 볼터치
    D: '#1e2130',   // 바지
    G: '#f1f4fa',   // 신발
    g: '#c6cfdd',
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
