import { ActionsList } from '../actions';
import { createStoredReducer } from '../models/StoredReducer';

const initialState = {
    requests: [],
    requestIndex: 0
};

const requests = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.ADD_REQUEST: {
            console.log('try to add request ', action.payload);
            const requests = state.requests.concat([action.payload]);
            const lastIndex = requests.length - 1;
            return Object.assign(
                {},
                state,
                {requests, requestIndex: lastIndex}
            );
        }
        case ActionsList.DECLINE_REQUEST: {
            const requests = state.requests.concat();
            requests.splice(state.requestIndex, 1);
            let requestIndex = state.requestIndex;
            if (requestIndex > 0) {
                requestIndex--;
            }
            return Object.assign(
                {},
                state,
                {requests, requestIndex}
            );
        }
        case ActionsList.CHANGE_REQUEST: {
            return Object.assign(
                {},
                state,
                {requestIndex: action.payload}
            );
        }
        default:
            return state
    }
}, 'requests', initialState);

export default requests;