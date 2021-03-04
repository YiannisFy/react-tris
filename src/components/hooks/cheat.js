import { useBoardlessState } from './gameState';
import { getGameActions } from '../../actions/TetrisGame';

/**
 * Retrieves the cheat action and number of times left to cheat.
 * @param {string} gameId Identifies the game.
 * @return {{remCheats: number, cheat: () => void}} An object with the number of remaining cheat attempts and the function performing the cheat action.
 */
export function useCheat(gameId) {
    const {remCheats} = useBoardlessState(gameId)
    return {
        remCheats,
        cheat: getGameActions(gameId).cheat
    };
}