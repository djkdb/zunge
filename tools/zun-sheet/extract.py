"""
ZUN 캐릭터 시트(8열 x 4행 = 32포즈)를 포즈별 투명 PNG로 분리한다.

    python3 tools/zun-sheet/extract.py <시트경로> [--cols 8] [--rows 4] [--out public/characters/zun]

하는 일
  1) 투명 체크무늬(또는 단색) 배경을 테두리에서 flood fill 로 제거한다.
     - 캐릭터 안쪽의 흰색(신발·얼굴)은 어두운 아웃라인으로 둘러싸여 있어 지워지지 않는다.
  2) 가장자리에 남는 밝은 halo 를 한 번 더 걷어낸다.
  3) 칸마다 좌상단 번호 라벨을 지운다.
  4) 캐릭터의 실제 경계 상자로 잘라 01.png ~ 32.png 로 저장한다.
  5) 각 포즈의 발밑 위치(anchor)를 메타데이터로 함께 내보낸다.
"""
from __future__ import annotations

import argparse
import colorsys
import json
import os
from collections import deque

from PIL import Image


DEFAULT_LOCATIONS = [
    'zun-sheet.png',
    'public/zun-sheet.png',
    'reference/zun-sheet.png',
    os.path.expanduser('~/zun-sheet.png'),
    os.path.expanduser('~/Downloads/zun-sheet.png'),
]


def find_sheet() -> str | None:
    for c in DEFAULT_LOCATIONS:
        if os.path.isfile(c):
            return c
    return None


def verify(path: str) -> tuple[bool, str]:
    """저장한 PNG에 캐릭터가 정확히 한 명만 있고 배경이 투명한지 확인한다."""
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    cols = [sum(1 for y in range(h) if px[x, y][3] > 8) for x in range(w)]
    # 가운데에 8px 이상 빈 열이 이어지면 캐릭터가 둘 이상이라는 뜻
    blobs, run = 1, 0
    for c in cols[2:-2]:
        if c == 0:
            run += 1
        else:
            if run >= 8:
                blobs += 1
            run = 0
    corner = max(px[0, 0][3], px[w - 1, 0][3], px[0, h - 1][3], px[w - 1, h - 1][3])
    opaque = sum(cols)
    if opaque == 0:
        return False, '빈 이미지'
    if blobs != 1:
        return False, f'캐릭터가 {blobs}명 들어 있음'
    if corner != 0:
        return False, f'모서리 배경이 남아 있음 (alpha {corner})'
    return True, f'{w}x{h}'


def is_backgroundish(r: int, g: int, b: int, sat_max: float, val_min: float) -> bool:
    """채도가 낮고 밝은 픽셀 = 체크무늬/흰 배경 후보."""
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return s <= sat_max and v >= val_min


def strip_background(img: Image.Image, sat_max: float, val_min: float, halo: int) -> Image.Image:
    """테두리에서 시작하는 flood fill 로 배경만 투명하게 만든다."""
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()

    bg = bytearray(w * h)          # 1 = 배경으로 확정
    cand = bytearray(w * h)        # 1 = 배경 후보
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0 or is_backgroundish(r, g, b, sat_max, val_min):
                cand[y * w + x] = 1

    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            i = y * w + x
            if cand[i] and not bg[i]:
                bg[i] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            i = y * w + x
            if cand[i] and not bg[i]:
                bg[i] = 1
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                j = ny * w + nx
                if cand[j] and not bg[j]:
                    bg[j] = 1
                    q.append((nx, ny))

    for y in range(h):
        for x in range(w):
            if bg[y * w + x]:
                px[x, y] = (0, 0, 0, 0)

    # 가장자리 halo 제거: 투명 픽셀과 맞닿은 '밝고 채도 낮은' 픽셀을 몇 번 더 벗겨낸다
    for _ in range(halo):
        peel = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                if not is_backgroundish(r, g, b, sat_max + 0.06, val_min - 0.06):
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        peel.append((x, y))
                        break
        if not peel:
            break
        for x, y in peel:
            px[x, y] = (0, 0, 0, 0)
    return img


def clear_label(img: Image.Image, x0: int, y0: int, cw: int, ch: int, frac_w: float, frac_h: float) -> None:
    """칸 좌상단의 번호 라벨 영역을 투명하게 지운다."""
    px = img.load()
    for y in range(y0, min(y0 + int(ch * frac_h), img.size[1])):
        for x in range(x0, min(x0 + int(cw * frac_w), img.size[0])):
            px[x, y] = (0, 0, 0, 0)


def bbox(img: Image.Image, x0: int, y0: int, x1: int, y1: int):
    px = img.load()
    minx, miny, maxx, maxy = x1, y1, x0, y0
    for y in range(y0, y1):
        for x in range(x0, x1):
            if px[x, y][3] > 8:
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
    if maxx < minx or maxy < miny:
        return None
    return minx, miny, maxx + 1, maxy + 1


