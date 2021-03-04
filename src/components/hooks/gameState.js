import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getGameActions } from '../../actions/TetrisGame';
import { create, createBoard } from '../../models/TetrisGame';
import { getSlice } from '../../redux/TetrisGame';

/**
 * Selects/creates the state of the specified game without enforcing the board to be created.
 * @param {string} gameId Identifies the game instance.
 * @returns The game state without guarantees that the board has been created.
 */
export function useBoardlessState(gameId="") {
    // Select the state.
    let gState = useSelector(state => state[`reactris-${gameId}`]);
    const initGame = !gState;

    useEffect(() => {
        // If the game does not exist, create a Redux slice for it.
        if (initGame)
            getSlice(gameId);
    }, [initGame, gameId]);

    // Surrogate state for until Redux slice has been initialized (next render).
    // NOTE: Must be identical to the slice created in the effect below.
    if (!gState)
        gState = create(gameId);

    return gState;
}

/**
 * Selects/creates the state of the specified game and ensures that the game board has been created.
 * @param {string} gameId Game identifier. Used to look up the game state.
 * @param {number?} nrRows The number of block rows in the game board (default is 25).
 * @param {number?} nrCols The number of block columns in the game board (default is 10).
 * @returns {object} The game state.
 */
export function useGameState(gameId="", nrRows = 25, nrCols = 10) {
    let gState = useBoardlessState(gameId)
    const initBoard = !gState.board;

    // Surrogate for missing board data.
    // NOTE: Must be identical to the data created by the "createBoard" Redux action in the effect below.
    // TODO: Consider eliminating double model creation by passing the new board as payload to the action.
    if (initBoard) {
        gState = {
            ...gState,
        };
        createBoard(gState, nrRows, nrCols);
    }

    useEffect(() => {
        if (initBoard) {
            const {createBoard: createBoardAction} = getGameActions(gameId);
            createBoardAction({nrRows, nrCols});
        }
    }, [initBoard, gameId, nrRows, nrCols]);

    return gState;
}
