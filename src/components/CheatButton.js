import React from 'react';

/**
 * The cheat button.
 * @param {{remCheats, cheat}} props The number of cheats remaining and a function that performs the cheat.
 */
export default function CheatButton({remCheats, cheat}) {
	return <button onClick={cheat}>Cheat! ({remCheats} left)</button>;
}