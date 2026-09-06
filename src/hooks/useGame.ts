import { derivedStore, gameStore, uiStore, type UiState } from '../game/store';
import { useStore } from '../game/createStore';
import type { Derived, GameState } from '../game/types';

export function useGame<R>(selector: (s: GameState) => R): R {
  return useStore(gameStore, selector);
}

export function useUi<R>(selector: (s: UiState) => R): R {
  return useStore(uiStore, selector);
}

/** 파생 스탯 (초당 수익, 개발 속도 등) */
export function useDerived(): Derived;
export function useDerived<R>(selector: (d: Derived) => R): R;
export function useDerived<R>(selector?: (d: Derived) => R): R | Derived {
  const sel = (selector ?? ((d: Derived) => d)) as (d: Derived) => R | Derived;
  return useStore(derivedStore, sel);
}
