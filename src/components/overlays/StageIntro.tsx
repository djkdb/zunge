import { useEffect, useState } from 'react';
import { useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { stageDef } from '../../game/data/stages';
import { aiTier } from '../../game/data/ai';
import { unlockedPets } from '../../game/data/pets';
import { RoomScene } from '../scene/RoomScene';
import { Button } from '../ui/Button';
import { Confetti } from './Confetti';

/** 공간 이동 연출: 플래시 → 새 공간 공개 */
export function StageIntro() {
  const stage = useUi((u) => u.stageIntro);
  const aiT = useGame((s) => s.aiTier);
  const team = useGame((s) => s.upgrades.team);
  const level = useGame((s) => s.level);
  const [phase, setPhase] = useState<'flash' | 'reveal'>('flash');

  useEffect(() => {
    if (!stage) return;
    setPhase('flash');
    const t = setTimeout(() => setPhase('reveal'), 700);
    return () => clearTimeout(t);
  }, [stage]);

  if (!stage) return null;
  const def = stageDef(stage);
  const ai = aiTier(aiT);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-deep/90 p-4 backdrop-blur-sm">
      {phase === 'flash' && <div className="absolute inset-0 bg-white" style={{ animation: 'stage-flash 0.7s ease-out forwards' }} />}
      {phase === 'reveal' && (
        <div className="card anim-pop relative w-full max-w-lg overflow-hidden">
          <Confetti count={36} />
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <RoomScene stage={stage} mood="shock" typing={false} aiTier={aiT} aiColor={ai.color} teamCount={team} pets={unlockedPets(level).map((p) => p.id)} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card to-transparent p-4 pt-10">
              <div className="text-pixel text-[10px] tracking-[0.25em] text-[#8ab8ff]">STAGE {stage} UNLOCKED</div>
              <div className="text-2xl font-black">{def.icon} {def.name}</div>
            </div>
          </div>
          <div className="p-4 pt-2">
            <p className="text-xs text-ink-soft">{def.description}</p>
            <div className="mt-2 flex gap-2 text-[11px] font-bold">
              <span className="rounded-lg bg-mint-soft px-2 py-1 text-[#5ee596]">수익 x{def.incomeMult}</span>
              <span className="rounded-lg bg-primary-soft px-2 py-1 text-[#8ab8ff]">개발 속도 x{def.devSpeedMult}</span>
            </div>
            <Button block variant="gold" size="lg" className="mt-3" onClick={() => actions.closeStageIntro()}>새 공간에서 개발 시작!</Button>
          </div>
        </div>
      )}
    </div>
  );
}
