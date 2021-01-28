// TODO: Transform this class into just a module with methods operating on tetris piece objects.

// A Tetris piece as an array of blocks.
// Each block is represented by a {row, col} point-like object.
export default class TetrisPiece extends Array {
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
