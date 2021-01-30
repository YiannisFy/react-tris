import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import logo from './logo.svg';
import './App.css';
import { reducer } from './actions/TetrisGame.js';
import TetrisGame from './components/TetrisGame.js';

const store = configureStore({reducer: {reactris: reducer}});

function App() {
  return (
	<Provider store={store}>
		<div className="App">
		  <header className="App-header">
			<div>
				React-tris:<br/>
				<div className="instructions">
					Click the board to [re]start game.<br/>
					<kbd>Z</kbd>, <kbd>X</kbd>: Rotate Piece.<br/>
					<kbd>ESC</kbd>: Stop game.
				</div>
			</div>
			<img src={logo} className="App-logo" alt="logo" />
			<TetrisGame />
		  </header>
		</div>
	</Provider>
  );
}

export default App;