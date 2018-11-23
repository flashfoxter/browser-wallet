import { ActionsList } from '../actions';
import { createStoredReducer } from '../models/StoredReducer';

const initialState = {
    requests: []
};

const requests = createStoredReducer((state, action) => {
    switch (action.type) {
        default:
            return state
    }
}, 'requests', initialState);

export default requests