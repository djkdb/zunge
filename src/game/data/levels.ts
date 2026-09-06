import type { LevelTitleDef } from '../types';

export const LEVEL_TITLES: LevelTitleDef[] = [
  { level: 1, title: '코딩 입문' },
  { level: 5, title: '대학생 개발자' },
  { level: 10, title: '바이브코더' },
  { level: 20, title: 'AI 개발자' },
  { level: 30, title: 'AI Engineer' },
  { level: 50, title: 'Startup Founder' },
  { level: 100, title: 'AI Pioneer' },
];

export function levelTitle(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) if (level >= t.level) title = t.title;
  return title;
}

export function nextLevelTitle(level: number): LevelTitleDef | null {
  return LEVEL_TITLES.find((t) => t.level > level) ?? null;
}
