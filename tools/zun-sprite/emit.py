"""생성한 스프라이트를 zunSprite.ts 로 내보낸다."""
from gen import build, MOODS, PALETTE, W, H

grids = {m: build(m).rows() for m in MOODS}
base = grids['idle']

# 무드마다 달라지는 행 범위를 찾는다 → 그 구간만 표정 데이터로 분리
diff = [y for y in range(H) if any(grids[m][y] != base[y] for m in MOODS)]
lo, hi = min(diff), max(diff) + 1
print(f'표정이 달라지는 행: {lo}..{hi - 1} ({hi - lo}행)')

used = sorted({ch for rows in grids.values() for r in rows for ch in r} - {'.'})
print('사용 팔레트:', ''.join(used))

LABELS = {
    'O': '아웃라인', 'c': '캡 그림자', 'C': '캡 기본', 'L': '캡 하이라이트',
    'v': '챙 밑면', 'V': '챙 윗면', 'W': '흰색', 'h': '머리 그림자', 'H': '머리 기본',
    'j': '머리 하이라이트', 's': '피부 그림자', 'S': '피부', 't': '피부 하이라이트',
    'k': '볼터치', 'I': '홍채', 'i': '홍채 반사광', 'P': '동공', 'M': '입', 'm': '입 안쪽',
    'n': '후드 그림자', 'N': '후드 기본', 'l': '후드 하이라이트', 'z': '후드 끈',
    'd': '바지 그림자', 'D': '바지', 'G': '신발', 'g': '신발 그림자', 'b': '신발 포인트',
}

out = []
out.append("import type { Mood } from '../../game/types';")
out.append("import type { Palette } from './PixelSprite';")
out.append('')
out.append('/**')
out.append(' * ZUN 픽셀 스프라이트 (48 x 64) — 치비 비율의 전신 캐릭터.')
out.append(' *')
out.append(' * scripts/zun-sprite/gen.py 로 생성한 결과를 옮겨 담은 것이다.')
out.append(' * 실루엣 바깥은 자동 아웃라인 처리되어 있고, 광원은 좌측 상단이다.')
out.append(' */')
out.append('export const ZUN_PALETTE: Palette = {')
for ch in used:
    out.append(f"  {ch}: '{PALETTE[ch]}', // {LABELS.get(ch, '')}".rstrip())
out.append('};')
out.append('')
out.append(f'/** 모자 ~ 눈썹 (y0 ~ y{lo - 1}) */')
out.append('const HEAD_TOP = [')
for r in base[:lo]:
    out.append(f"  '{r}',")
out.append('];')
out.append('')
out.append(f'/** 턱 ~ 신발 (y{hi} ~ y{H - 1}) */')
out.append('const BODY = [')
for r in base[hi:]:
    out.append(f"  '{r}',")
out.append('];')
out.append('')
out.append(f'/** 표정 {hi - lo}줄 (y{lo} ~ y{hi - 1}): 눈 · 볼 · 입 */')
out.append('const FACES: Record<Mood, string[]> = {')
for m in MOODS:
    out.append(f'  {m}: [')
    for r in grids[m][lo:hi]:
        out.append(f"    '{r}',")
    out.append('  ],')
out.append('};')
out.append('')
out.append('const cache = new Map<Mood, string[]>();')
out.append('')
out.append('export function zunRows(mood: Mood): string[] {')
out.append('  let rows = cache.get(mood);')
out.append('  if (!rows) {')
out.append('    rows = [...HEAD_TOP, ...FACES[mood], ...BODY];')
out.append('    cache.set(mood, rows);')
out.append('  }')
out.append('  return rows;')
out.append('}')
out.append('')
out.append(f'export const ZUN_WIDTH = {W};')
out.append(f'export const ZUN_HEIGHT = {H};')
out.append('/** 책상 위로 드러나는 상반신 높이 (행 수) — 아래는 책상에 가려 그리지 않는다 */')
out.append('export const ZUN_BUST_ROWS = 42;')
open('zunSprite.head.ts', 'w').write('\n'.join(out) + '\n')
print('wrote zunSprite.head.ts')
