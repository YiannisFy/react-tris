import { connect } from 'react-redux';
import TetrisGame from '../components/TetrisGame';

function mapStateToProps(state, {gameId}) {
	if (undefined === gameId) gameId = "";
	return {
		game: state[`reactris-${gameId}`]
	};
}

/**
 * A <code>TetrisGame</code> component that is bound to the Redux store.
 */
export default connect(mapStateToProps)(TetrisGame);