import React from 'react';
import Row from './Row.js';
import TetrisPiece from '../features/TetrisPiece.js';

// The game board.
// Placed blocks are represented in the state.blocks array, in a row-major manner.
// Literal "false" indicates an empty spot.
// Integer values indicate a block, with each value corresponding to blocks of the same color.
export default class Board extends React.Component {
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