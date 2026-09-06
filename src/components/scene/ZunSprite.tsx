import { memo } from 'react';
import type { Mood } from '../../game/types';
import { PixelSprite } from './PixelSprite';
import { ZUN_PALETTE, zunRows } from './zunSprite';

interface Props {
  mood: Mood;
  typing?: boolean;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

const MOOD_ANIM: Record<Mood, string> = {
  idle: 'anim-bob',
  focus: '',
  happy: 'anim-bob',
  panic: 'anim-shake',
  shock: '',
  confident: 'anim-bob',
  meltdown: 'anim-wobble',
};

/** ZUN 캐릭터 (HTML 컨텍스트용) */
export const ZunSprite = memo(function ZunSprite({ mood, typing, scale = 4, className = '', style }: Props) {
  const anim = typing && mood === 'focus' ? 'anim-typing' : MOOD_ANIM[mood];
  return (
    <div className={`inline-block ${anim} ${className}`} style={{ ...style, transformOrigin: '50% 100%' }}>
      <PixelSprite rows={zunRows(mood)} palette={ZUN_PALETTE} scale={scale} />
    </div>
  );
});
