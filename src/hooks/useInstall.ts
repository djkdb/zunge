import { useCallback, useEffect, useState } from 'react';
import { detectPlatform, isStandalone, type InstallPromptEvent, type PlatformInfo } from '../game/platform';

/**
 * 브라우저가 설치 창을 띄울 수 있게 되면 그 이벤트를 붙잡아 둔다.
 * beforeinstallprompt 는 페이지가 뜬 직후 한 번만 오고, 이걸 놓치면
 * 나중에 "설치" 버튼을 눌러도 창을 띄울 방법이 없다.
 * 그래서 훅이 아니라 모듈 수준에서 미리 잡아 둔다.
 */
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

/** 설치 안내를 한 번 닫으면 다시 조르지 않는다 */
const DISMISS_KEY = 'zun-install-dismissed';

export function dismissInstallHint(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* 저장이 막혀 있어도 게임은 그대로 돌아간다 */
  }
  notify();
}

/** 설치 관련 상태가 바뀌면 알려준다 (넛지가 스스로를 거둬들이는 데 쓴다) */
export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function installHintDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export interface InstallState {
  platform: PlatformInfo;
  /** 브라우저가 설치 창을 지금 띄울 수 있는가 */
  canPrompt: boolean;
  /** 설치 창을 띄운다. 성공하면 true */
  promptInstall: () => Promise<boolean>;
}

export function useInstall(): InstallState {
  const [, bump] = useState(0);
  const [platform, setPlatform] = useState<PlatformInfo>(() => detectPlatform());

  useEffect(() => {
    const onChange = () => {
      bump((n) => n + 1);
      setPlatform(detectPlatform());
    };
    listeners.add(onChange);
    // 홈 화면에서 열면 display-mode 가 바뀐다
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', onChange);
    return () => {
      listeners.delete(onChange);
      mq.removeEventListener?.('change', onChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    const e = deferred;
    deferred = null;
    notify();
    try {
      await e.prompt();
      const { outcome } = await e.userChoice;
      if (outcome === 'accepted') setPlatform(detectPlatform());
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  return {
    platform: isStandalone() ? { ...platform, method: 'installed' } : platform,
    canPrompt: deferred !== null,
    promptInstall,
  };
}
