import { useEffect } from 'react';
import { create, createBoard } from '../../models/TetrisGame';
import { useLazySliceState } from '../../redux/lazySlice';
import { attachSlice, detachSlice, getSlice } from '../../redux/TetrisGame';

function useGameSlice(gameId) {
    // Ensure there is a slice instance without waiting for the side effect to run.
    const slice = getSlice(gameId);

    useEffect(() => {
        attachSlice(gameId);
        return () => { detachSlice(gameId); }
    }, [gameId]);
    return slice;
}

/**
 * Selects/creates the state of the specified game without enforcing the board to be created.
 * @param {string} gameId Identifies the game instance.
 * @returns The game state without guarantees that the board has been created.
 */
export function useBoardlessState(gameId="") {
    const slice = useGameSlice(gameId);
    return useLazySliceState(slice, sliceState => sliceState || create(gameId));
}

/**
 * Selects/creates the state of the specified game and ensures that the game board has been created.
 * @param {string} gameId Game identifier. Used to look up the game state.
 * @param {number?} nrRows The number of block rows in the game board (default is 25).
 * @param {number?} nrCols The number of block columns in the game board (default is 10).
 * @returns {object} The game state.
 */
export function useGameState(gameId="", nrRows = 25, nrCols = 10) {
    const slice = useGameSlice(gameId);
    return useLazySliceState(slice, gState =>  {
        if (!gState) gState = create(gameId);
        else if (!gState.board) {
            gState = {...gState};
            createBoard(gState, nrRows, nrCols);
        }
        return gState;
    })
}
