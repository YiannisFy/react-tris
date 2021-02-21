import React from 'react';
import { GameStates } from '../../models/TetrisGame';

const TimeStep = 300;
const FastTimeStep = 20;

/**
 * Hook that controls the game advance event.
 * @param {number} gameState The current game state.
 * @param {boolean} fastFall Whether the game is in fast-fall mode.
 * @param {() => void} advance The advance action.
 */
export function useAdvanceTimer(gameState, fastFall, advance) {
	const newInterval = gameState === GameStates.Running ? (fastFall ? FastTimeStep : TimeStep) : 0;

	React.useEffect(() => {
		if (newInterval) {
			const curTimer = setInterval(advance, newInterval);
			return () => { clearInterval(curTimer); };
		}
	}, [advance, newInterval]);
}