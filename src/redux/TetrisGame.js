import { createSlice } from '@reduxjs/toolkit';
import * as GameModel from '../models/TetrisGame';

/**
 * Holds the slice specs for all game instances.
 */
const slices = new Map();

function getSliceName(gameId = "") { return `reactris-${gameId}`; }

/**
 * Creates or retrieves the Redux slice associated with a specific game instance, identified by its ID.
  * @param {string} gameId The game ID, by default the empty string.
  * @returns The Redux store slice for the specified game.
 */
export function getSlice(gameId = "") {
	if (slices.has(gameId)) {
		return slices.get(gameId);
	}
	// Spawn a new slice.
	const newSlice = createSlice({
		name: getSliceName(gameId),
		initialState: GameModel.create(gameId), // NOTE: The actual game board is initialized by an action later.
		reducers: {
			createBoard: (state, {payload: {nrRows, nrCols}}) => GameModel.createBoard(state, nrRows, nrCols),
			startGame: GameModel.startGame,
			stopGame: GameModel.stopGame,
			moveLeft: GameModel.moveLeft,
			moveRight: GameModel.moveRight,
			rotateLeft: GameModel.rotateLeft,
			rotateRight: GameModel.rotateRight,
			advance: GameModel.advance,
			cheat: GameModel.cheat,
			setFastDrop: (state, action) => GameModel.setFastDrop(state, action.payload)
		}
	});
	slices.set(gameId, newSlice);
	return newSlice;
}

/**
 * Updates the game identified by the ID that is embedded in the action type.
 * @param {object} state Redux store state containing states from all game instances.
 * @param {*} action The action to perform.
 */
export function reducer(state = {}, action) {
	if (action.type.startsWith("reactris")) {
		const [sliceName] = action.type.split('/', 1);
		const gameId = sliceName.split('-', 2)[1];
		// Delegate to the reducer function of the slice handling the specified game instance.
		if (slices.has(gameId)) {
			const s = slices.get(gameId);
			const oldState = state[sliceName];
			const newState = s.reducer(oldState, action);
			if (newState !== oldState) {
				return {
					...state,
					[sliceName]: newState
				};
			}
		}
	}
	return state;
}