import { Provider } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import { store as gameStore } from './redux';
import TetrisGame from './components/TetrisGame.js';
import CheatButton from './components/CheatButton.js';

function App() {
  return (
	<Provider store={gameStore}>
		<div className="App">
		  <header className="App-header">
			<div>
				React-tris:<br/>
				<div className="instructions">
					Click the board to [re]start game.<br/>
					<kbd>Z</kbd>, <kbd>X</kbd>: Rotate Piece.<br/>
					<kbd>ESC</kbd>: Stop game.<br/>
					<kbd>A</kbd>: <CheatButton/>
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