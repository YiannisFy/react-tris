import React from 'react';
import { connect } from 'react-redux';
import { cheat as cheatAction } from '../actions/TetrisGame.js';

// The cheat button. It can be placed independently from the TetrisGame component.
function CheatButton({remCheats, cheat}) {
	return <button onClick={cheat}>Cheat! ({remCheats} left)</button>;
}

function mapStateToProps(state) {
	return {
		remCheats: state.reactris.remCheats
	};
}

const mapDispatchToProps = {
	cheat: cheatAction
};

export default connect(mapStateToProps, mapDispatchToProps)(CheatButton);