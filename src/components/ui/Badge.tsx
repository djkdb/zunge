import type { ReactNode } from 'react';

type Tone = 'primary' | 'mint' | 'coral' | 'gold' | 'violet' | 'rose' | 'slate';
const TONES: Record<Tone, string> = {
  primary: 'bg-primary-soft text-[#8ab8ff]',
  mint: 'bg-mint-soft text-[#5ee596]',
  coral: 'bg-coral-soft text-[#ffa48c]',
  gold: 'bg-gold-soft text-[#ffd06a]',
  violet: 'bg-violet-soft text-[#b9a6ff]',
  rose: 'bg-rose-soft text-[#ff8aa1]',
  slate: 'bg-white/8 text-ink-soft',
};

export function Badge({ tone = 'slate', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
