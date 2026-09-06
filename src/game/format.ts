/** 한국어 단위 숫자 포맷 */

const UNITS: { value: number; label: string }[] = [
  { value: 1e16, label: '경' },
  { value: 1e12, label: '조' },
  { value: 1e8, label: '억' },
  { value: 1e4, label: '만' },
];

function compact(n: number, decimalsBelow = 100): string {
  if (!Number.isFinite(n)) return '∞';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs < 1e4) {
    return sign + Math.floor(abs).toLocaleString('ko-KR');
  }
  for (const u of UNITS) {
    if (abs >= u.value) {
      const v = abs / u.value;
      let str: string;
      if (v < 10) str = v.toFixed(2);
      else if (v < decimalsBelow) str = v.toFixed(1);
      else str = Math.floor(v).toLocaleString('ko-KR');
      // 불필요한 소수점 0 제거
      str = str.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
      return `${sign}${str}${u.label}`;
    }
  }
  return sign + Math.floor(abs).toLocaleString('ko-KR');
}

export function formatMoney(n: number): string {
  return `${compact(n)}원`;
}

export function formatMoneyShort(n: number): string {
  return `₩${compact(n)}`;
}

export function formatRate(n: number): string {
  if (n < 10) return `${n.toFixed(1)}원/s`;
  return `${compact(n)}원/s`;
}

export function formatUsers(n: number): string {
  return `${compact(n)}명`;
}

export function formatNumber(n: number): string {
  return compact(n);
}

export function formatPercent(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 10) return `${Math.max(0.1, seconds).toFixed(1)}초`;
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  if (m > 0) return sec > 0 ? `${m}분 ${sec}초` : `${m}분`;
  return `${sec}초`;
}

export function formatDurationShort(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
