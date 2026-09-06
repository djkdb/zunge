import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-[#4f8dff] to-[#2f6df0] text-white shadow-[0_6px_18px_-6px_rgba(59,130,246,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110',
  secondary: 'bg-card-2 text-ink border border-line-2 hover:bg-[#223059]',
  ghost: 'bg-transparent text-ink-soft hover:bg-white/5',
  success: 'bg-gradient-to-b from-[#34d36e] to-[#1aa64b] text-white shadow-[0_6px_18px_-6px_rgba(34,197,94,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110',
  danger: 'bg-gradient-to-b from-[#f4607c] to-[#d63a58] text-white hover:brightness-110',
  gold: 'bg-gradient-to-b from-[#ffcd4d] to-[#f08a1f] text-navy-deep shadow-[0_6px_18px_-6px_rgba(245,183,51,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[34px]',
  md: 'text-sm px-4 py-2.5 rounded-xl min-h-[42px]',
  lg: 'text-base px-5 py-3 rounded-2xl min-h-[50px]',
};

export function Button({ variant = 'primary', size = 'md', block, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`btn-press inline-flex items-center justify-center gap-1.5 font-bold whitespace-nowrap select-none disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