def main() -> None:
    ap = argparse.ArgumentParser(description='ZUN 레퍼런스 시트를 32개 포즈 PNG로 분리한다')
    ap.add_argument('sheet', nargs='?', help='시트 경로 (생략하면 흔한 위치에서 찾는다)')
    ap.add_argument('--cols', type=int, default=8)
    ap.add_argument('--rows', type=int, default=4)
    ap.add_argument('--out', default='public/characters/zun')
    ap.add_argument('--sat-max', type=float, default=0.14, help='배경으로 볼 최대 채도')
    ap.add_argument('--val-min', type=float, default=0.72, help='배경으로 볼 최소 명도')
    ap.add_argument('--halo', type=int, default=1, help='가장자리 halo 를 벗겨낼 횟수')
    ap.add_argument('--label-w', type=float, default=0.30, help='번호 라벨 폭 비율')
    ap.add_argument('--label-h', type=float, default=0.12, help='번호 라벨 높이 비율')
    ap.add_argument('--pad', type=int, default=2, help='잘라낼 때 남길 여백')
    args = ap.parse_args()

    sheet_path = args.sheet or find_sheet()
    if not sheet_path:
        raise SystemExit(
            '레퍼런스 시트를 찾지 못했습니다.\n'
            '  아래 중 한 곳에 저장한 뒤 다시 실행하세요:\n'
            + '\n'.join(f'    {c}' for c in DEFAULT_LOCATIONS)
            + '\n  또는 경로를 직접 지정: npm run extract-zun -- <경로>'
        )

    src = Image.open(sheet_path)
    print(f'입력 {sheet_path} {src.size[0]}x{src.size[1]}')
    if src.size[0] % args.cols or src.size[1] % args.rows:
        print(f'  주의: {src.size[0]}x{src.size[1]} 가 {args.cols}x{args.rows} 로 정확히 나눠지지 않습니다. '
              '경계 상자로 보정합니다.')
    img = strip_background(src, args.sat_max, args.val_min, args.halo)

    W, H = img.size
    cw, ch = W // args.cols, H // args.rows
    os.makedirs(args.out, exist_ok=True)

    meta: dict[str, dict[str, int]] = {}
    failures: list[tuple[str, str]] = []
    for i in range(args.cols * args.rows):
        col, row = i % args.cols, i // args.cols
        x0, y0 = col * cw, row * ch
        clear_label(img, x0, y0, cw, ch, args.label_w, args.label_h)
        box = bbox(img, x0, y0, x0 + cw, y0 + ch)
        if box is None:
            print(f'  {i + 1:02d} 비어 있음 — 건너뜀')
            continue
        bx0, by0, bx1, by1 = box
        bx0 = max(x0, bx0 - args.pad); by0 = max(y0, by0 - args.pad)
        bx1 = min(x0 + cw, bx1 + args.pad); by1 = min(y0 + ch, by1 + args.pad)
        cell = img.crop((bx0, by0, bx1, by1))
        name = f'{i + 1:02d}.png'
        out_path = os.path.join(args.out, name)
        cell.save(out_path)
        meta[f'{i + 1:02d}'] = {'w': cell.size[0], 'h': cell.size[1]}
        ok, note = verify(out_path)
        if ok:
            print(f'  {name}  {note}')
        else:
            failures.append((name, note))
            print(f'  {name}  실패: {note}')

    # 게임에서 크기를 맞추는 기준: 가장 흔한 캐릭터 높이
    heights = sorted(m['h'] for m in meta.values())
    ref_h = heights[len(heights) // 2] if heights else 0
    out_meta = {'refHeight': ref_h, 'poses': meta}
    meta_path = 'src/game/data/zunPoseMeta.json'
    os.makedirs(os.path.dirname(meta_path), exist_ok=True)
    with open(meta_path, 'w') as f:
        json.dump(out_meta, f, indent=2)
    print(f'\n{len(meta)}개 포즈를 {args.out} 에 저장했습니다. (기준 높이 {ref_h}px)')
    print(f'포즈 치수는 {meta_path} 에 저장했습니다.')
    if failures:
        print('\n검증 실패 — 아래 파일을 확인하세요:')
        for name, note in failures:
            print(f'  {name}: {note}')
        print('  배경 판정을 조정해 보세요: --sat-max 0.2 --val-min 0.65 / --halo 2 / --label-h 0.16')
        raise SystemExit(1)
    print('\n검증 통과: 모든 PNG가 캐릭터 1명 + 배경 alpha 0 입니다.')


if __name__ == '__main__':
    main()
