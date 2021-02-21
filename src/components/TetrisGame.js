// TODO: Support multiple TetrisGame components.
import React from 'react';
import { GameStates } from '../models/TetrisGame';
import { getGameActions } from '../actions/TetrisGame';
import Board from './Board';
import { useGameInput } from './hooks/input';
import { useAdvanceTimer } from './hooks/timer';
import './style.css';

// The game component.
export default function TetrisGame({game}) {
	const gameDomRef = React.useRef(null);
	const {score, board, gameState, fastFall, gameId} = game;
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
