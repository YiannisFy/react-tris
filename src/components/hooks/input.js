import React from 'react';
import {getGameActions} from '../../actions/TetrisGame';

// Input event handlers.

function onClick(evt, gameActions) {
	gameActions.startGame();

	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

function onKeyUp(evt, gameActions) {
	let handled = true;
	switch(evt.key) {
		case 'ArrowDown':
			gameActions.setFastDrop(false);
			break;
		default:
			handled = false;
			break;
	}

	if (handled) {
		evt.preventDefault();
		evt.stopPropagation();
	}
	return !handled;
}

function onKeyDown(evt, gameActions) {
	let handled = true;
	switch (evt.key) {
		case 'Escape':
			gameActions.stopGame();
			break;
		case 'ArrowUp':
			// We handle this to avoid having the page scroll up while playing.
			break;
		case 'ArrowDown':
			gameActions.setFastDrop(true);
			break;
		case 'ArrowLeft':
			gameActions.moveLeft();
			break;
		case 'ArrowRight':
			gameActions.moveRight();
			break;
		case 'Z':
		case 'z':
			gameActions.rotateLeft();
			break;
		case 'X':
		case 'x':
			gameActions.rotateRight();
			break;
		case 'A':
		case 'a':
			gameActions.cheat();
			break;
		case ' ':
			gameActions.startGame();
			break;
		default: handled = false;
	}

	if (handled) {
		evt.preventDefault();
		evt.stopPropagation();
	}
	return !handled;
}

// Event listener management.

/**
 * Controls input listeners.
 * @param {React.MutableRefObject<object>} gameDomRef Reference to the game root element (corresponding to "TetrisGame" component).
 * @param {string} gameId The game ID.
 */
export function useGameInput(gameDomRef, gameId) {
	React.useEffect(() => {
		const gameDom = gameDomRef.current;
		const gameActions = getGameActions(gameId);
		const kd = evt => onKeyDown(evt, gameActions);
		const ku = evt => onKeyUp(evt, gameActions);
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
