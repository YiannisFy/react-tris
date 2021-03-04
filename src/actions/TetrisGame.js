import { bindActionCreators } from '@reduxjs/toolkit';
import { store } from '../redux/init';
import { getSlice } from '../redux/TetrisGame';

/**
 * Holds the actions for each game.
 */
const gameActions = new Map();

export function getGameActions(gameId) {
	let actions;
	if (gameActions.has(gameId)) actions = gameActions.get(gameId);
	else {
		actions = bindActionCreators(getSlice(gameId).actions, store.dispatch);
		gameActions.set(gameId, actions);
	}
	return actions;
}
