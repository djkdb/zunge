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
