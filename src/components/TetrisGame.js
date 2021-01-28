import React from 'react';
import './components.css';
import Board from './Board.js';

export default class TetrisGame extends React.Component {
	static GameStates = {
		Stopped: 0,
		Running: 1,
	};

	static TimeStep = 300;
	static DropTimeStep = 20;

	constructor(props) {
		super(props);		
		this.state = {score: 0, gameState: TetrisGame.GameStates.Stopped};
		this.gameRef = React.createRef();
		this.boardRef = React.createRef();

		// Shadows the prototype methods. Needed for fixing "this" to this instance instead of the DOM event source.
		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.advance = this.advance.bind(this);
	}

	componentDidMount() {
		const gameRoot = this.gameRef.current;
		gameRoot.focus();
		gameRoot.addEventListener('click', this.onClick);
	}

	componentWillUnmount() {
		// Remove event listeners.
		this.gameRef.current.removeEventListener('click', this.onClick);

		// Ensure the game is stopped (to clean up the game timer & key listeners).
		this.stopGame();
	}

	attachKeyListeners() {
		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
	}
	
	detachKeyListeners() {
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
	}

	startGame() {
		this.score = 0; // Held here to avoid issues with coalesced state updates when increasing score.
		this.setState({gameState: TetrisGame.GameStates.Running, score: 0});
		this.boardRef.current.reset();
		this.attachKeyListeners();
		this._scheduleAdvance(0);
	}

	stopGame() {
		this.setState({gameState: TetrisGame.GameStates.Stopped});
		// Needed or we will get stray calls to advance() after component has been unmounted.
		if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
		this.detachKeyListeners();
	}

	// Game timer step.
	advance() {
		if (this.state.gameState === TetrisGame.GameStates.Running) {
			let board = this.boardRef.current;
			this.score += board.advance(this.fastDrop, () => this.stopGame());
			this.setState({score: this.score});
			
			// Stop fast-drop mode if the falling piece has settled.
			if (!board.hasCurrentPiece()) {
				this.stopFastDrop();
			}

			// If the game is still running then schedule the next step.
			if (this.state.gameState === TetrisGame.GameStates.Running) {
				this._scheduleAdvance(this.fastDrop ? TetrisGame.DropTimeStep : TetrisGame.TimeStep);
			}
		}
	}

	_scheduleAdvance(interval) {
		if (this._advanceTimeout) clearTimeout(this._advanceTimeout);
		this._advanceTimeout = setTimeout(this.advance, interval);
	}

	// Starts the fast drop of the current piece (while the Down key is pressed)
	startFastDrop() {
		if (!this.fastDrop) {
			this.fastDrop = true;
			this._scheduleAdvance(TetrisGame.DropTimeStep);
		}
	}
	
	// Stops the fast drop mode.
	stopFastDrop() {
		if (this.fastDrop) {
			this.fastDrop = false;
			this._scheduleAdvance(TetrisGame.TimeStep);
		}
	}

	onClick(evt) {
		let handled = false;
		if (this.state.gameState !== TetrisGame.GameStates.Running) {
			this.startGame();
			handled = true;
		}

		if (handled) {
			evt.preventDefault();
			evt.stopPropagation();
		}
		return !handled;
	}

	onKeyUp(evt) {
		let handled = true;
		switch(evt.key) {
			case 'ArrowDown':
				this.stopFastDrop();
				break;
			default:
				handled = false;
				break;
		}

		if (handled) {
			evt.preventDefault();
			evt.stopPropagation();
		}
		return !handled;
	}

	onKeyDown(evt) {
		let handled = true;
		let board = this.boardRef.current;
		if (this.state.gameState === TetrisGame.GameStates.Running) {
			switch (evt.key) {
				case 'Escape':
					this.stopGame();
					break;
				case 'ArrowUp':
					// We handle this to avoid having the page scroll up while playing.
					break;
				case 'ArrowDown':
					// Schedule fast drop mode to begin in next time step.
					this.startFastDrop();
					break;
				case 'ArrowLeft':
					board.moveLeft();
					break;
				case 'ArrowRight':
					board.moveRight();
					break;
				case 'Z':
				case 'z':
					board.rotateLeft();
					break;
				case 'X':
				case 'x':
					board.rotateRight();
					break;
				default: handled = false;
			}
		}
		else {
			if (evt.key === ' ') {
				this.startGame();
			}
			else handled = false;
		}


		if (handled) {
			evt.preventDefault();
			evt.stopPropagation();
		}
		return !handled;
	}

	render() {
		return (
			<div class="game" ref={this.gameRef}>
				<div>Score: {this.state.score}{this.state.gameState === TetrisGame.GameStates.Stopped ? " - stopped" : ""}</div>
				<Board columns={10} rows={20} ref={this.boardRef}/>
			</div>
		);
	}
}