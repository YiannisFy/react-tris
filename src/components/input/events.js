import { InputActions } from './bindings';

// Input event handlers.

export function onClick(evt, gameActions) {
	gameActions.startGame();

	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

export function onKeyUp(evt, gameActions, bindings) {
	let handled = true;
	switch (bindings.resolveAction(evt.key)) {
		case InputActions.fastDrop:
			gameActions.setFastDrop(false);
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

export function onKeyDown(evt, gameActions, bindings) {
	let handled = true;
	switch (bindings.resolveAction(evt.key)) {
		case InputActions.stopGame:
			gameActions.stopGame();
			break;
		case InputActions.fastDrop:
			gameActions.setFastDrop(true);
			break;
		case InputActions.moveLeft:
			gameActions.moveLeft();
			break;
		case InputActions.moveRight:
			gameActions.moveRight();
			break;
		case InputActions.rotateLeft:
			gameActions.rotateLeft();
			break;
		case InputActions.rotateRight:
			gameActions.rotateRight();
			break;
		case InputActions.cheat:
			gameActions.cheat();
			break;
		case InputActions.startGame:
			gameActions.startGame();
			break;
		default:
			// We handle this to avoid having the page scroll up while playing.
			if ('ArrowUp' !== evt.key)
				handled = false;
			break;
	}

	if (handled) {
		evt.preventDefault();
		evt.stopPropagation();
	}
	return !handled;
}