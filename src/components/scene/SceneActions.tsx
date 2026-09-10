import { useEffect, useState } from 'react';
import { useGame, useUi } from '../../hooks/useGame';
import { actions } from '../../game/store';
import { boostReady, dailyAvailable } from '../../game/engine';
import { BOOST_COOLDOWN_SEC, BOOST_UNLOCK_LEVEL } from '../../game/constants';
import { formatDurationShort } from '../../game/format';
import { Icon } from '../ui/Icon';

/** 씬 위에 겹치는 즉시 실행 버튼 (음소거 / 부스트 / 출석 보상) */
export function SceneActions() {
  const level = useGame((s) => s.level);
  const boostAt = useGame((s) => s.boostReadyAt);
  const state = useGame((s) => s);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const boostUnlocked = level >= BOOST_UNLOCK_LEVEL;
  const ready = boostReady(state, now);
  const remain = Math.max(0, (boostAt - now) / 1000);
  const cooldownRatio = ready ? 0 : remain / BOOST_COOLDOWN_SEC;
  const daily = dailyAvailable(state, now);
  const music = useGame((s) => s.settings.music);

  return (
    <div className="absolute right-2 top-2 z-10 flex gap-1.5">
      {/*
        음소거는 설정 안에만 두면 안 된다. 인스타에서 링크를 눌러 들어온 사람이
        조용한 곳에 있을 수도 있는데, 그때 소리를 끄려고 탭을 옮겨 다니게 하면
        그냥 창을 닫는다. 한 번에 끌 수 있는 자리에 둔다.
      */}
      <button
        type="button"
        onClick={() => actions.updateSettings({ music: !music })}
        aria-label={music ? '배경음악 끄기' : '배경음악 켜기'}
        title={music ? '배경음악 끄기' : '배경음악 켜기'}
        aria-pressed={music}
        className={`btn h-11 w-11 rounded-xl md:h-12 md:w-12 ${music ? 'panel-glass text-ink' : 'panel-glass text-ink-muted'}`}
      >
        <Icon name={music ? 'sound-on' : 'sound-off'} size={18} strokeWidth={2} />
      </button>
      {boostUnlocked && (
        <button
          type="button"
          data-tut="boost-btn"
          onClick={() => actions.useBoost()}
          disabled={!ready}
          aria-label={ready ? '커피 부스트 사용' : '커피 부스트 재사용 대기 중'}
          title={ready ? '커피 부스트: 60초 동안 수익 2배' : `${formatDurationShort(remain)} 후 사용 가능`}
          className={`btn relative h-11 w-11 overflow-hidden rounded-xl text-lg md:h-12 md:w-12 ${
            ready ? 'btn-gold' : 'panel-glass text-ink-muted'
          }`}
        >
          <span className={ready ? 'anim-bob' : ''}>☕</span>
          {!ready && (
            <>
              <span className="absolute inset-x-0 bottom-0 bg-[#5b9dff]/25" style={{ height: `${cooldownRatio * 100}%` }} />
              <span className="tnum absolute inset-x-0 bottom-0.5 text-center text-[9px] font-black text-ink-soft">
                {Math.ceil(remain)}
              </span>
            </>
          )}
        </button>
      )}
      <button
        type="button"
        data-tut="daily-btn"
        onClick={() => actions.openDaily()}
        aria-label="일일 출석 보상"
        title="일일 출석 보상"
        className={`btn relative h-11 w-11 rounded-xl text-lg md:h-12 md:w-12 ${
          daily ? 'btn-go' : 'panel-glass text-ink-muted'
        }`}
      >
        <span className={daily ? 'anim-bob' : ''}>🎁</span>
        {daily && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_8px_rgba(255,122,89,0.9)]" />}
      </button>
    </div>
  );
}

/** 방 안에 잠깐 나타나는 황금 버그 */
export function GoldenBugOverlay() {
  const golden = useUi((u) => u.golden);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!golden) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [golden]);
  if (!golden) return null;

  const left = Math.max(0, (golden.expiresAt - now) / 1000);
  const fading = left < 2.5;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); actions.catchGolden(); }}
      aria-label="황금 버그 잡기"
      className={`anim-pop absolute z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${fading ? 'anim-blink' : ''}`}
      style={{ left: `${golden.x}%`, top: `${golden.y}%` }}
    >
      <span className="absolute inset-0 rounded-full bg-[#ffd06a]/35 blur-md anim-pulse-glow" />
      <span className="anim-wobble relative text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">🪲</span>
      <span className="absolute -bottom-1 rounded bg-navy-deep/80 px-1 text-[9px] font-black text-[#ffd06a]">
        {Math.ceil(left)}
      </span>
    </button>
  );
}
