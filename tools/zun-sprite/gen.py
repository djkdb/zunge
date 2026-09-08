"""ZUN 픽셀 캐릭터 생성기 (48 x 64).

셀에 팔레트 키를 찍고, 마지막에 실루엣 바깥을 자동으로 아웃라인 처리한다.
결과는 TypeScript 행 문자열과 PNG 미리보기로 동시에 내보낸다.
"""
from PIL import Image

W, H = 48, 64
CX = 23.5  # 좌우 대칭 중심

PALETTE = {
    '.': None,
    'O': '#151a2b',   # 아웃라인
    # 캡
    'c': '#182246',   # 캡 그림자
    'C': '#22305c',   # 캡 기본
    'L': '#2f4478',   # 캡 하이라이트
    'v': '#0f1732',   # 챙 밑면
    'V': '#1a2649',   # 챙 윗면
    'W': '#ffffff',
    # 머리카락
    'h': '#0f1120',
    'H': '#191d2f',
    'j': '#2b3149',
    # 피부
    's': '#e7b992',
    'S': '#fbdcbb',
    't': '#fff1de',
    'k': '#f2a49b',   # 볼터치
    # 눈
    'I': '#232b4d',   # 홍채
    'i': '#39477e',   # 홍채 밝은 부분
    'P': '#12162a',   # 동공
    # 입
    'M': '#cd6d63',
    'm': '#a24b43',
    # 후드
    'n': '#172343',
    'N': '#22315a',
    'l': '#2e4276',
    'z': '#eef2fb',   # 후드 끈
    # 바지 / 신발
    'd': '#141621',
    'D': '#1e2130',
    'G': '#f1f4fa',
    'g': '#c6cfdd',
    'b': '#3b6cff',   # 신발 포인트
}


