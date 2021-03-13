/**
 * Specifies the bindable input actions.
 */
export const InputActions = {
	startGame: 0,
	stopGame: 1,
	fastDrop: 2,
	moveLeft: 3,
	moveRight: 4,
	rotateLeft: 5,
	rotateRight: 6,
	cheat: 7
};

export class KeyBindings {
	// Default bindings.
	startGame = ' ';
	stopGame = 'Escape';
	fastDrop = 'ArrowDown';
	moveLeft = 'ArrowLeft';
	moveRight = 'ArrowRight';
	rotateLeft = ['z', 'Z'];
	rotateRight = ['x', 'X'];
	cheat = ['a', 'A'];

	/**
	 * Resolves a key to its bound action.
	 * @param {string} key Identifies a pressed key.
	 * @returns One of the `InputActions` values or `null` if the key is not bound to an action.
	 */
	resolveAction(key) {
		for (const actionName in InputActions) {
			const binding = this[actionName];
			if (typeof binding === 'string') {
				if (binding === key)
					return InputActions[actionName];
			}
			else if (binding.indexOf(key) >= 0) // Assume array bindings.
				return InputActions[actionName];
		}

		return null;
	}
}
