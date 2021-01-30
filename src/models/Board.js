import * as TetrisPiece from './TetrisPiece.js';

const Rows = 20, Cols = 10;

// Game board operations.
// Each operation takes the board object as an argument, save for the create operation.
// The game board consists of rows, which consist of blocks.
// Representing rows individually (vs. using a flat block array) is beneficial because
// rows provide finer state partitioning and come handy when removing rows from the board.

// Creates an empty game board.
// As a reducer, it returns the empty board as the new state.
// @return A new game board.
function create() {
	let board = {
		rows: new Array(Rows),
		nrCols: Cols
	}
	reset(board);
	return board;
}

// Empties/initializes the board rows.
// @param board The board.
function reset(board) {
	const {rows, nrCols} = board;
	for (let i = rows.length - 1; i >= 0; i--) {
		let row = new Array(nrCols)
		row.fill(false); // We would let it undefined, but cannot use map() on such entries.
		rows[i] = row;
	}
}

// Places or removes a piece on the board.
// @param board The board.
// @param piece The piece to place on the board.
// @param blockValue The value used for filling the piece on the board. If an array, its values will be used for each block of the piece.
function putPiece(board, piece, blockValue) {
	const rows = board.rows;
	if (blockValue instanceof Array) {
		for (const i in piece.blocks) {
			let pb = piece.blocks[i];
			rows[pb.row][pb.col] = blockValue[i];
		}
	}
	else {
		for (const pb of piece.blocks) {
			rows[pb.row][pb.col] = blockValue;
		}
	}
}

// Bounds & collisions check.
// @param board The board.
// @param piece The piece to be checked against the board & its contents.
// @return Whether the piece collides with the board boundaries or any block currently on the board.
function checkPiece(board, piece) {
	const {nrCols, rows} = board;
	for (const block of piece.blocks) {
		if (block.col < 0 || block.col >= nrCols
			|| block.row < 0 || block.row >= Rows
			|| false !== rows[block.row][block.col]) {
			return false;
		}
	}
	return true;
}

// Tries to move a piece that has been placed on the board.
// @param board The board.
// @param piece The piece to move. It is assumed that all board positions corresponding to the piece are already filled.
// @param movement A function that can transform the piece object.
// @return Whether the movement was possible.
function movePiece(board, piece, movement) {
	// Remove piece from board. This helps with both filling and the collision checks.
	putPiece(board, piece, false);

	// Update its block coordinates.
	let movedPiece = TetrisPiece.copy(piece);
	movement(movedPiece);

	// Abort movement if not possible to move.
	if (!checkPiece(board, movedPiece)) {
		putPiece(board, piece, movedPiece.colorIndex);
		return false;
	}

	// Place piece at new position.
	putPiece(board, movedPiece, movedPiece.colorIndex);

	// Update "piece" object.
	const movedBlocks = movedPiece.blocks;
	const pieceBlocks = piece.blocks;
	for (let i = pieceBlocks.length - 1; i >= 0; i--) {
		pieceBlocks[i] = movedBlocks[i];
	}

	return true;
}

// Removes the specified row from the board and inserts an empty one at the board top.
// @param board The board.
// @param rowIndex The row index of the row to be removed.
function removeRow(board, rowIndex) {
	const {nrCols, rows} = board;
	if (rowIndex >= 0 && rowIndex < rows.length) {
		// Remove row.
		rows.splice(rowIndex, 1);
		// Add an empty row at the top of the board.
		const newRow = new Array(nrCols);
		newRow.fill(false);
		rows.splice(0, 0, newRow);
	}
}

// Removes the full rows from the board.
// @param board The board.
// @return The number of full rows removed.
function removeFullRows(board) {
	const {nrCols, rows} = board;
	let removed = 0;
	for (let r = Rows - 1; r >= 0; r--) {
		let row = rows[r];
		let fullRow = true;
		for (let c = Cols - 1; c >= 0; c--) {
			if (false === row[c]) {
				fullRow = false;
				break;
			}
		}

		// Remove the row.
		if (fullRow) {
			// Remove row.
			rows.splice(r, 1);
			removed++;
		}
	}

	// Add empty rows on top.
	if (removed) {
		const emptyRows = new Array(removed);
		for (let i = 0; i < removed; i++) {
			const newRow = new Array(nrCols);
			newRow.fill(false);
			emptyRows[i] = newRow;
		}
		rows.splice(0, 0, ...emptyRows);
	}

	return removed;
}

export {
	checkPiece,
	create,
	movePiece,
	putPiece,
	removeFullRows,
	reset,
	removeRow
};