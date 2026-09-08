# ZUN: AI 개발자 키우기

작은 자취방에서 시작한 대학생 개발자 **ZUN**이 AI와 바이브코딩으로 서비스를 만들고,
사용자와 수익을 모아 AI 컴퍼니로 성장하는 **방치형 / 타이쿤 게임**입니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 타입 체크 + 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
```

## 게임 루프

프로젝트 선택 → 개발 (AI 보조) → 출시 → 사용자/수익 증가 → 업그레이드 → 더 큰 프로젝트 → 공간 확장

- **프로젝트 19종** (입문 → 중급 → 고급 → 최종), 완성 후 버전 업으로 반복 성장
- **AI 6단계**: 기본 AI → AI Assistant → AI Coding → AI Agent → Multi-Agent → Autonomous Developer
- **업그레이드 6종**: PC, 모니터(동시 개발), 인터넷, 서버(최대 사용자), 자동화(오프라인 효율), 팀원 — x1 / x10 / MAX 대량 구매
- **공간 5단계**: 자취방 → 개발자 방 → AI LAB → STARTUP OFFICE → AI COMPANY
- **레벨/타이틀**, **랜덤 이벤트 12종**, **펫 6종**, **오프라인 보상**(기본 8시간, 자동화로 확장)
- localStorage 자동 저장(5초), 내보내기/가져오기, 초기화

## 방치형 편의 기능

- **튜토리얼**: 첫 실행 시 5단계 온보딩. 이후 업그레이드·AI·공간 확장·이벤트·버그·부스트·출석·황금 버그·자동 개발·리부트가
  해금될 때마다 해당 UI를 스포트라이트로 강조하며 설명한다. 설정에서 언제든 다시 볼 수 있다.
- **리부트(프레스티지)**: 레벨 20 + 이번 회차 누적 100억원부터 해금. 회차 수익을 인사이트로 환산해 초기화하고,
  인사이트 1개당 수익 +3% · 개발 속도 +1.2%가 영구히 붙는다.
- **업적 26종**: 달성 시 즉시 보너스 자금 + 영구 수익 +1%.
- **일일 출석 보상**: 하루 한 번, 최대 7일 연속까지 보상이 커진다.
- **커피 부스트**: 5분 쿨다운으로 60초 동안 수익 2배.
- **황금 버그**: 방 안에 잠깐 나타나는 보너스. 사라지기 전에 탭하면 초당 수익 3분치를 받는다.
- **자동 개발**: 레벨 16 해금. 빈 슬롯에 가장 비싼 프로젝트를 알아서 착수한다.

## 구조

```
src/
  game/            게임 로직 (UI와 분리)
    types.ts       상태/데이터 타입
    constants.ts   밸런스 상수
    data/          프로젝트·업그레이드·AI·공간·레벨·이벤트·펫·업적·튜토리얼 정의
    calc.ts        파생 스탯 계산 (수익, 개발 속도, 비용 등)
    engine.ts      틱 시뮬레이션 & 액션 (순수 함수)
    offline.ts     오프라인 진행 시뮬레이션
    save.ts        저장/검증/내보내기/가져오기
    store.ts       외부 스토어 + 게임 루프 + 신호 처리(연출/로그/효과음)
    audio.ts       WebAudio 효과음
  components/
    scene/         픽셀 아트 씬 (ZUN, AI 로봇, 펫, 5단계 공간)
    panels/        홈·프로젝트·업그레이드·AI·성장(리부트/업적/통계)·설정
    overlays/      토스트, 오프라인 보상, 레벨업, 공간 이동 연출, 튜토리얼, 출석 보상, 리부트 결과
    layout/, ui/   상단바, 네비게이션, 공용 UI
