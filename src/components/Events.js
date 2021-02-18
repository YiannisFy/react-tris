import React from 'react';
import { useSelector } from 'react-redux';
import { GameStates } from '../models/TetrisGame';
import * as TetrisActions from '../actions/TetrisGame';

// Input event handlers.

function onClick(evt) {
	TetrisActions.startGame();

	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

function onKeyUp(evt) {
	let handled = true;
	switch(evt.key) {
		case 'ArrowDown':
			TetrisActions.setFastDrop(false);
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

function onKeyDown(evt) {
	let handled = true;
	switch (evt.key) {
		case 'Escape':
			TetrisActions.stopGame();
			break;
		case 'ArrowUp':
			// We handle this to avoid having the page scroll up while playing.
			break;
		case 'ArrowDown':
			TetrisActions.setFastDrop(true);
			break;
		case 'ArrowLeft':
			TetrisActions.moveLeft();
			break;
		case 'ArrowRight':
			TetrisActions.moveRight();
			break;
		case 'Z':
		case 'z':
			TetrisActions.rotateLeft();
			break;
		case 'X':
		case 'x':
			TetrisActions.rotateRight();
			break;
		case 'A':
		case 'a':
			TetrisActions.cheat();
			break;
		case ' ':
			TetrisActions.startGame();
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
 */
function useGameInput(gameDomRef) {
	React.useEffect(() => {
		const gameDom = gameDomRef.current;
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		gameDom.addEventListener('click', onClick);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
			gameDom.removeEventListener('click', onClick);
		};
	}, [gameDomRef]);
}

const TimeStep = 300;
const FastTimeStep = 20;

/**
 * Hook that controls the game advance event.
 * @param {number} gameState The current game state.
 * @param {() => void} advance The advance action.
 */
function useAdvanceTimer(gameState, advance) {
	const fastFall = useSelector(state => state.reactris.fastFall);
	// This flag is toggled by the timeout handler and it triggers another call to the timer setup code in "useEffect" below.
	const [timerStrobe, setTimerStrobe] = React.useState(false);
	const newInterval = gameState === GameStates.Running ? (fastFall ? FastTimeStep : TimeStep) : 0;

	React.useEffect(() => {
		const action = () => {
			advance();
			// Set this in React state to trigger an update and set the next timeout from this "useEffect" code.
			// It would not be needed if this component was somehow dependent on the game state changes caused by the "advance" action.
			setTimerStrobe(!timerStrobe);
		};

		const curTimer = newInterval
			? setTimeout(action, newInterval)
			: null;

		if (null != curTimer) {
			return () => {
				clearTimeout(curTimer);
			}
		}
	}, [gameState, timerStrobe, setTimerStrobe, advance, newInterval]);
}

export { useAdvanceTimer, useGameInput };