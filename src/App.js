import logo from './logo.svg';
import './App.css';
import TetrisGame from './components/TetrisGame.js';

function App() {
  return (
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
  );
}

export default App;