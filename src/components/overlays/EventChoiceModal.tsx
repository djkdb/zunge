import { useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import type { EventChoiceDef } from '../../game/types';
import { Modal } from '../ui/Modal';
import { Icon, type IconName } from '../ui/Icon';
import { ZunPortrait } from '../scene/ZunSprite';

const TONE_COLOR: Record<EventChoiceDef['tone'], string> = {
  good: '#5ee596',
  bad: '#ff8aa1',
  neutral: '#8ab8ff',
};

/**
 * 선택형 이벤트 창.
 * 닫으면 safe 로 표시된 선택지가 대신 적용된다 — 그냥 넘겨서 이득을 보는 길은 없다.
 */
export function EventChoiceModal() {
  const def = useUi((u) => u.eventChoice);
  if (!def?.choices?.length) return null;

  const safe = def.choices.find((c) => c.safe) ?? def.choices[def.choices.length - 1];

  return (
    <Modal open onClose={() => actions.resolveEventChoice(safe.id)} className="max-w-lg">
      <div className="card max-h-[88vh] overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <ZunPortrait pose={def.tone === 'bad' ? 'debugging' : 'idea'} height={56} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9a6ff]">선택의 순간</div>
            <h3 className="truncate text-base font-black">{def.icon} {def.title}</h3>
            <p className="text-[11px] leading-snug text-ink-soft">{def.message}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {def.choices.map((c) => {
            const color = TONE_COLOR[c.tone];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => actions.resolveEventChoice(c.id)}
                className="btn-press card-2 flex w-full items-center gap-2.5 p-3 text-left hover:bg-[#223059]"
                style={{ borderColor: `${color}44` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}1f`, color }}
                >
                  <Icon name={c.icon as IconName} size={18} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-black">{c.label}</span>
                    {c.gamble && (
                      <span className="shrink-0 rounded-md bg-gold-soft px-1.5 py-px text-[9px] font-black text-[#ffd06a]">
                        성공 {Math.round(c.gamble.chance * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{c.detail}</p>
                </div>
                <Icon name="chevron-right" size={14} className="shrink-0 text-ink-muted" />
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-center text-[10px] font-bold text-ink-muted">
          창을 닫으면 &lsquo;{safe.label}&rsquo;(으)로 처리됩니다
        </p>
      </div>
    </Modal>
  );
}
