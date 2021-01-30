import Board from './Board.js';
import TetrisPiece from './TetrisPiece.js';

const GameStates = {
	Stopped: 0,
	Running: 1
};

// Internal game operations.
const TetrisGame = {
	// Creates a new game state.
	// @return The new game model.
	create: () => {
		return {
			curPiece: null,
			board: Board.create(),
			score: 0,
			gameState: GameStates.Stopped,
			// Whether the falling piece is falling fast.
			fastFall: false
		};
	},

	// Resets the game board & score.
	// @param game The game model.
	resetProgress: game => {
		game.curPiece = null;
		Board.reset(game.board);
		game.score = 0;
		game.fastFall = false;
	},

	// Permanently places the current piece on the board.
	// @param game The game model.
	settleCurrentPiece: game => {
		game.curPiece = null;
	},

	hasCurrentPiece: game => {
		return !!game.curPiece;
	},

	// Spawns a random piece on the board.
	// @param game The game model.
	// @return Whether the piece can be placed on the board.
	spawnPiece: game => {
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
	},

	// Moves the current piece down one step.
	// @param game The game model.
	// @return Whether the movement was possible.
	moveDown: game => {
		const { curPiece, board } = game;
		if (curPiece) {
			return Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 1, cols: 0}));
		}
		return false;
	},

	// Public API.

	// Attempts to move the current piece one column to the left.
	// @param game The game model.
	moveLeft: game => {
		const { curPiece, board, gameState } = game;
		if (gameState === GameStates.Running) {
			if (curPiece) {
				Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 0, cols: -1}));
			}
		}
	},

	// Attempts to move the current piece one column to the right.
	// @param game The game model.
	moveRight: game => {
		const { curPiece, board, gameState } = game;
		if (gameState === GameStates.Running) {
			if (curPiece) {
				Board.movePiece(board, curPiece, TetrisPiece.getTranslateOp({rows: 0, cols: 1}));
			}
		}
	},

	// Performs the next game step.
	// @param game The game model.
	advance: (game) => {
		if (game.gameState === GameStates.Running) {
			const { fastFall } = game;

			if (!game.curPiece) {
				TetrisGame.spawnPiece(game) || TetrisGame.stopGame(game);
			}
			else if (TetrisGame.moveDown(game)) {
				// Moved the falling piece down. Give a point for fast falling.
				if (fastFall)
					game.score++;
			}
			else if (!TetrisGame.moveDown(game)) {
				// Cannot move down, so we fix the piece in place and remove any full rows.
				TetrisGame.settleCurrentPiece(game);
				game.score += 10 * Board.removeFullRows(game.board);
				game.fastFall = false;
			}
		}
	},

	// Rotates the current piece counter-clockwise.
	// @param game The game model.
	rotateLeft: game => {
		const { curPiece, board, gameState } = game;
		if (gameState === GameStates.Running) {
			if (curPiece) {
				Board.movePiece(board, curPiece, TetrisPiece.getRotateOp(false));
			}
		}
	},

	// Rotates the current piece clockwise.
	// @param game The game model.
	rotateRight: game => {
		const { curPiece, board, gameState } = game;
		if (gameState === GameStates.Running) {
			if (curPiece) {
				Board.movePiece(board, curPiece, TetrisPiece.getRotateOp(true));
			}
		}
	},

	// Clears progress and moves the game to the starting state.
	// @param game The game model.
	startGame: game => {
		if (GameStates.Running !== game.gameState) {
			game.gameState = GameStates.Running;
			TetrisGame.resetProgress(game);
		}
	},

	// Moves the game to the stopped state.
	// @param game The game model.
	stopGame: game => {
		game.gameState = GameStates.Stopped;
		game.fastFall = false;
	},

	setFastDrop: (game, value) => {
		game.fastFall = value && (GameStates.Running === game.gameState);
	}
};

export default TetrisGame;
export { GameStates };