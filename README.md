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
- **업그레이드 6종**: PC, 모니터(동시 개발), 인터넷, 서버(최대 사용자), 자동화(오프라인 효율), 팀원
- **공간 5단계**: 자취방 → 개발자 방 → AI LAB → STARTUP OFFICE → AI COMPANY
- **레벨/타이틀**, **랜덤 이벤트 12종**, **펫 6종**, **오프라인 보상**(기본 8시간, 자동화로 확장)
- localStorage 자동 저장(5초), 내보내기/가져오기, 초기화

## 구조

```
src/
  game/            게임 로직 (UI와 분리)
    types.ts       상태/데이터 타입
    constants.ts   밸런스 상수
    data/          프로젝트·업그레이드·AI·공간·레벨·이벤트·펫 정의
    calc.ts        파생 스탯 계산 (수익, 개발 속도, 비용 등)
    engine.ts      틱 시뮬레이션 & 액션 (순수 함수)
    offline.ts     오프라인 진행 시뮬레이션
    save.ts        저장/검증/내보내기/가져오기
    store.ts       외부 스토어 + 게임 루프 + 신호 처리(연출/로그/효과음)
    audio.ts       WebAudio 효과음
  components/
    scene/         픽셀 아트 씬 (ZUN, AI 로봇, 펫, 5단계 공간)
    panels/        홈·프로젝트·업그레이드·AI·통계·설정
    overlays/      토스트, 오프라인 보상, 레벨업, 공간 이동 연출
    layout/, ui/   상단바, 네비게이션, 공용 UI
```

기술 스택: React 19 · TypeScript · Vite 7 · Tailwind CSS 4 (추가 런타임 의존성 없음)
