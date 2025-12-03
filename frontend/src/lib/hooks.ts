import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

/**
 * Typed version of `useDispatch` hook.
 * Use this throughout the app instead of plain `useDispatch`.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Typed version of `useSelector` hook.
 * Use this throughout the app instead of plain `useSelector`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Typed version of `useStore` hook.
 * Use this throughout the app instead of plain `useStore`.
 */
export const useAppStore: () => AppStore = useStore;