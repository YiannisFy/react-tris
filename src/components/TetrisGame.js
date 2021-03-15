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
	const {score, board, nextGrid, gameState, fastFall} = useGameState(gameId, nrRows, nrCols);
	const gameDomRef = React.useRef(null);
	const actions = getGameActions(gameId);
	useGameInput(gameDomRef, gameId);
	useAdvanceTimer(gameState, fastFall, actions.advance);

	const cssClass = (gameState !== GameStates.Stopped) ? "game" : "game stopped";
	const gcCssClass = "game-column";
	let sStatus;
	switch(gameState) {
		case GameStates.Stopped: sStatus = " - stopped"; break;
		case GameStates.Paused: sStatus = " - paused"; break;
		default: sStatus = "";
	}

	return (
		<div className={cssClass} ref={gameDomRef}>
			<div>Score: {score}{sStatus}</div>
			<div>
				<div className={gcCssClass}>
					<Board rows={board.rows} />
				</div>
				<div className={gcCssClass}>
					Next:<br/>
					<Board rows={nextGrid.rows} />
				</div>
			</div>
		</div>
	);
}
