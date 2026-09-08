import { useUi } from '../../hooks/useGame';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { ZunPortrait } from '../scene/ZunSprite';

/**
 * 같은 저장본을 다른 탭이 이어받았을 때.
 *
 * 두 탭이 각자 저장하면 나중에 저장한 쪽이 상대의 진행을 덮어써 버린다.
 * 그래서 뒤늦게 알아챈 이 탭은 저장을 멈추고 물러난다.
 */
export function ConflictNotice() {
  const conflict = useUi((u) => u.conflict);
  if (!conflict) return null;

  return (
    <Modal open dim="bg-navy-deep/90">
      <div className="card p-5 text-center">
        <div className="flex justify-center">
          <ZunPortrait pose="thinking" height={72} />
        </div>
        <h3 className="mt-2 text-base font-black">다른 탭에서 게임이 열렸어요</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          같은 저장 데이터를 두 곳에서 쓰면 한쪽 진행이 사라집니다.
          <br />
          이 탭은 저장을 멈췄어요. 여기서 이어서 하려면 새로고침하세요.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-accent mt-4 w-full py-2.5 text-[14px]"
        >
          <Icon name="loop" size={15} strokeWidth={2} />
          새로고침하고 이어하기
        </button>
      </div>
    </Modal>
  );
}
