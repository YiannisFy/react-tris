// Tetris piece templates.
const PieceTemplates = [
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}], // Square.
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}], // I-shape.
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}], // L-shape.
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 2}], // J-shape.
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 1, col: 2}], // 2-shape.
	[{row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 1}], // S-shape.
	[{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 1}] // T-shape.
];

// Tetris piece operations.
// A Tetris piece as an array of block positions and a color index.
// Each block position is represented by a {row, col} point-like object.

// Creates a new Tetris piece based on one of the piece templates.
// @return The new piece.
function createRandom() {
	const pieceIndex = Math.trunc(Math.random() * PieceTemplates.length);
	// Copy the template.
	const blocks = PieceTemplates[pieceIndex].map(b => { return {row: b.row, col: b.col}});
	// NOTE: Arrays with extra fields are not supported by Redux, so we have to return an
	//  object that contains both.
	return {
		blocks,
		colorIndex: pieceIndex
	};
}

function copy(piece) {
	return {
		blocks: piece.blocks.map(b => { return {row: b.row, col: b.col}}),
		colorIndex: piece.colorIndex
	};
}

// Gets bounds of this piece.
// @param piece The piece to measure.
// @return The piece bounds.
function getBounds(piece) {
	if (!piece._bounds) {
		const blocks = piece.blocks;
		piece._bounds = {
			bottom: blocks.reduce((acc, cur) => {acc.row = Math.max(acc.row, cur.row); return acc;}, {row: -Infinity}).row + 1,
			top: blocks.reduce((acc, cur) => {acc.row = Math.min(acc.row,cur.row); return acc;}, {row: Infinity}).row,
			left: blocks.reduce((acc, cur) => {acc.col = Math.min(acc.col, cur.col); return acc;}, {col: Infinity}).col,
			right: blocks.reduce((acc, cur) => {acc.col = Math.max(acc.col, cur.col); return acc;}, {col: -Infinity}).col + 1
		};
	}
	return piece._bounds;
}

// Moves this piece w/o placing it on the board.
// @param The piece to move.
// @param translation The translation vector.
function translate(piece, translation) {
	for (let block of piece.blocks) {
		block.col += translation.cols;
		block.row += translation.rows;
	}

	const bounds = piece._bounds;
	if (bounds) {
		bounds.bottom += translation.rows;
		bounds.top += translation.rows;
		bounds.left += translation.cols;
		bounds.right += translation.cols;
	}
}

const getTranslateOp = translation => piece => {
	return translate(piece, translation);
};

// Rotates this piece w/o placing on the board.
// @param The piece to move.
// @param clockwise: The rotation direction (true is clockwise).
function rotate(piece, clockwise) {
	let bounds = getBounds(piece);

	// Clear the bounds object to have it lazily recalculated and to decouple the local "bounds" var from "piece._bounds".
	piece._bounds = null;
	translate(piece, {rows: -bounds.top, cols: -bounds.left});

	if (clockwise) {
		for (let block of piece.blocks) {
			let t = block.row;
			block.row = block.col;
			block.col = -t;
		}
	}
	else {
		for (let block of piece.blocks) {
			let t = block.row;
			block.row = -block.col;
			block.col = t;
		}
	}

	// Align top-left corner of piece rectangle to top-left corner of original bounding box.
	let rotBounds = getBounds(piece);
	translate(piece, {rows: bounds.top - rotBounds.top, cols: bounds.left - rotBounds.left});
}

const getRotateOp = clockwise => piece => {
	return rotate(piece, clockwise);
};

// Public API.
export {
	copy,
	createRandom,
	getBounds,
	getRotateOp,
	getTranslateOp,
	translate
};