```

기술 스택: React 19 · TypeScript · Vite 7 · Tailwind CSS 4 (추가 런타임 의존성 없음)

## Cloudflare 배포

**방법 A — Cloudflare Pages (Git 연동, 푸시할 때마다 자동 배포)**
1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git → 이 저장소 선택
2. 빌드 설정: Framework preset `Vite`, Build command `npm run build`, Build output directory `dist`
3. Save and Deploy → `https://<프로젝트명>.pages.dev` 에서 바로 플레이

**방법 B — Wrangler CLI (Workers 정적 에셋)**
```bash
npx wrangler login     # 최초 1회, 브라우저에서 Cloudflare 로그인
npm run deploy         # 빌드 후 배포 → https://zun-ai-developer-tycoon.<계정>.workers.dev
```

## ZUN 캐릭터 이미지 넣기

게임의 ZUN은 `public/characters/zun/01.png` ~ `32.png` 이미지를 그대로 렌더링한다.
레퍼런스 스프라이트 시트(8열 x 4행 = 32포즈)가 있으면 한 줄로 준비된다.

```bash
# 레퍼런스 시트를 저장소 루트에 zun-sheet.png 로 저장한 뒤
npm run extract-zun
npm run dev
```

경로를 직접 주려면 `npm run extract-zun -- <경로>`.
스크립트는 `zun-sheet.png`, `public/zun-sheet.png`, `~/Downloads/zun-sheet.png` 등을 자동으로 찾는다.
실행이 끝나면 32개 PNG를 전수 검사해 "캐릭터 1명 + 배경 alpha 0" 을 확인하고,
하나라도 실패하면 조정 옵션을 안내하며 종료 코드 1로 끝난다.

`tools/zun-sheet/extract.py` 가 하는 일:

1. 투명 체크무늬(또는 단색) 배경을 테두리에서 flood fill 로 제거해 실제 alpha 로 바꾼다.
   캐릭터 안쪽의 흰색(신발 · 얼굴)은 어두운 아웃라인에 둘러싸여 있어 지워지지 않는다.
2. 가장자리에 남는 밝은 halo 를 한 번 더 걷어낸다.
3. 칸마다 좌상단의 번호 라벨을 지운다.
4. 캐릭터의 실제 경계 상자로 잘라 `01.png` ~ `32.png` 로 저장한다.
5. 포즈별 치수를 `src/game/data/zunPoseMeta.json` 에 기록해, 게임이 원본 비율을 유지한 채
   발 기준으로 배치할 수 있게 한다.

조정이 필요하면:

```bash
python3 tools/zun-sheet/extract.py <시트> --sat-max 0.2 --val-min 0.65   # 배경 판정 완화
python3 tools/zun-sheet/extract.py <시트> --halo 2                       # halo 를 더 벗겨냄
python3 tools/zun-sheet/extract.py <시트> --label-h 0.16                 # 번호 라벨이 남을 때
```

이미지가 없으면 폴백 픽셀 스프라이트(`zunFallbackSprite.ts`)로 자동 전환되므로
파일을 넣기 전에도 게임은 정상 동작한다.

### 포즈와 게임 상태 연결

`src/game/data/zunPoses.ts` 한곳에서 관리한다.

| 게임 상태 | 포즈 | 칸 |
| --- | --- | --- |
| 개발 중 | code | 22 |
| 버그 수정 중 | debugging | 29 |
| 평상시 | idle | 01 |
| 집중 | code | 22 |
| 프로젝트 출시 · 이벤트 성공 | celebration | 14 |
| 이벤트 · 아이디어 | idea | 06 |
| 레벨업 · 리부트 | thumbsup | 31 |
| 자금 부족 · 오류 | debugging | 29 |
| 멘붕 | tired | 15 |
| 오프라인 보상 | sleeping | 26 |
| 튜토리얼 안내 | idea | 06 |

방 안에서는 책상이 허리 아래를 가리므로, 책상 · 노트북이 함께 그려진 칸
(02 · 05 · 08 · 11 · 17 · 24 · 32)은 쓰지 않는다. 그 칸들은 책상이 없는
모달 · 튜토리얼 화면에서 쓴다 (`FULL_POSE`).

