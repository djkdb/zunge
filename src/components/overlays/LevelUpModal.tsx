import { useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { levelTitle, LEVEL_TITLES } from '../../game/data/levels';
import { PROJECTS } from '../../game/data/projects';
import { AI_TIERS } from '../../game/data/ai';
import { STAGES } from '../../game/data/stages';
import { UPGRADES } from '../../game/data/upgrades';
import { PETS } from '../../game/data/pets';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ZunSprite } from '../scene/ZunSprite';
import { Confetti } from './Confetti';
import { Badge } from '../ui/Badge';

export function LevelUpModal() {
  const level = useUi((u) => u.levelUpTo);
  if (!level) return null;
  const unlocks: { icon: string; label: string }[] = [];
  PROJECTS.filter((p) => p.requiredLevel === level).forEach((p) => unlocks.push({ icon: p.icon, label: `${p.name} 프로젝트` }));
  AI_TIERS.filter((t) => t.requiredLevel === level).forEach((t) => unlocks.push({ icon: t.icon, label: `${t.name} 구매 가능` }));
  STAGES.filter((s) => s.requiredLevel === level).forEach((s) => unlocks.push({ icon: s.icon, label: `${s.name} 이사 가능` }));
  UPGRADES.filter((u) => u.requiredLevel === level).forEach((u) => unlocks.push({ icon: u.icon, label: `${u.name} 업그레이드` }));
  PETS.filter((p) => p.requiredLevel === level).forEach((p) => unlocks.push({ icon: p.icon, label: `${p.name} 합류!` }));
  const newTitle = LEVEL_TITLES.find((t) => t.level === level);

  return (
    <Modal open onClose={() => actions.closeLevelUp()}>
      <div className="card relative overflow-hidden p-5 text-center">
        <Confetti />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gold/20 to-transparent" />
        <div className="relative">
          <div className="text-pixel text-[11px] tracking-[0.25em] text-[#ffd06a]">LEVEL UP!</div>
          <div className="mt-1 text-4xl font-black">
            <span className="shimmer-text">Lv.{level}</span>
          </div>
          <div className="mt-0.5 text-sm font-bold text-ink-soft">{levelTitle(level)}</div>
          {newTitle && <Badge tone="gold" className="mt-1">🎖️ 새 타이틀: {newTitle.title}</Badge>}
          <div className="my-3 flex justify-center"><ZunSprite mood="confident" scale={2} /></div>
          {unlocks.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-ink-muted">새로 해금됨</div>
              {unlocks.map((u, i) => (
                <div key={i} className="anim-slide-up flex items-center gap-2 rounded-xl bg-bg-2 px-3 py-2 text-left text-xs font-bold" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-lg">{u.icon}</span>
                  <span>{u.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-bg-2 px-3 py-2 text-xs font-bold text-ink-soft">개발 속도 +2% · 계속 성장 중!</div>
          )}
          <Button block variant="gold" size="lg" className="mt-4" onClick={() => actions.closeLevelUp()}>확인</Button>
        </div>
      </div>
    </Modal>
  );
}
