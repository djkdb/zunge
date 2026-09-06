import type { ProjectDef } from '../types';

export const PROJECTS: ProjectDef[] = [
  // ───── Tier 1: 입문 ─────
  { id: 'todo', name: 'TODO 앱', icon: '📝', tier: 1, description: '모든 개발자의 첫 프로젝트. 할 일을 적고 지운다.', cost: 0, devTime: 8, income: 12, users: 10, xp: 60, risk: 0, requiredLevel: 1, requiredAi: 1 },
  { id: 'calc', name: '계산기', icon: '🧮', tier: 1, description: '더하고 빼고 곱하고 나눈다. 가끔 0으로 나누면 터진다.', cost: 375, devTime: 12, income: 25, users: 25, xp: 80, risk: 0.03, requiredLevel: 1, requiredAi: 1 },
  { id: 'timer', name: '공부 타이머', icon: '⏱️', tier: 1, description: '뽀모도로 타이머. 정작 개발하느라 공부는 안 한다.', cost: 1100, devTime: 18, income: 55, users: 60, xp: 110, risk: 0.05, requiredLevel: 2, requiredAi: 1 },
  { id: 'memo', name: '메모 앱', icon: '🗒️', tier: 1, description: '마크다운 지원 메모장. 노션을 꿈꾼다.', cost: 3000, devTime: 25, income: 120, users: 140, xp: 150, risk: 0.06, requiredLevel: 3, requiredAi: 1 },
  { id: 'weather', name: '날씨 앱', icon: '🌤️', tier: 1, description: '외부 API를 처음 연동해본다. 키를 깃허브에 올리지 말자.', cost: 9100, devTime: 35, income: 260, users: 320, xp: 200, risk: 0.08, requiredLevel: 4, requiredAi: 1 },

  // ───── Tier 2: 중급 ─────
  { id: 'aistudy', name: 'AI 공부 도구', icon: '📚', tier: 2, description: 'AI가 문제를 내고 채점한다. 사용자가 진짜로 늘기 시작한다.', cost: 54000, devTime: 90, income: 900, users: 900, xp: 420, risk: 0.1, requiredLevel: 5, requiredAi: 2 },
  { id: 'movie', name: '영화 추천 서비스', icon: '🎬', tier: 2, description: '취향을 학습해 영화를 추천한다. 오늘 밤 뭐 보지?', cost: 157000, devTime: 126, income: 2100, users: 2000, xp: 600, risk: 0.12, requiredLevel: 7, requiredAi: 2 },
  { id: 'travel', name: '여행 플래너', icon: '🧳', tier: 2, description: '일정, 예산, 맛집까지 AI가 짜준다.', cost: 456000, devTime: 162, income: 4800, users: 4500, xp: 850, risk: 0.14, requiredLevel: 9, requiredAi: 2 },
  { id: 'automation', name: '자동화 도구', icon: '⚙️', tier: 2, description: '반복 업무를 자동화한다. 사람들이 돈을 내기 시작한다.', cost: 1320000, devTime: 216, income: 11000, users: 9000, xp: 1200, risk: 0.15, requiredLevel: 11, requiredAi: 3 },
  { id: 'chatbot', name: 'AI 챗봇', icon: '💬', tier: 2, description: '24시간 대답하는 챗봇. 가끔 헛소리를 한다.', cost: 3900000, devTime: 270, income: 26000, users: 20000, xp: 1600, risk: 0.16, requiredLevel: 13, requiredAi: 3 },

  // ───── Tier 3: 고급 ─────
  { id: 'agent', name: 'AI Agent', icon: '🤖', tier: 3, description: '스스로 계획하고 실행하는 에이전트. 진짜 게임이 시작된다.', cost: 25500000, devTime: 600, income: 85000, users: 60000, xp: 3500, risk: 0.18, requiredLevel: 15, requiredAi: 4 },
  { id: 'saas', name: '자동화 SaaS', icon: '☁️', tier: 3, description: '구독형 자동화 플랫폼. 월 매출이라는 단어가 생겼다.', cost: 92000000, devTime: 780, income: 230000, users: 150000, xp: 5500, risk: 0.2, requiredLevel: 18, requiredAi: 4 },
  { id: 'devtool', name: '개발자 생산성 서비스', icon: '🛠️', tier: 3, description: '개발자를 위한 AI 도구. 개발자가 개발자를 위해 만든다.', cost: 300000000, devTime: 960, income: 600000, users: 350000, xp: 8000, risk: 0.22, requiredLevel: 21, requiredAi: 4 },
  { id: 'aiplatform', name: 'AI 플랫폼', icon: '🧠', tier: 3, description: '누구나 AI 앱을 만들 수 있는 플랫폼.', cost: 960000000, devTime: 1140, income: 1600000, users: 900000, xp: 12000, risk: 0.24, requiredLevel: 24, requiredAi: 5 },
  { id: 'bigsaas', name: '대규모 SaaS', icon: '🏢', tier: 3, description: '기업 고객이 줄을 선다. 서버 비용도 줄을 선다.', cost: 2940000000, devTime: 1320, income: 4200000, users: 2200000, xp: 17000, risk: 0.25, requiredLevel: 27, requiredAi: 5 },

  // ───── Tier 4: 최종 ─────
  { id: 'startup', name: 'AI Startup', icon: '🚀', tier: 4, description: '투자를 받고 팀을 꾸린다. ZUN은 이제 파운더다.', cost: 15600000000, devTime: 2080, income: 13000000, users: 6000000, xp: 32000, risk: 0.26, requiredLevel: 30, requiredAi: 5 },
  { id: 'globalsaas', name: 'Global SaaS', icon: '🌏', tier: 4, description: '전 세계 사용자가 쓰는 서비스. 시차 때문에 장애는 항상 새벽에 난다.', cost: 75600000000, devTime: 2600, income: 42000000, users: 20000000, xp: 55000, risk: 0.28, requiredLevel: 36, requiredAi: 6 },
  { id: 'agiplatform', name: 'AI Platform (Global)', icon: '🛰️', tier: 4, description: '세계 최대 AI 플랫폼. 모든 에이전트가 여기서 태어난다.', cost: 350000000000, devTime: 3120, income: 140000000, users: 70000000, xp: 90000, risk: 0.3, requiredLevel: 42, requiredAi: 6 },
  { id: 'agilab', name: 'AGI Lab', icon: '✨', tier: 4, description: '범용 인공지능 연구소. 작은 자취방에서 여기까지 왔다.', cost: 1800000000000, devTime: 3600, income: 500000000, users: 250000000, xp: 150000, risk: 0.32, requiredLevel: 50, requiredAi: 6 },
];

export const PROJECT_MAP: Record<string, ProjectDef> = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

export const TIER_LABEL: Record<number, string> = { 1: '입문', 2: '중급', 3: '고급', 4: '최종' };
