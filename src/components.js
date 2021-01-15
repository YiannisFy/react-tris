import React from 'react';
import './components.css';

// A Tetris piece as an array of blocks.
// Each block is represented by a {row, col} point-like object.
class TetrisPiece extends Array {
	copy() {
		let copied = new TetrisPiece(...this.map(b => { return {row: b.row, col: b.col}}));
		if (typeof this.colorIndex !== 'undefined') {
			copied.colorIndex = this.colorIndex;
		}
		return copied;
	}

	// Gets bounds of this piece.
	getBounds() {
		if (!this._bounds) {
			this._bounds = {
				bottom: this.reduce((acc, cur) => {acc.row = Math.max(acc.row, cur.row); return acc;}, {row: -Infinity}).row + 1,
				top: this.reduce((acc, cur) => {acc.row = Math.min(acc.row,cur.row); return acc;}, {row: Infinity}).row,
				left: this.reduce((acc, cur) => {acc.col = Math.min(acc.col, cur.col); return acc;}, {col: Infinity}).col,
				right: this.reduce((acc, cur) => {acc.col = Math.max(acc.col, cur.col); return acc;}, {col: -Infinity}).col + 1
			};
		}
		return this._bounds;
	}

	// Moves this piece w/o placing it on the board.
	// @param translation: The translation vector.
	translate(translation) {
		for (let block of this) {
			block.col += translation.cols;
			block.row += translation.rows;
		}

		let bounds = this._bounds;
		if (bounds) {
			bounds.bottom += translation.rows;
			bounds.top += translation.rows;
			bounds.left += translation.cols;
			bounds.right += translation.cols;
		}
	}

	// Rotates this piece w/o placing on the board.
	// @param clockwise: The rotation direction (true is clockwise).
	rotate(clockwise) {
		let bounds = this.getBounds();

		// Clear the bounds object to have it lazily recalculated and to decouple the local "bounds" var from "this._bounds".
		this._bounds = null;
		this.translate({rows: -bounds.top, cols: -bounds.left});
		
		if (clockwise) {
			for (let block of this) {
				let t = block.row;
				block.row = -block.col;
				block.col = t;
			}
		}
		else {
			for (let block of this) {
				let t = block.row;
				block.row = block.col;
				block.col = -t;
			}
		}

		// Align top-left corner of piece rectangle to top-left corner of original bounding box.
		let rotBounds = this.getBounds();
		this.translate({rows: bounds.top - rotBounds.top, cols: bounds.left - rotBounds.left});
	}
}

// A rendered block on the board.
function Block(props) {
	let fv = props.fillValue;
	let className = "block";
	switch(fv) {
		case false:
		case undefined:
			break;
		case true:
			className = 'block filled';
			break;
		default:
			className = 'block filled-' + fv;
			break;
	}

	return (
		<div className={className}/>
	);
}

// A row rendered on the board.
function Row(props) {
	return (
		<div className='block-row'>{
			props.blocks.map(fv => <Block fillValue={fv} />)
		}</div>
	);
}

// The game board.
// Placed blocks are represented in the state.blocks array, in a row-major manner.
// Literal "false" indicates an empty spot.
// Integer values indicate a block, with each value corresponding to blocks of the same color.
class Board extends React.Component {
	constructor(props) {
		super(props);

		// Convert to int, so that they are usable as array indices & "+" does not do string concatenation.
		this.rows = Math.trunc(props.rows);
		this.cols = Math.trunc(props.columns);

		if (this.cols <= 0) throw new Error('Positive nr. of columns required');
		if (this.rows <= 0) throw new Error('Positive nr. of rows required');

		let blocks = new Array(this.rows * this.cols);
		for (let i = 0; i < blocks.length; i++) {
			blocks[i] = false;
		}
		this.state = {
			blocks: blocks,
			curPiece: null
		};
	}

	// Resets the board for a new game.
	reset() {
		this.state.blocks.fill(false);
		this.setState({blocks: this.state.blocks, curPiece: null});
	}

	// Places or removes a piece on the board.
	// @param piece: The piece to place on the board.
	// @param blockValue: The value used for filling the piece on the board. If an array, its values will be used for each block of the piece.
	_put(piece, blockValue) {
		let blocks = this.state.blocks;

		if (blockValue instanceof Array) {
			for (const i in piece) {
				let pb = piece[i];
				blocks[pb.row * this.cols + pb.col] = blockValue[i];
			}
		}
		else {
			for (const pb of piece) {
				blocks[pb.row * this.cols + pb.col] = blockValue;
			}
		}
	}
	
	// Reads the board block contents corresponding to the blocks of this piece.
	// @returns An array with the block contents.
	_read(piece) {
		let board = this.state.blocks;
		let readBlocks = new Array(piece.length);
		for (const i in piece) {
			let pblock = piece[i];
			if (pblock.row >= 0 && pblock.col >= 0 && pblock.row < this.rows && pblock.col < this.cols) {
				readBlocks[i] = board[pblock.row * this.cols + pblock.col];
			}
		}
		
		return readBlocks;
	}
	
	// Bounds & collisions check.
	_checkPiece(piece) {
		const blocks = this.state.blocks;
		for (const block of piece) {
			if (block.col < 0 || block.col >= this.cols
				|| block.row < 0 || block.row >= this.rows
				|| false !== blocks[block.row * this.cols + block.col]) {
				return false;
			}
		}
		return true;
	}

