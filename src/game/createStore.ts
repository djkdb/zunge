import { useSyncExternalStore } from 'react';

export interface Store<T> {
  get: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (updater) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(state) : updater;
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** 선택자가 반환하는 값이 바뀔 때만 리렌더링 */
export function useStore<T, R>(store: Store<T>, selector: (s: T) => R): R {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()), () => selector(store.get()));
}
