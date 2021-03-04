// TODO: Support multiple TetrisGame components.
import React from 'react';
import { GameStates } from '../models/TetrisGame';
import { getGameActions } from '../actions/TetrisGame';
import Board from './Board';
import { useGameInput } from './hooks/input';
import { useAdvanceTimer } from './hooks/timer';
import { useGameState } from './hooks/gameState';
import './style.css';

// The game component.
export default function TetrisGame({gameId = "", nrRows, nrCols}) {
	const {score, board, gameState, fastFall} = useGameState(gameId, nrRows, nrCols);
	const gameDomRef = React.useRef(null);
	const actions = getGameActions(gameId);
	useGameInput(gameDomRef, gameId);
	useAdvanceTimer(gameState, fastFall, actions.advance);

	const cssClass = (gameState === GameStates.Running) ? "game" : "game stopped";
	return (
		<div className={cssClass} ref={gameDomRef}>
			<div>Score: {score}{gameState === GameStates.Stopped ? " - stopped" : ""}</div>
			<Board rows={board.rows} />
		</div>
	);
}
