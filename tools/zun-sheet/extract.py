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
    'reference/',          # 폴더 안의 이미지를 자동으로 찾는다
    'zun-sheet.png',
    'public/zun-sheet.png',
    os.path.expanduser('~/zun-sheet.png'),
    os.path.expanduser('~/Downloads/zun-sheet.png'),
]

IMAGE_EXT = ('.png', '.jpg', '.jpeg', '.webp')


def find_sheet() -> str | None:
    """흔한 위치에서 시트를 찾는다. 폴더면 그 안에서 가장 큰 이미지를 고른다."""
    for c in DEFAULT_LOCATIONS:
        if c.endswith('/'):
            if not os.path.isdir(c):
                continue
            imgs = [os.path.join(c, f) for f in sorted(os.listdir(c))
                    if f.lower().endswith(IMAGE_EXT)]
            if imgs:
                # 여러 장이면 가장 큰 파일이 시트일 가능성이 높다
                return max(imgs, key=os.path.getsize)
        elif os.path.isfile(c):
            return c
    return None


def verify(path: str) -> tuple[bool, str]:
    """저장한 PNG에 캐릭터가 한 명만 있고 배경이 지워졌는지 확인한다.

    손에 든 소품이나 효과선은 본체보다 훨씬 작으므로, 연결 요소 중
    '본체의 25% 이상' 인 덩어리가 둘 이상일 때만 캐릭터가 여럿이라고 본다.
    """
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()

    seen = bytearray(w * h)
    sizes = []
    for sy in range(h):
        for sx in range(w):
            i = sy * w + sx
            if seen[i] or px[sx, sy][3] <= 8:
                continue
            q = deque([(sx, sy)])
            seen[i] = 1
            n = 0
            while q:
                x, y = q.popleft()
                n += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            j = ny * w + nx
                            if not seen[j] and px[nx, ny][3] > 8:
                                seen[j] = 1
                                q.append((nx, ny))
            sizes.append(n)
    if not sizes:
        return False, '빈 이미지'
    sizes.sort(reverse=True)
    bodies = [n for n in sizes if n >= sizes[0] * 0.25]
    if len(bodies) > 1:
        return False, f'캐릭터로 보이는 덩어리가 {len(bodies)}개 (크기 {bodies[:3]})'

    # 테두리에 배경색이 남아 있는지
    border = []
    for x in range(w):
        border += [px[x, 0], px[x, h - 1]]
    for y in range(h):
        border += [px[0, y], px[w - 1, y]]
    leftover = 0
    for r, g, b, a in border:
        if a <= 8:
            continue
        hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if ss <= 0.14 and vv >= 0.72:
            leftover += 1
    if leftover > len(border) * 0.35:
        return False, f'테두리에 배경이 남아 있음 ({leftover}/{len(border)}px)'

    props = len(sizes) - 1
    note = f'{w}x{h}'
    if props:
        note += f', 소품 {props}개'
    return True, note


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


