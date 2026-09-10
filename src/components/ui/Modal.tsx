import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  dim?: string;
}

export function Modal({ open, onClose, children, className = '', dim = 'bg-navy-deep/75' }: Props) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={`safe-pad fixed inset-0 z-50 flex items-center justify-center anim-fade ${dim} backdrop-blur-[3px]`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={`anim-pop w-full max-w-md ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
