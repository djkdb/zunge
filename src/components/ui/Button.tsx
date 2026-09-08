import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * 역할이 있을 때만 색을 쓴다.
 * - accent: 화면에서 지금 눌러야 할 단 하나의 행동
 * - go: 개발 시작처럼 "진행"을 뜻하는 행동
 * - gold: 보상 수령
 * - neutral: 나머지 전부 (기본값)
 */
type Variant = 'neutral' | 'accent' | 'go' | 'gold' | 'danger' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  /** 오른쪽에 붙는 값(가격 등). 라벨보다 한 단계 약하게 그려진다. */
  sub?: ReactNode;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  neutral: '',
  accent: 'btn-accent',
  go: 'btn-go',
  gold: 'btn-gold',
  danger: 'btn-danger',
  quiet: 'btn-quiet',
};

const SIZES: Record<Size, string> = {
  sm: 'text-[12px] px-2.5 py-1.5 min-h-[32px] rounded-[0.55rem]',
  md: 'text-[13px] px-3.5 py-2 min-h-[40px]',
  lg: 'text-[15px] px-5 py-2.5 min-h-[48px] rounded-[0.85rem]',
};

export function Button({
  variant = 'neutral',
  size = 'md',
  block,
  sub,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`btn ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
    >
      <span className="truncate">{children}</span>
      {sub !== undefined && <span className="btn-value">{sub}</span>}
    </button>
  );
}
