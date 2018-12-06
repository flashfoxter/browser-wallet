import { ActionsList } from '../actions';
import AuthHelper from '../helpers/AuthHelper';
import { streamConfig } from '../index';
import { createStoredReducer } from '../models/StoredReducer';

const initialState = {
    currentLogin: '',
    currentAccounts: [],
    accountIndex: 0
};

const accounts = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.CHANGE_ACCOUNT:
            const {accountIndex} = action.payload;

            try {
                streamConfig.sendConfigChanges({accountIndex});
            } catch(e) {
                console.log('error while send config');
            }

            return Object.assign({}, state, {accountIndex});

        case ActionsList.SIGN_UP:
            const {login, password, mnemonic, accounts, account} = action.payload;

            try {
                streamConfig.sendConfigChanges({currentAccounts: accounts, accountIndex: 0});
            } catch(e) {
                console.log('error while send config');
            }

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
            try {
                streamConfig.sendConfigChanges({currentAccounts: [], accountIndex: 0});
            } catch(e) {
                console.log('error while send config');
            }

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

                try {
                    streamConfig.sendConfigChanges({currentAccounts: accounts, accountIndex: 0});
                } catch(e) {
                    console.log('error while send config');
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

            }
        default:
            return state
    }
}, 'accounts', initialState);

export default accounts