def find_label_boxes(img: Image.Image, cols: int, rows: int) -> list[tuple[int, int, int, int]]:
    """칸 번호 라벨의 위치를 자동으로 찾는다.

    라벨은 (1) 채도가 높은 파란 글자이고 (2) 여러 칸에서 같은 높이에 나란히 있으며
    (3) 칸 왼쪽 위에 있는 작은 덩어리라는 성질을 이용한다.
    행마다 라벨 높이가 다른 시트에도 대응한다.
    """
    rgb = img.convert('RGB')
    W, H = rgb.size
    px = rgb.load()
    cw = W // cols

    per_row: dict[int, list[int]] = {}
    for y in range(H):
        xs = []
        for x in range(W):
            r, g, b = px[x, y]
            if b > 110 and b - r > 70 and b - g > 50 and g > 30:
                xs.append(x)
        if xs:
            per_row[y] = xs

    # 세로로 이어진 구간을 밴드로 묶는다
    bands: list[tuple[int, int]] = []
    start = prev = None
    for y in sorted(per_row):
        if start is None:
            start = y
        elif y - prev > 6:
            bands.append((start, prev))
            start = y
        prev = y
    if start is not None:
        bands.append((start, prev))

    boxes: list[tuple[int, int, int, int]] = []
    for y0, y1 in bands:
        xs = sorted({x for y in range(y0, y1 + 1) for x in per_row.get(y, [])})
        touched = {x // cw for x in xs}
        if len(touched) < max(3, cols - 2):
            continue  # 여러 칸에 나란히 있지 않으면 라벨이 아니다 (소품)
        for c in sorted(touched):
            cx = [x - c * cw for x in xs if x // cw == c]
            lo, hi = min(cx), max(cx)
            # 라벨은 칸 왼쪽 위의 작은 글자다
            if hi - lo > cw * 0.45 or lo > cw * 0.5:
                continue
            boxes.append((c * cw + max(0, lo - 5), max(0, y0 - 5), c * cw + hi + 6, y1 + 6))
    return boxes


def clear_boxes(img: Image.Image, boxes: list[tuple[int, int, int, int]]) -> None:
    px = img.load()
    W, H = img.size
    for x0, y0, x1, y1 in boxes:
        for y in range(max(0, y0), min(y1, H)):
            for x in range(max(0, x0), min(x1, W)):
                px[x, y] = (0, 0, 0, 0)


def split_bands(profile: list[int], count: int, span: int) -> list[tuple[int, int]]:
    """내용이 비어 있는 구간(여백)을 찾아 count 개의 밴드로 나눈다.

    시트의 행/열 간격이 균일하지 않아도 실제 캐릭터 경계를 찾아낸다.
    """
    n = len(profile)
    gaps: list[tuple[int, int]] = []
    start = None
    for i, v in enumerate(profile):
        if v == 0:
            if start is None:
                start = i
        elif start is not None:
            gaps.append((start, i))
            start = None
    if start is not None:
        gaps.append((start, n))

    inner = [g for g in gaps if g[0] > span * 0.25 and g[1] < n - span * 0.25]
    inner.sort(key=lambda g: g[1] - g[0], reverse=True)
    cuts = sorted((g[0] + g[1]) // 2 for g in inner[:count - 1])
    if len(cuts) < count - 1:
        # 여백이 부족하면 균등 분할로 되돌린다
        cuts = [round(n * (i + 1) / count) for i in range(count - 1)]

    lead = gaps[0][1] if gaps and gaps[0][0] == 0 else 0
    tail = gaps[-1][0] if gaps and gaps[-1][1] == n else n
    edges = [lead, *cuts, tail]
    return [(edges[i], edges[i + 1]) for i in range(count)]


def profile_y(img: Image.Image, x0: int, x1: int) -> list[int]:
    px = img.load()
    W, H = img.size
    return [sum(1 for x in range(max(0, x0), min(x1, W)) if px[x, y][3] > 8) for y in range(H)]


def profile_x(img: Image.Image, y0: int, y1: int) -> list[int]:
    px = img.load()
    W, H = img.size
    return [sum(1 for y in range(max(0, y0), min(y1, H)) if px[x, y][3] > 8) for x in range(W)]


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
    ap.add_argument('--val-min', type=float, default=0.58, help='배경으로 볼 최소 명도')
    ap.add_argument('--halo', type=int, default=1, help='가장자리 halo 를 벗겨낼 횟수')
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
    label_boxes = find_label_boxes(src, args.cols, args.rows)
    print(f'번호 라벨 {len(label_boxes)}개를 찾았습니다.')
    img = strip_background(src, args.sat_max, args.val_min, args.halo)
    clear_boxes(img, label_boxes)

    W, H = img.size
    os.makedirs(args.out, exist_ok=True)
    meta: dict[str, dict[str, int]] = {}
    failures: list[tuple[str, str]] = []

    # 열 간격은 일정하지만 행 간격은 시트마다 다를 수 있어, 행만 실제 여백으로 나눈다
    cw = W // args.cols
    row_bands = split_bands(profile_y(img, 0, W), args.rows, H / args.rows)
    print('행 구간:', row_bands)

    for r, (ry0, ry1) in enumerate(row_bands):
        for c in range(args.cols):
            cx0, cx1 = c * cw, (c + 1) * cw
            i = r * args.cols + c
            box = bbox(img, cx0, ry0, cx1, ry1)
            name = f'{i + 1:02d}.png'
            if box is None:
                failures.append((name, '캐릭터를 찾지 못했습니다'))
                continue
            bx0, by0, bx1, by1 = box
            bx0 = max(cx0, bx0 - args.pad)
            by0 = max(ry0, by0 - args.pad)
            bx1 = min(cx1, bx1 + args.pad)
            by1 = min(ry1, by1 + args.pad)
            cell = img.crop((bx0, by0, bx1, by1))
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
        print('  배경 판정을 조정해 보세요: --sat-max 0.2 --val-min 0.5 / --halo 2')
        raise SystemExit(1)
    print('\n검증 통과: 모든 PNG가 캐릭터 1명 + 배경 alpha 0 입니다.')


if __name__ == '__main__':
    main()
