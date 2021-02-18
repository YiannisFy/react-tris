import { createSlice, configureStore } from '@reduxjs/toolkit';
import * as TetrisGame from './models/TetrisGame';

// TODO: Pass board dimensions from React component props.
export const slice = createSlice({
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
		cheat: TetrisGame.cheat,
		setFastDrop: (state, action) => TetrisGame.setFastDrop(state, action.payload)
	}
});

export const store = configureStore({reducer: {reactris: slice.reducer}});

export const reducer = slice.reducer;