// TODO: Support multiple TetrisGame components.
import React from 'react';
import { useSelector, connect } from 'react-redux';
import * as TetrisActions from '../actions/TetrisGame.js';
import { GameStates } from '../models/TetrisGame.js';
import './components.css';
import Board from './Board.js';

// Input event handlers.

function onClick(evt, dispatch) {
	dispatch(TetrisActions.startGame());

	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

function onKeyUp(evt, dispatch) {
	let handled = true;
	switch(evt.key) {
		case 'ArrowDown':
			dispatch(TetrisActions.setFastDrop(false));
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

function onKeyDown(evt, dispatch) {
	let handled = true;
	switch (evt.key) {
		case 'Escape':
			dispatch(TetrisActions.stopGame());
			break;
		case 'ArrowUp':
			// We handle this to avoid having the page scroll up while playing.
			break;
		case 'ArrowDown':
			dispatch(TetrisActions.setFastDrop(true));
			break;
		case 'ArrowLeft':
			dispatch(TetrisActions.moveLeft());
			break;
		case 'ArrowRight':
			dispatch(TetrisActions.moveRight());
			break;
		case 'Z':
		case 'z':
			dispatch(TetrisActions.rotateLeft());
			break;
		case 'X':
		case 'x':
			dispatch(TetrisActions.rotateRight());
			break;
		case ' ':
			dispatch(TetrisActions.startGame());
			break;
		default: handled = false;
	}

	if (handled) {
		evt.preventDefault();
		evt.stopPropagation();
	}
	return !handled;
}

// Input listener management.
// TODO: This looks like it can be transformed into a hook.

// Adds input listeners.
// @param dispatch The Redux dispatch() function for the current store.
// @param domGameRoot The DOM element that contains the game.
// @param state The input listener functions, specific to the component.
// @param setState The React state updater function, to store the input listeners,
//   to preserve the listener function objects until "removeInputListeners" is called.
function addInputListeners(dispatch, domGameRoot, state, setState) {
	// Initialize the component-specific listeners (bound to the dispatch and gameRoot of the component).
	if (!state) {
		state = {
			keyDown: (evt) => onKeyDown(evt, dispatch),
			keyUp: (evt) => onKeyUp(evt, dispatch),
			click: (evt) => onClick(evt, dispatch)
		};
		setState(state);
	}

	document.addEventListener('keydown', state.keyDown);
	document.addEventListener('keyup', state.keyUp);
	domGameRoot.addEventListener('click', state.click);
}

// Removes input listeners.
// The listener function objects remain in the React state, for later use by "addInputListeners".
// @param domGameRoot The DOM element that contains the game.
// @param inputListeners The input listener functions, specific to the component.
function removeInputListeners(domGameRoot, inputListeners) {
	if (inputListeners) {
		document.removeEventListener('keydown', inputListeners.keyDown);
		document.removeEventListener('keyup', inputListeners.keyUp);
		domGameRoot.removeEventListener('click', inputListeners.click);
	}
}

// Hook that controls the game advance event.
function useAdvanceTimer(gameState, dispatch) {
	const fastFall = useSelector(state => state.reactris.fastFall);
	console.info("fastFall = " + fastFall);
	// This flag is toggled by the timeout handler and it triggers another call to the timer setup code in "useEffect" below.
	const [timerStrobe, setTimerStrobe] = React.useState(false);
	const refSetStrobe = React.useRef(setTimerStrobe);
	const newInterval = gameState === GameStates.Running ? (fastFall ? FastTimeStep : TimeStep) : 0;

	React.useEffect(() => {
		const action = () => {
			dispatch(TetrisActions.advance());
			// Set this in React state to trigger an update and set the next timeout from this "useEffect" code.
			// It would not be needed if this component was somehow dependent on the game state changes caused by the "advance" action.
			refSetStrobe.current(!timerStrobe);
		};

		const curTimer = newInterval
			? setTimeout(action, newInterval)
			: null;

		if (null != curTimer) {
			return () => {
				clearTimeout(curTimer);
			}
		}
	}, [gameState, timerStrobe, refSetStrobe, dispatch, newInterval]);
}

const TimeStep = 300;
const FastTimeStep = 20;

// The game component.
function TetrisGame({dispatch}) {
	const gameDomRef = React.useRef(null);
	const gameState = useSelector(state => state.reactris.gameState);
	const score = useSelector(state => state.reactris.score);
	const [inputListeners, setInpListeners] = React.useState(null);
	useAdvanceTimer(gameState, dispatch);

	// Mount/unmount side effects.
	React.useEffect(() => {
		const gameRoot = gameDomRef.current;
		addInputListeners(dispatch, gameRoot, inputListeners, setInpListeners);

		return () => {
			// Remove event listeners.
			removeInputListeners(gameRoot, inputListeners, setInpListeners);
		};
	}, []);

	return (
		<div className="game" ref={gameDomRef}>
			<div>Score: {score}{gameState === GameStates.Stopped ? " - stopped" : ""}</div>
			<Board/>
		</div>
	);
}

export default connect()(TetrisGame);