import { connect } from 'react-redux';
import { getGameActions } from '../actions/TetrisGame';
import CheatButton from '../components/CheatButton';

function mapStateToProps(state, {gameId}) {
	if (undefined === gameId) gameId = "";
	return {
		remCheats: state[`reactris-${gameId}`].remCheats
	};
}

function mapDispatchToProps(_, {gameId}) {
	if (undefined === gameId) gameId = "";
	return {
		cheat: getGameActions(gameId).cheat
	};
}

/**
 * A <code>CheatButton</code> component that is bound to the Redux store.
 */
export default connect(mapStateToProps, mapDispatchToProps)(CheatButton);