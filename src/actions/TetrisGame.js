import { createSlice } from '@reduxjs/toolkit';
import * as TetrisGame from '../models/TetrisGame.js';

// TODO: Pass board dimensions from React component props.
const slice = createSlice({
	name: 'reactris',
	initialState: TetrisGame.create(),
	reducers: {
		startGame: TetrisGame.startGame,
		stopGame: TetrisGame.stopGame,
		moveLeft: TetrisGame.moveLeft,
		moveRight: TetrisGame.moveRight,
		rotateLeft: TetrisGame.rotateLeft,
		rotateRight: TetrisGame.rotateRight,
		advance: TetrisGame.advance,
		setFastDrop: (state, action) => TetrisGame.setFastDrop(state, action.payload)
	}
});

// Export Redux actions.
export const {
	startGame,
	stopGame,
	moveLeft,
	moveRight,
	rotateLeft,
	rotateRight,
	advance,
	setFastDrop
} = slice.actions;

// Export the reducer.
export const reducer = slice.reducer;