	// Tries to move a piece on the board.
	// @param piece: The piece to move. It is assumed that all Board blocks corresponding to the piece are filled.
	// @param movement: A function that can transform the piece object.
	// @return: Whether the movement was possible.
	_move(piece, movement) {
		// Remove piece from board. This helps with both filling and the collision checks.
		this._put(piece, false);

		// Update its block coordinates.
		let movedPiece = piece.copy();
		movement(movedPiece);

		// Abort movement if not possible to move.
		if (!this._checkPiece(movedPiece)) {
			this._put(piece, movedPiece.colorIndex);
			return false;
		}

		// Place piece at new position.
		this._put(movedPiece, movedPiece.colorIndex);

		// Update "piece" object.
		for (let i = piece.length - 1; i >= 0; i--) {
			piece[i] = movedPiece[i];
		}
		
		// Update the UI based on the state change.
		this.forceUpdate();
		
		return true;
	}

	// Tetris piece definitions.
	static _tetrisPieces = [
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}), // Square.
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}), // I-shape.
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}), // L-shape.
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 2}), // J-shape.
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 1, col: 2}), // 2-shape.
		new TetrisPiece({row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 1}), // S-shape.
		new TetrisPiece({row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 1}) // T-shape.
	];

	static _nextPiece() {
		let pieceIndex = Math.trunc(Math.random() * Board._tetrisPieces.length);
		let piece = Board._tetrisPieces[pieceIndex].copy();
		piece.colorIndex = pieceIndex;
		return piece;
	}

	// Game progression.

	// Removes the full rows from the board.
	// @return The number of full rows removed.
	_removeFullRows() {
		let removed = 0;
		let blocks = this.state.blocks;
		for (let r = this.rows - 1; r >= 0; r--) {
			let fullRow = true;
			for (let c = this.cols - 1; c >= 0; c--) {
				if (false === blocks[r * this.cols + c]) {
					fullRow = false;
					break;
				}
			}
			
			// Remove the row.
			if (fullRow) {
				removed++;
				blocks.splice(r * this.cols, this.cols);
			}
		}
		
		// Add empty rows at the top of the board to replace the rows that were removed.
		if (removed) {
			const emptyRow = new Array(this.cols);
			emptyRow.fill(false, 0, this.cols);

			for (let r = 0; r < removed; r++) {
				blocks.splice(0, 0, ...emptyRow);
			}
		}
		
		return removed;
	}

	// Permanently places the current piece on the board.
	_settleCurrentPiece() {
		this.setState({curPiece: null});
	}

	// Performs the next game step.
	// @param fastFall: Whether the falling piece is falling fast.
	// @param onCannotAdvance: Called whenever the game cannot proceed (e.g. the board is full).
	// @return The score earned from this step.
	advance(fastFall, onCannotAdvance) {
		if (!this.state.curPiece) {
			this.spawnPiece() || (onCannotAdvance && onCannotAdvance());
		}
		else if (this.moveDown()) {
			// Moved the falling piece down. Give a point for fast falling.
			if (fastFall)
				return 1;
		}
		else if (!this.moveDown()) {
			// Cannot move down, so we fix the piece in place and remove any full rows.
			this._settleCurrentPiece();
			return 10 * this._removeFullRows();
		}
		return 0;
	}

	// Public methods.

	hasCurrentPiece() {
		return !!this.state.curPiece;
	}

	// Spawns a random piece on the board.
	// @return: Whether the piece can be placed on the board.
	spawnPiece() {
		let piece = Board._nextPiece();
		let bounds = piece.getBounds();
		let col = Math.trunc((this.cols - bounds.right) / 2); // Uses 0-based bounds as size.
		
		piece.translate({cols: col, rows: 0});
		
		if (this._checkPiece(piece)) {
			this._put(piece, piece.colorIndex);
			this.setState({curPiece: piece}); // Adds this to the component state.
			return true;
		}

		// New piece cannot be placed.
		return false;
	}

	// Moves
	moveLeft() {
		let curPiece = this.state.curPiece;
		if (curPiece) {
			this._move(curPiece, p => p.translate({rows: 0, cols: -1}));
		}
	}

	moveRight() {
		let curPiece = this.state.curPiece;
		if (curPiece) {
			this._move(curPiece, p => p.translate({rows: 0, cols: 1}));
		}
	}

	// Moves the current piece down.
	// @return Whether the movement was possible.
	moveDown() {
		let curPiece = this.state.curPiece;
		if (curPiece) {
			return this._move(curPiece, p => p.translate({rows: 1, cols: 0}));
		}
		return false;
	}

	rotateLeft() {
		let curPiece = this.state.curPiece;
		if (curPiece) {
			this._move(curPiece, p => p.rotate(false));
		}
	}

	rotateRight() {
		let curPiece = this.state.curPiece;
		if (curPiece) {
			this._move(curPiece, p => p.rotate(true));
		}
	}

	render() {
		const rows = new Array(this.rows);
		for (let i = 0; i < this.rows; i++) {
			rows[i] = <Row blocks={this.state.blocks.slice(i * this.cols, (i + 1) * this.cols)}/>
		}
		return <div>{rows}</div>;
	}
}

class TetrisGame extends React.Component {
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

export {TetrisGame};