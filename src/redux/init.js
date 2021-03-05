import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './TetrisGame';

export let store;

/**
 * Setups the Redux store.
 */
export function setupRedux() {
	store = configureStore({reducer});
}