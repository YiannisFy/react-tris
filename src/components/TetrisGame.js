// TODO: Support multiple TetrisGame components.
import React from 'react';
import { useSelector, connect } from 'react-redux';
import { GameStates } from '../models/TetrisGame.js';
import './style.css';
import Board from './Board.js';
import * as Events from './Events.js';

// The game component.
function TetrisGame({dispatch}) {
	const gameDomRef = React.useRef(null);
	const gameState = useSelector(state => state.reactris.gameState);
	const score = useSelector(state => state.reactris.score);
	const [inputListeners, setInpListeners] = React.useState(null);
	Events.useAdvanceTimer(gameState, dispatch);

	// Mount/unmount side effects.
	React.useEffect(() => {
		const gameRoot = gameDomRef.current;
		Events.addInputListeners(dispatch, gameRoot, inputListeners, setInpListeners);

		return () => {
			// Remove event listeners.
			Events.removeInputListeners(gameRoot, inputListeners, setInpListeners);
		};
	}, [dispatch, inputListeners]); // NOTE: The dependencies do not really change.

	const cssClass = (gameState === GameStates.Running) ? "game" : "game stopped";
	return (
		<div className={cssClass} ref={gameDomRef}>
			<div>Score: {score}{gameState === GameStates.Stopped ? " - stopped" : ""}</div>
			<Board/>
		</div>
	);
}

export default connect()(TetrisGame);