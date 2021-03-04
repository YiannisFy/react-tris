import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './TetrisGame';

/**
 * Holds the store slices for all games.
 */
let slices = new Map();

/**
 * The Redux store.
 */
export let store;

export function getSliceForGame(gameId = "") {
	return slices.get(gameId);
}

/**
 * Setups the Redux store.
 */
export function setupRedux() {
	store = configureStore({reducer});
}