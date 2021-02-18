import { bindActionCreators } from '@reduxjs/toolkit';
import { store, slice } from '../redux';

export const {
	startGame,
	stopGame,
	moveLeft,
	moveRight,
	rotateLeft,
	rotateRight,
	advance,
	cheat,
	setFastDrop
} = bindActionCreators(slice.actions, store.dispatch);