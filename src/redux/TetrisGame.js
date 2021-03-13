import { createSlice, createAction } from '@reduxjs/toolkit';
import * as GameModel from '../models/TetrisGame';
import { store } from './init';
import { lazifySlice } from './lazySlice';

const deleteGameActionType = 'reactris/delete';
const deleteGameActionFor = createAction(deleteGameActionType);

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

	// Enable using lazy state.
	lazifySlice(newSlice);

	return newSlice;
}

/**
 * Associates a game component with the Redux slice for the game instance.
 * This method is intended for use when the corresponding game component is mounted.
 * It should be paired with a call to <code>releaseSlice</code> when the game component is unmounted to have the slice removed.
 * @param {string} gameId Identifies the game instance (is empty string by default).
 */
export function attachSlice(gameId) {
	const slice = getSlice(gameId);
	const rc = slice.refCount || 0;
	slice.refCount = rc + 1;
	return slice;
}

/**
 * Releases a reference to the Redux slice for the specified game instance and removes the slice entirely when there are no components attached to it (<code>attachSlice</code>).
 * @param {string} gameId The game ID, by default the empty string.
 */
export function detachSlice(gameId = "") {
	if (slices.has(gameId)) {
		const slice = slices.get(gameId);
		const rc = slice.refCount;
		if (rc > 0) {
			slice.refCount = rc - 1;
			if (rc === 1) {
				slices.delete(gameId);
				// Discarding the slice does not dispose of the data in the state, so we need this action.
				store.dispatch(deleteGameActionFor(gameId));
			}
		}
		console.error(`releaseSlice for game '${gameId}' with refCount ${rc}'`);
	}
	// TODO: Limit this to debug builds.
	console.error(`releaseSlice non-existing game (${gameId})`);
}

/**
 * Updates the game states.
 * @param {object} state Redux store state containing states from all game instances.
 * @param {*} action The action to perform.
 */
export function reducer(state = {}, action) {
	if (action.type === deleteGameActionType) {
		const gameId = action.payload;
		const sliceName = getSliceName(gameId);
		if (state[sliceName]) {
			let newState = { ...state };
			delete newState[sliceName];
			return newState;
		}
	}
	else if (action.type.startsWith("reactris")) {
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