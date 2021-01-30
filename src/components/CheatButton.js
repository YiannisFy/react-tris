import React from 'react';
import { useSelector, connect } from 'react-redux';
import { cheat } from '../actions/TetrisGame.js';

function selectCheatCount(state) {
	return state.reactris.remCheats;
}

// The cheat button. It can be placed independently from the TetrisGame component.
function CheatButton({dispatch}) {
	const remCheats = useSelector(selectCheatCount);
	const remCheatsStr = remCheats > 0 ? (" (" + remCheats + ")") : "";

	return <button onClick={() => { dispatch(cheat()); }}>Cheat! ({remCheats} left)</button>;
}

export default connect()(CheatButton);