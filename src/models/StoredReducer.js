const CACHE_REDUCER_KEY = 'reducer:';

export const createStoredReducer = (reducer, reducerName, initialState) => {
    const key = CACHE_REDUCER_KEY + reducerName;
    return (state, action) => {

        if (state === undefined) {
            let storedInitialState = localStorage.getItem(key);
            if (!storedInitialState) {
                storedInitialState = initialState;
            } else {
                try {
                    storedInitialState = JSON.parse(storedInitialState);
                } catch(e) {
                    storedInitialState = initialState;
                }
            }

            return storedInitialState;
        } else {
            let newState = reducer(state, action);
            const stateChanged = state !== newState;

            if (stateChanged) {
                console.log('updateReducer state', stateChanged, reducerName, action);
                localStorage.setItem(key, JSON.stringify(newState));
            }

            return newState;
        }

    }
}