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
            const {login, password, mnemonic, accounts, account} = action.payload;
            if (mnemonic) {
                AuthHelper.addUserToStorage(login, password, mnemonic);
            } else {
                AuthHelper.addUserToStorage(login, password, account);
            }
            return Object.assign(
                {},
                state,
                {
                    currentLogin: login,
                    currentAccounts: accounts,
                    accountIndex: 0
                }
            );
        case ActionsList.LOG_OUT:
            return Object.assign(
                {},
                state,
                {
                    currentLogin: '',
                    currentAccounts: [],
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
