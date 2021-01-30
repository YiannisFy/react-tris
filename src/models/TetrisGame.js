import * as Board from './Board.js';
import * as TetrisPiece from './TetrisPiece.js';

const GameStates = {
	Stopped: 0,
	Running: 1
};

const MaxCheats = 3;
const CheatPenalty = 10;

// Operations affecting the whole game.

// Creates a new game state.
// @return The new game model.
function create() {
	return {
		curPiece: null,
		board: Board.create(),
		score: 0,
		remCheats: MaxCheats,
		gameState: GameStates.Stopped,
		// Whether the falling piece is falling fast.
		fastFall: false
	};
}

// Resets the game board & score.
// @param game The game model.
function resetProgress(game) {
	game.curPiece = null;
	Board.reset(game.board);
	game.score = 0;
	game.remCheats = MaxCheats;
	game.fastFall = false;
}

// Permanently places the current piece on the board.
// @param game The game model.
function settleCurrentPiece(game) {
	game.curPiece = null;
}

// Spawns a random piece on the board.
// @param game The game model.
// @return Whether the piece can be placed on the board.
function spawnPiece(game) {
	const board = game.board;
	let piece = TetrisPiece.createRandom();
	let bounds = TetrisPiece.getBounds(piece);
	let col = Math.trunc((board.nrCols - bounds.right) / 2); // Uses 0-based bounds as size.

	TetrisPiece.translate(piece, {cols: col, rows: 0});

	if (Board.checkPiece(board, piece)) {
		Board.putPiece(board, piece, piece.colorIndex);
		game.curPiece = piece;
		return true;
	}

	// New piece cannot be placed.
	return false;
}

// Moves the current piece down one step.
// @param game The game model.
// @return Whether the movement was possible.
function moveDown(game) {
	const { curPiece, board } = game;
	if (curPiece) {
		return Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 1, cols: 0}));
	}
	return false;
}

// Public API.

// Attempts to move the current piece one column to the left.
// @param game The game model.
function moveLeft(game) {
	const { curPiece, board, gameState } = game;
	if (gameState === GameStates.Running) {
		if (curPiece) {
			Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 0, cols: -1}));
		}
	}
}

// Attempts to move the current piece one column to the right.
// @param game The game model.
function moveRight(game) {
	const { curPiece, board, gameState } = game;
	if (gameState === GameStates.Running) {
		if (curPiece) {
			Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 0, cols: 1}));
		}
	}
}

// Performs the next game step.
// @param game The game model.
function advance(game) {
	if (game.gameState === GameStates.Running) {
		const { fastFall } = game;

		if (!game.curPiece) {
			spawnPiece(game) || stopGame(game);
		}
		else if (moveDown(game)) {
			// Moved the falling piece down. Give a point for fast falling.
			if (fastFall)
				game.score++;
		}
		else if (!moveDown(game)) {
			// Cannot move down, so we fix the piece in place and remove any full rows.
			settleCurrentPiece(game);
			game.score += 10 * Board.removeFullRows(game.board);
			game.fastFall = false;
		}
	}
}

// Rotates the current piece counter-clockwise.
// @param game The game model.
function rotateLeft(game) {
	const { curPiece, board, gameState } = game;
	if (gameState === GameStates.Running) {
		if (curPiece) {
			Board.movePiece(board, curPiece, TetrisPiece.getRotateOp(false));
		}
	}
}

// Rotates the current piece clockwise.
// @param game The game model.
function rotateRight(game) {
	const { curPiece, board, gameState } = game;
	if (gameState === GameStates.Running) {
		if (curPiece) {
			Board.movePiece(board, curPiece, TetrisPiece.getRotateOp(true));
		}
	}
}

// Clears progress and moves the game to the starting state.
// @param game The game model.
function startGame(game) {
	if (GameStates.Running !== game.gameState) {
		game.gameState = GameStates.Running;
		resetProgress(game);
	}
}

// Moves the game to the stopped state.
// @param game The game model.
function stopGame(game) {
	game.gameState = GameStates.Stopped;
	game.fastFall = false;
}

function setFastDrop(game, value) {
	game.fastFall = value && (GameStates.Running === game.gameState);
}

// Cheats the game by removing the bottom row of the board.
// @param game The game model.
function cheat(game) {
	const { remCheats, board, curPiece, score } = game;
	if (remCheats > 0) {
		// Remove the falling piece from the board before removing the bottom row, as all rows will move.
		if (curPiece)
			Board.putPiece(board, curPiece, false);
		
		if (Board.cheat(board, board.rows.length - 1)) {
			game.remCheats = remCheats - 1;
			game.score = Math.max(0, score - CheatPenalty);
		}
		
		// Restore the falling piece.
		if (curPiece)
			Board.putPiece(board, curPiece, curPiece.colorIndex);
	}
}

export {
	GameStates,
	advance,
	cheat,
	create,
	moveLeft,
	moveRight,
	rotateLeft,
	rotateRight,
	setFastDrop,
	startGame,
	stopGame
};