class Grid:
    def __init__(self):
        self.g = [['.'] * W for _ in range(H)]

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H:
            self.g[y][x] = c

    def sym(self, x, y, c):
        """중심을 기준으로 좌우 대칭으로 찍는다."""
        self.px(x, y, c)
        self.px(int(round(2 * CX - x)), y, c)

    def rect(self, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                self.px(x, y, c)

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if rx <= 0 or ry <= 0:
                    continue
                dx = (x - cx) / rx
                dy = (y - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    self.px(x, y, c)

    def ellipse_if(self, cx, cy, rx, ry, c, only):
        """only 집합에 속한 색 위에만 덮어쓴다."""
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if rx <= 0 or ry <= 0:
                    continue
                dx = (x - cx) / rx
                dy = (y - cy) / ry
                if dx * dx + dy * dy <= 1.0 and 0 <= x < W and 0 <= y < H and self.g[y][x] in only:
                    self.px(x, y, c)

    def outline(self, color='O'):
        """투명 픽셀 중 실루엣에 인접한 곳을 아웃라인으로 채운다."""
        add = []
        for y in range(H):
            for x in range(W):
                if self.g[y][x] != '.':
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H and self.g[ny][nx] not in ('.', color):
                        add.append((x, y))
                        break
        for x, y in add:
            self.g[y][x] = color

    def rows(self):
        return [''.join(r) for r in self.g]

    def png(self, path, scale=10):
        img = Image.new('RGBA', (W * scale, H * scale), (0, 0, 0, 0))
        px = img.load()
        for y in range(H):
            for x in range(W):
                c = PALETTE[self.g[y][x]]
                if c is None:
                    continue
                rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
                for sy in range(scale):
                    for sx in range(scale):
                        px[x * scale + sx, y * scale + sy] = rgb
        img.save(path)


# ─────────────────────────────────────────────
#  얼굴 파츠
# ─────────────────────────────────────────────

EYE_L_CX, EYE_R_CX = 18.0, 29.0   # 눈 중심
EYE_CY = 25.0
EYE_RX, EYE_RY = 3.3, 3.9


def draw_eye_open(g, cx, look=0.0, lid=0.0, wide=0.0):
    """크고 까만 눈 + 좌상단 하이라이트 (흰자를 거의 두지 않는 귀여운 눈)."""
    rx, ry = EYE_RX * (1.0 + wide * 0.06), EYE_RY * (1.0 + wide * 0.10)
    cy = EYE_CY
    g.ellipse(cx, cy, rx, ry, 'O')                    # 눈 전체(가장 진한 색)
    g.ellipse(cx + look, cy + 0.4, rx - 0.9, ry - 1.0, 'I')   # 안쪽 남색
    # 좌상단 하이라이트 (작게)
    g.rect(cx - 1.4, cy - 1.8, cx - 0.6, cy - 1.0, 'W')
    # 우하단 작은 반사광
    g.px(cx + 1.2, cy + 1.4, 'i')
    if lid > 0:                                        # 윗눈꺼풀(집중 표정)
        for dy in range(int(lid)):
            for x in range(int(cx - rx), int(cx + rx) + 1):
                yy = int(cy - ry + dy)
                if 0 <= yy < H and g.g[yy][x] in ('I', 'W', 'i'):
                    g.px(x, yy, 'H')


def draw_eye_happy(g, cx):
    """^ 모양 웃는 눈 (도톰한 곡선)."""
    for i in range(-3, 4):
        y = EYE_CY + abs(i) * 0.85 - 1.2
        for d in range(3):
            g.px(cx + i, y + d, 'O')


def draw_eye_x(g, cx):
    """x_x 멘붕 눈 (도톰한 X)."""
    for i in range(-3, 4):
        for d in (0, 1):
            g.px(cx + i, EYE_CY + i * 0.75 + d, 'O')
            g.px(cx + i, EYE_CY - i * 0.75 + d, 'O')


def draw_eye_closed(g, cx):
    """감은 눈 (도톰한 아래 곡선)."""
    for i in range(-3, 4):
        y = EYE_CY - abs(i) * 0.45 + 0.8
        for d in (0, 1):
            g.px(cx + i, y + d, 'O')


def draw_brow(g, cx, tilt, y=19.6):
    """눈썹. tilt > 0 이면 안쪽이 내려간 화난/집중 표정."""
    if tilt == 0:
        return                      # 평상시엔 앞머리에 가려 그리지 않는다
    for i in range(-2, 3):
        yy = y + (i * tilt if cx < CX else -i * tilt)
        g.px(cx + i, yy, 'h')


def draw_mouth(g, kind):
    y = 30.0
    if kind == 'small':
        g.rect(22, y, 25, y, 'M')
        g.px(22, y + 1, 'M'); g.px(25, y + 1, 'M')
    elif kind == 'smile':
        for i in range(-2, 3):
            g.px(CX + i, y - abs(i) * 0.4 + 0.4, 'M')
        g.rect(22, y + 1, 25, y + 1, 'M')
        g.rect(23, y + 2, 24, y + 2, 'm')
    elif kind == 'open':
        g.ellipse(CX, y + 0.8, 2.4, 1.8, 'M')
        g.ellipse(CX, y + 1.2, 1.6, 1.0, 'm')
    elif kind == 'big':
        g.ellipse(CX, y + 1, 3.4, 2.4, 'O')
        g.ellipse(CX, y + 1, 2.6, 1.8, 'm')
        g.ellipse(CX, y + 1.8, 1.8, 0.9, 'M')
    elif kind == 'wave':
        for i, dy in enumerate((0, 1, 0, 1, 0)):
            g.px(21 + i, y + dy, 'M')
    elif kind == 'flat':
        g.rect(21, y + 0.5, 26, y + 0.5, 'm')
    elif kind == 'smirk':
        for i in range(0, 5):
            g.px(23 + i, y + 0.6 - i * 0.25, 'M')
        g.px(22, y + 0.8, 'M')


def draw_blush(g):
    for cx in (12.6, 34.4):
        g.ellipse(cx, 28.2, 1.9, 1.2, 'k')


# ─────────────────────────────────────────────
#  본체
# ─────────────────────────────────────────────

def build_base():
    """표정을 제외한 몸/머리/모자를 그린다."""
    g = Grid()

    # ── 다리 ──
    g.rect(18, 47, 22, 56, 'D')
    g.rect(25, 47, 29, 56, 'D')
    g.rect(18, 47, 19, 56, 'd')     # 바깥쪽 그림자
    g.rect(28, 47, 29, 56, 'd')

    # ── 신발 ──
    for x0 in (16, 25):
        g.rect(x0, 57, x0 + 7, 60, 'G')
        g.ellipse(x0 + 3.5, 58.0, 4.2, 2.2, 'G')
        g.rect(x0, 57, x0 + 7, 57, 'g')      # 갑피 그림자
        g.rect(x0, 59, x0 + 7, 59, 'b')      # 파란 라인
        g.rect(x0, 60, x0 + 7, 60, 'g')      # 밑창

    # ── 후드티 몸통 ──
    g.ellipse(CX, 41.0, 9.0, 7.5, 'N')
    g.rect(15, 36, 32, 46, 'N')
    g.ellipse(CX, 37.5, 9.0, 2.6, 'N')
    g.ellipse(CX, 46.0, 9.0, 2.6, 'N')
    # 소매
    g.ellipse(13.2, 40.8, 3.2, 6.6, 'N')
    g.ellipse(33.8, 40.8, 3.2, 6.6, 'N')
    # 왼쪽 위 하이라이트 / 오른쪽 아래 그림자 (부드러운 타원)
    g.ellipse_if(18.0, 38.5, 7.0, 6.5, 'l', {'N'})
    g.ellipse_if(32.0, 44.5, 5.5, 6.0, 'n', {'N'})
    # 손 (소매 끝)
    g.ellipse(12.7, 46.8, 2.6, 2.4, 'S')
    g.ellipse(34.3, 46.8, 2.6, 2.4, 's')
    # 캥거루 주머니: 봉제선만 남겨 실루엣을 무겁게 만들지 않는다
    for x in range(18, 30):
        g.px(x, 43, 'n')
    for y in range(43, 47):
        g.px(17, y, 'n')
        g.px(30, y, 'n')
    # 후드 끈
    for sx in (21, 26):
        g.rect(sx, 36, sx, 41, 'z')
        g.px(sx, 42, 'z')
    # 목 (후드 칼라 위로 살짝만)
    g.rect(20, 31, 27, 35, 's')
    # 후드 칼라
    g.ellipse(CX, 35.0, 8.5, 3.2, 'n')
    g.ellipse(CX, 34.0, 7.2, 2.2, 'N')

    # ── 머리 (머리카락 실루엣) ──
    g.ellipse(CX, 21.0, 14.5, 12.5, 'H')
    # ── 얼굴 ──
    g.ellipse(CX, 24.0, 12.2, 10.2, 'S')
    g.ellipse(CX, 22.5, 10.8, 8.4, 't')       # 이마 밝은 면
    g.ellipse(CX, 25.5, 11.6, 8.8, 'S')       # 다시 기본 톤
    # 턱 그림자
    for y in range(29, 35):
        for x in range(W):
            if g.g[y][x] in ('S', 't') and (x < 15 or x > 32):
                g.px(x, y, 's')

    # ── 앞머리: 이마를 덮는 덩어리 ──
    for y in range(13, 18):
        for x in range(W):
            if g.g[y][x] in ('S', 't', 's'):
                g.px(x, y, 'H')
    # 아래쪽으로 뻗은 뾰족한 가닥
    # 눈 바로 위(17.5 / 29.5)에는 짧은 가닥만 오도록 배치한다
    spikes = [(11, 1.2), (14.5, 2.4), (18, 1.2), (21.5, 2.4), (23.5, 1.2),
              (25.5, 2.4), (29, 1.2), (32.5, 2.4), (36, 1.2)]
    for tip_x, depth in spikes:
        for dx in range(-2, 3):
            x = int(round(tip_x + dx))
            d = depth * max(0.0, 1 - abs(dx) / 2.6)
            for y in range(18, int(18 + d)):
                if 0 <= x < W and g.g[y][x] in ('S', 't', 's'):
                    g.px(x, y, 'H')
    # 옆머리(구레나룻)
    g.ellipse(11.8, 24.5, 2.8, 7.5, 'H')
    g.ellipse(35.2, 24.5, 2.8, 7.5, 'H')
    # 머리카락 명암
    for y in range(13, 30):
        for x in range(W):
            if g.g[y][x] == 'H' and x > 30:
                g.px(x, y, 'h')
    for x in range(13, 21):
        if g.g[15][x] == 'H':
            g.px(x, 15, 'j')

    # ── 모자 ──
    g.ellipse(CX, 12.0, 13.5, 9.0, 'C')
    g.rect(11, 12, 36, 14, 'C')
    for y in range(2, 16):
        for x in range(W):
            if g.g[y][x] == 'C':
                if x < 19:
                    g.px(x, y, 'L')
                elif x > 30:
                    g.px(x, y, 'c')
    g.rect(11, 14, 36, 14, 'c')       # 크라운 밑단
    # 챙: 얼굴 위로 볼록하게
    g.ellipse(CX, 14.5, 15.2, 3.3, 'V')
    for y in range(15, 20):
        for x in range(W):
            if g.g[y][x] == 'V':
                g.px(x, y, 'v')
    g.rect(10, 14, 37, 14, 'V')
    return g

def draw_cap_logo(g):
    """모자 앞면의 ZUN 자수 (3x5 마이크로 폰트)."""
    font = {
        'Z': ['###', '..#', '.#.', '#..', '###'],
        'U': ['#.#', '#.#', '#.#', '#.#', '###'],
        'N': ['##.#', '##.#', '#.##', '#.##', '#..#'],
    }
    x = 17
    for ch in 'ZUN':
        rows = font[ch]
        for ry, row in enumerate(rows):
            for rx, v in enumerate(row):
                if v == '#':
                    g.px(x + rx, 7 + ry, 'W')
        x += len(rows[0]) + 1


MOODS = ['idle', 'focus', 'happy', 'panic', 'shock', 'confident', 'meltdown']


def draw_face(g, mood):
    if mood == 'idle':
        draw_brow(g, EYE_L_CX, 0.0); draw_brow(g, EYE_R_CX, 0.0)
        draw_eye_open(g, EYE_L_CX); draw_eye_open(g, EYE_R_CX)
        draw_blush(g); draw_mouth(g, 'small')
    elif mood == 'focus':
        draw_brow(g, EYE_L_CX, 0.30); draw_brow(g, EYE_R_CX, 0.30)
        draw_eye_open(g, EYE_L_CX, lid=2); draw_eye_open(g, EYE_R_CX, lid=2)
        draw_mouth(g, 'flat')
    elif mood == 'happy':
        draw_brow(g, EYE_L_CX, -0.18); draw_brow(g, EYE_R_CX, -0.18)
        draw_eye_happy(g, EYE_L_CX); draw_eye_happy(g, EYE_R_CX)
        draw_blush(g); draw_mouth(g, 'smile')
    elif mood == 'panic':
        draw_brow(g, EYE_L_CX, -0.35, y=18.0); draw_brow(g, EYE_R_CX, -0.35, y=18.0)
        draw_eye_open(g, EYE_L_CX, wide=1.0); draw_eye_open(g, EYE_R_CX, wide=1.0)
        draw_mouth(g, 'wave')
        # 땀방울
        g.px(38, 18, 'b'); g.px(39, 19, 'b'); g.px(38, 20, 'b')
    elif mood == 'shock':
        draw_brow(g, EYE_L_CX, -0.25, y=17.5); draw_brow(g, EYE_R_CX, -0.25, y=17.5)
        draw_eye_open(g, EYE_L_CX, wide=1.0); draw_eye_open(g, EYE_R_CX, wide=1.0)
        draw_mouth(g, 'big')
    elif mood == 'confident':
        draw_brow(g, EYE_L_CX, 0.22); draw_brow(g, EYE_R_CX, 0.22)
        draw_eye_open(g, EYE_L_CX); draw_eye_closed(g, EYE_R_CX)
        draw_blush(g); draw_mouth(g, 'smirk')
    elif mood == 'meltdown':
        draw_brow(g, EYE_L_CX, 0.30, y=18.0); draw_brow(g, EYE_R_CX, 0.30, y=18.0)
        draw_eye_x(g, EYE_L_CX); draw_eye_x(g, EYE_R_CX)
        draw_mouth(g, 'wave')


def build(mood):
    g = build_base()
    draw_face(g, mood)
    draw_cap_logo(g)
    g.outline()
    return g


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    # 전체 무드를 한 장에 이어붙인 시트
    sheet = Image.new('RGBA', (W * 7 * 8, H * 8), (24, 28, 48, 255))
    for i, m in enumerate(MOODS):
        g = build(m)
        g.png(f'{out}/zun-{m}.png', scale=8)
        sheet.paste(Image.open(f'{out}/zun-{m}.png'), (i * W * 8, 0))
    sheet.save(f'{out}/zun-sheet.png')
    print('moods:', ', '.join(MOODS))


# ─────────────────────────────────────────────
#  팀원 (28 x 40) — ZUN 과 같은 톤의 축소판
# ─────────────────────────────────────────────

TW, TH = 28, 40
TCX = 13.5


class TGrid(Grid):
    def __init__(self):
        self.g = [['.'] * TW for _ in range(TH)]

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < TW and 0 <= y < TH:
            self.g[y][x] = c

    def outline(self, color='O'):
        add = []
        for y in range(TH):
            for x in range(TW):
                if self.g[y][x] != '.':
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < TW and 0 <= ny < TH and self.g[ny][nx] not in ('.', color):
                        add.append((x, y))
                        break
        for x, y in add:
            self.g[y][x] = color

    def png(self, path, scale=10):
        img = Image.new('RGBA', (TW * scale, TH * scale), (0, 0, 0, 0))
        px = img.load()
        for y in range(TH):
            for x in range(TW):
                c = PALETTE[self.g[y][x]]
                if c is None:
                    continue
                rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
                for sy in range(scale):
                    for sx in range(scale):
                        px[x * scale + sx, y * scale + sy] = rgb
        img.save(path)


def build_teammate():
    """팔레트 키 A(머리) / T(상의) / u(상의 그림자) 를 쓰는 팀원 템플릿."""
    g = TGrid()
    # 다리 & 신발
    g.rect(10, 30, 12, 35, 'D')
    g.rect(15, 30, 17, 35, 'D')
    for x0 in (9, 14):
        g.rect(x0, 36, x0 + 4, 38, 'G')
        g.rect(x0, 38, x0 + 4, 38, 'g')
    # 상의
    g.ellipse(TCX, 26.0, 6.5, 5.5, 'T')
    g.rect(8, 22, 19, 30, 'T')
    g.ellipse(8.0, 26.0, 2.2, 4.5, 'T')
    g.ellipse(19.0, 26.0, 2.2, 4.5, 'T')
    g.ellipse_if(10.0, 24.0, 4.5, 4.5, 'u', {'T'})
    # 손
    g.ellipse(8.0, 30.0, 1.8, 1.7, 'S')
    g.ellipse(19.0, 30.0, 1.8, 1.7, 's')
    # 목
    g.rect(12, 19, 15, 22, 's')
    # 머리
    g.ellipse(TCX, 13.0, 9.5, 8.5, 'A')
    g.ellipse(TCX, 15.0, 8.0, 7.0, 'S')
    g.ellipse(TCX, 14.0, 7.0, 5.5, 't')
    g.ellipse(TCX, 16.0, 7.6, 6.0, 'S')
    # 앞머리
    for y in range(6, 12):
        for x in range(TW):
            if g.g[y][x] in ('S', 't'):
                g.px(x, y, 'A')
    for tip_x, depth in ((8, 1.6), (11, 2.4), (14, 1.6), (17, 2.4), (20, 1.6)):
        for dx in range(-2, 3):
            x = int(round(tip_x + dx))
            d = depth * max(0.0, 1 - abs(dx) / 2.4)
            for y in range(12, int(12 + d)):
                if 0 <= x < TW and g.g[y][x] in ('S', 't'):
                    g.px(x, y, 'A')
    # 옆머리
    g.ellipse(5.5, 15.0, 1.8, 4.5, 'A')
    g.ellipse(21.5, 15.0, 1.8, 4.5, 'A')
    # 눈
    for cx in (10.0, 17.0):
        g.ellipse(cx, 16.0, 2.4, 2.8, 'O')
        g.ellipse(cx, 16.2, 1.7, 2.0, 'W')
        g.ellipse(cx, 16.6, 1.1, 1.3, 'I')
        g.px(cx - 0.6, 15.6, 'W')
    # 입 & 볼
    g.rect(13, 20, 14, 20, 'M')
    g.ellipse(7.5, 19.0, 1.6, 1.0, 'k')
    g.ellipse(19.5, 19.0, 1.6, 1.0, 'k')
    g.outline()
    return g
