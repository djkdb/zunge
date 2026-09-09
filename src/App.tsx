import { useEffect, useMemo, useState } from 'react';
import { bootGame, onTabRequest } from './game/store';
import { useDerived, useGame, useUi } from './hooks/useGame';
import { TopBar } from './components/layout/TopBar';
import { BottomNav, SideTabs, type Tab } from './components/layout/BottomNav';
import { SceneView } from './components/scene/SceneView';
import { HomePanel } from './components/panels/HomePanel';
import { ProjectsPanel } from './components/panels/ProjectsPanel';
import { UpgradesPanel } from './components/panels/UpgradesPanel';
import { AiPanel } from './components/panels/AiPanel';
import { GrowthPanel } from './components/panels/GrowthPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { Toasts } from './components/overlays/Toasts';
import { OfflineModal } from './components/overlays/OfflineModal';
import { LevelUpModal } from './components/overlays/LevelUpModal';
import { StageIntro } from './components/overlays/StageIntro';
import { TutorialOverlay } from './components/overlays/TutorialOverlay';
import { StrategyModal } from './components/overlays/StrategyModal';
import { EventChoiceModal } from './components/overlays/EventChoiceModal';
import { ConflictNotice } from './components/overlays/ConflictNotice';
import { InstallNudge } from './components/overlays/InstallNudge';
import { DailyBonusModal } from './components/overlays/DailyBonusModal';
import { PrestigeResultModal } from './components/overlays/PrestigeResultModal';
import { PROJECTS } from './game/data/projects';
import { UPGRADES, upgradeCost } from './game/data/upgrades';
import { AI_TIERS } from './game/data/ai';
import { STAGES } from './game/data/stages';
import { projectCost } from './game/calc';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const ready = useUi((u) => u.ready);
  const reduced = useGame((s) => s.settings.reducedMotion);

  useEffect(() => {
    bootGame();
  }, []);

  // 튜토리얼이 특정 탭으로 이동을 요청할 때 따라간다
  useEffect(() => {
    onTabRequest((t) => setTab(t as Tab));
    return () => onTabRequest(null);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reduced);
  }, [reduced]);

  const badges = useBadges();

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-bg">
        <div className="text-pixel text-xl text-white">LOADING<span className="anim-blink">_</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg bg-grid">
      <TopBar />
      <main className="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(0,1fr)_400px] md:gap-4 md:px-5 md:py-4 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* 왼쪽: 씬 (+ 데스크톱에서는 홈 패널) */}
        <section className="md:sticky md:top-[84px] md:self-start">
          <div className="overflow-hidden border-b border-line md:rounded-2xl md:border md:shadow-pop">
            <div className="md:hidden">
              <SceneView compact={tab !== 'home'} onGoProjects={() => setTab('projects')} />
            </div>
            <div className="hidden md:block">
              <SceneView desktop onGoProjects={() => setTab('projects')} />
            </div>
          </div>
          <div className="hidden md:mt-4 md:block">
            <HomePanel onTab={setTab} />
          </div>
        </section>

        {/* 오른쪽: 패널 */}
        <section className="px-3 pb-24 pt-3 md:px-0 md:pb-6 md:pt-0">
          <div className="mb-3">
            <SideTabs tab={tab === 'home' ? 'projects' : tab} onChange={setTab} badges={badges} />
          </div>
          <div key={tab} className="anim-fade">
            {tab === 'home' && (
              <>
                <div className="md:hidden"><HomePanel onTab={setTab} /></div>
                <div className="hidden md:block"><ProjectsPanel /></div>
              </>
            )}
            {tab === 'projects' && <ProjectsPanel />}
            {tab === 'upgrades' && <UpgradesPanel />}
            {tab === 'ai' && <AiPanel />}
            {tab === 'growth' && <GrowthPanel />}
            {tab === 'settings' && <SettingsPanel />}
          </div>
        </section>
      </main>
      <BottomNav tab={tab} onChange={setTab} badges={badges} />
      <Toasts />
      <OfflineModal />
      <LevelUpModal />
      <StageIntro />
      <DailyBonusModal />
      <PrestigeResultModal />
      <StrategyModal />
      <EventChoiceModal />
      <TutorialOverlay />
      <InstallNudge />
      <ConflictNotice />
    </div>
  );
}

/** 구매 가능한 항목이 있으면 탭에 점 표시 */
function useBadges(): Partial<Record<Tab, boolean>> {
  const money = useGame((s) => s.money);
  const level = useGame((s) => s.level);
  const ai = useGame((s) => s.aiTier);
  const stage = useGame((s) => s.stage);
  const upgrades = useGame((s) => s.upgrades);
  const projectLevels = useGame((s) => s.projectLevels);
  const activeDevs = useGame((s) => s.activeDevs);
  const costMult = useDerived((d) => d.costMult);
  const slots = useDerived((d) => d.slots);

  return useMemo(() => {
    const projects =
      activeDevs.length < slots &&
      PROJECTS.some((p) => level >= p.requiredLevel && ai >= p.requiredAi && !activeDevs.some((a) => a.projectId === p.id) && (projectLevels[p.id] ?? 0) === 0 && projectCost(p, 0, costMult) <= money);
    const upg = UPGRADES.some((u) => level >= u.requiredLevel && upgrades[u.id] < u.maxLevel && upgradeCost(u, upgrades[u.id]) <= money);
    const nextStage = STAGES.find((s) => s.stage === stage + 1);
    const stageOk = !!nextStage && level >= nextStage.requiredLevel && money >= nextStage.cost;
    const nextAi = AI_TIERS.find((t) => t.tier === ai + 1);
    const aiOk = !!nextAi && level >= nextAi.requiredLevel && money >= nextAi.cost;
    return { projects, upgrades: upg || stageOk, ai: aiOk };
  }, [money, level, ai, stage, upgrades, projectLevels, activeDevs, costMult, slots]);
}
