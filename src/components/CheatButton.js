import React, { useCallback } from 'react';
import { useCheat } from './hooks/cheat';

/**
 * The cheat button.
 * @param {{gameId}} props The game ID.
 */
export default function CheatButton({gameId}) {
	const {remCheats, cheat} = useCheat(gameId);
	// Discards the event args of onClick. Otherwise using "cheat" directly as an action would be ok.
	const clickHandler = useCallback(() => cheat(), [cheat]);
	return <button onClick={clickHandler}>Cheat! ({remCheats} left)</button>;
}