import {ActionsList} from '../actions';
import AuthHelper from '../helpers/AuthHelper';
import {createStoredReducer} from '../models/StoredReducer';

const initialState = {
    currentLogin: '',
    currentAccounts: [],
    accountIndex: 0
};

const accounts = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.CHANGE_ACCOUNT:
            const {accountIndex} = action.payload;
            return Object.assign({}, state, {accountIndex});

        case ActionsList.SIGN_UP:
            const {login, password, mnemonic, accounts} = action.payload;
            AuthHelper.addUserToStorage(login, password, mnemonic);
            return Object.assign(
                {},
                state,
                {
                    currentLogin: login,
                    currentAccounts: accounts,
                    accountIndex: 0
                }
            );
        case ActionsList.SIGN_IN: {
                const {login, accounts} = action.payload;
                return Object.assign(
                    {},
                    state,
                    {
                        currentLogin: login,
                        currentAccounts: accounts,
                        accountIndex: 0
                    }
                );

            }
        default:
            return state
    }
}, 'accounts', initialState);

export default accounts
