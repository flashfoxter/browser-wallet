import { ActionsList } from '../actions';
import { createStoredReducer } from '../models/StoredReducer';

const initialState = {
    requests: [],
    requestIndex: 0
};

const requests = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.ADD_REQUEST: {
            const requests = state.requests.concat([action.payload]);
            const lastIndex = requests.length - 1;
            return Object.assign(
                {},
                state,
                {requests, requestIndex: lastIndex}
            );
        }
        default:
            return state
    }
}, 'requests', initialState);

export default requests;