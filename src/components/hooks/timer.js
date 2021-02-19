import React from 'react';
import { useSelector } from 'react-redux';
import { GameStates } from '../../models/TetrisGame';

const TimeStep = 300;
const FastTimeStep = 20;

/**
 * Hook that controls the game advance event.
 * @param {number} gameState The current game state.
 * @param {() => void} advance The advance action.
 */
export function useAdvanceTimer(gameState, advance) {
	const fastFall = useSelector(state => state.reactris.fastFall);
	const newInterval = gameState === GameStates.Running ? (fastFall ? FastTimeStep : TimeStep) : 0;

	React.useEffect(() => {
		if (newInterval) {
			const curTimer = setInterval(advance, newInterval);
			return () => { clearInterval(curTimer); };
		}
	}, [advance, newInterval]);
}
