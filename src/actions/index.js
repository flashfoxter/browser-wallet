import {store} from '../index';
import NetHelper from "../helpers/NetHelper";

export const ActionsList = {
    'CONNECT_TO_NETWORK': 'CONNECT_TO_NETWORK',
    'DISCONNECT': 'DISCONNECT',
    'GET_BALANCE': 'GET_BALANCE',
    'UPDATE_BALANCE_CALLBACK': 'UPDATE_BALANCE_CALLBACK',
    'SEND_TRANSACTION': 'SEND_TRANSACTION',
    'GET_HISTORY': 'GET_HISTORY',
    'SIGN_UP': 'SIGN_UP',
    'SIGN_IN': 'SIGN_IN',
    'CHANGE_SCREEN': 'CHANGE_SCREEN'
};

export const PageActions = {
    changeScreen: (screenName) => ({
        type: screenName
    }),
    connectToNetwork: (payload) => ({
        type: ActionsList.CONNECT_TO_NETWORK,
        payload
    }),
    disconnect: () => ({
        type: ActionsList.DISCONNECT
    }),
    updateBalanceCallback: (payload) => ({
        type: ActionsList.UPDATE_BALANCE_CALLBACK,
        payload
    }),
    signUp: (payload) => ({
        type: ActionsList.SIGN_UP,
        payload
    }),
    signIn: (payload) => ({
        type: ActionsList.SIGN_IN,
        payload
    }),
    getBalance() {
        const {networkName} = store.getState().wallet;
        const {currentAccounts, accountIndex} = store.getState().accounts;
        const accountAddress = currentAccounts[accountIndex];

        const getBalanceRequest = async () => {
            const result = await NetHelper.getBalance(accountAddress, networkName);
            const balance = parseFloat(result);
            store.dispatch(PageActions.updateBalanceCallback({balance}));
        };
        getBalanceRequest();
        return {type: ActionsList.GET_BALANCE}
    }
};
