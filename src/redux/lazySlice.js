import { useSelector } from "react-redux";

// TODO: This functionality really begs to be implemented as a middleware...

/**
 * Returns the Redux state for a slice, lazily initialized/filled-in by <code>lazyReducer</code>.
 * NOTES:
 * Multiple stores are not supported, as the lazy state resides in the slice object.
 * This hook is incompatible with any <code>useSelector</code> depending on the slice state, as the slice state is not updated until a slice action occurs.
 * For the same reason, we cannot have reducers affecting the slice data without using the slice.reducer method, which is aware of the extra lazy state in the slice.
 * Also, if this hook is used multiple times, the <code>lazyReducer</code> functions must generate equivalent states independently of their invocation order.
 * E.g. a lazy reducer initializing more-specific parts of the slice state must ensure that the lazy reducers that create the outer parts are also called.
 * @param {*} slice The Redux slice.
 * @param {(any) => any} lazyReducer A reducer for lazily populating the slice state.
 */
export function useLazySliceState(slice, lazyReducer) {
    const state = useSelector(state => state[slice.name]);
    const oldState = slice.lazyState || state;
    const newState = lazyReducer(oldState);
    if (newState !== oldState) {
        slice.lazyState = newState;
    }

    return newState;
}

/**
 * Replaces the slice reducer with a reducer that uses the lazily updated state when present.
 * NOTE: Multiple stores are not supported, as the lazy state resides in the slice object.
 * @param {*} slice The slice to decorate.
 */
export function lazifySlice(slice) {
    const sliceReducer = slice.reducer;
    slice.reducer = (sliceState, action) => {
        // When present, "lazyState" holds the most up-to-date state, so we are using this.
        const lazyState = slice.lazyState;
        if (lazyState !== undefined)   {
            slice.lazyState = undefined;
            sliceState = lazyState;
        }
        return sliceReducer(sliceState, action);
    };
}