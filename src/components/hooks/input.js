import React from 'react';
import {getGameActions} from '../../actions/TetrisGame';
import { KeyBindings } from '../input/bindings';
import { onKeyDown, onKeyUp, onClick } from '../input/events';

// Event listener management.

/**
 * Controls input listeners.
 * @param {React.MutableRefObject<object>} gameDomRef Reference to the game root element (corresponding to "TetrisGame" component).
 * @param {string} gameId The game ID.
 * @param {object} bindings The key bindings (optional).
 */
export function useGameInput(gameDomRef, gameId, bindings = new KeyBindings()) {
	React.useEffect(() => {
		const gameDom = gameDomRef.current;
		const gameActions = getGameActions(gameId);
		const kd = evt => onKeyDown(evt, gameActions, bindings);
		const ku = evt => onKeyUp(evt, gameActions, bindings);
		const oc = evt => onClick(evt, gameActions);

		document.addEventListener('keydown', kd);
		document.addEventListener('keyup', ku);
		gameDom.addEventListener('click', oc);

		return () => {
			document.removeEventListener('keydown', kd);
			document.removeEventListener('keyup', ku);
			gameDom.removeEventListener('click', oc);
		};
	}, [gameId, gameDomRef]);
}
