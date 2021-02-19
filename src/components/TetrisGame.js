// TODO: Support multiple TetrisGame components.
import React from 'react';
import { useSelector, connect } from 'react-redux';
import { GameStates } from '../models/TetrisGame';
import { advance } from '../actions/TetrisGame';
import './style.css';
import Board from './Board';
import { useGameInput } from './hooks/input';
import { useAdvanceTimer } from './hooks/timer';

// The game component.
function TetrisGame() {
	const gameDomRef = React.useRef(null);
	const gameState = useSelector(state => state.reactris.gameState);
	const score = useSelector(state => state.reactris.score);
	const board = useSelector(state => state.reactris.board);
	useGameInput(gameDomRef);
	useAdvanceTimer(gameState, advance);

	const cssClass = (gameState === GameStates.Running) ? "game" : "game stopped";
	return (
		<div className={cssClass} ref={gameDomRef}>
			<div>Score: {score}{gameState === GameStates.Stopped ? " - stopped" : ""}</div>
			<Board rows={board.rows} />
		</div>
	);
}

export default connect()(TetrisGame);