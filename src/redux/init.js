import { createSlice, configureStore } from '@reduxjs/toolkit';
import * as TetrisGame from '../models/TetrisGame';

// NOTE: Partitioning for multiple games looks like the work for a Redux middleware...

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
 * Setups Redux slices named after the provided game IDs.
 * @param {string[]?} gameIds The IDs of the games. When not specified, only one game will be created with and empty string ID.
 */
export function setupRedux(gameIds) {
	const singleGame = gameIds === undefined || gameIds === null;
	if (singleGame) gameIds = [""];

	for(let gameId of gameIds) {
		slices.set(gameId, createSlice({
			name: `reactris-${gameId}`,
			initialState: TetrisGame.create(gameId),
			reducers: {
				startGame: TetrisGame.startGame,
				stopGame: TetrisGame.stopGame,
				moveLeft: TetrisGame.moveLeft,
				moveRight: TetrisGame.moveRight,
				rotateLeft: TetrisGame.rotateLeft,
				rotateRight: TetrisGame.rotateRight,
				advance: TetrisGame.advance,
				cheat: TetrisGame.cheat,
				setFastDrop: (state, action) => TetrisGame.setFastDrop(state, action.payload)
			}
		}));
	}

	const sliceReducers = {};
	for (const {name, reducer} of slices.values()) {
		sliceReducers[name] = reducer;
	}

	store = configureStore({reducer: sliceReducers});
}