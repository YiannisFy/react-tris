import { bindActionCreators } from '@reduxjs/toolkit';
import { store, getSliceForGame } from '../redux/init';

/**
 * Holds the actions for each game.
 */
const gameActions = new Map();

export function getGameActions(gameId) {
	let actions;
	if (gameActions.has(gameId)) actions = gameActions.get(gameId);
	else {
		actions = bindActionCreators(getSliceForGame(gameId).actions, store.dispatch);
		gameActions.set(gameId, actions);
	}
	return actions;
}
