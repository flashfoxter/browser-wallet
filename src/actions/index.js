import {store} from '../index';
import NetHelper from "../helpers/NetHelper";
import { networks } from '../constants/networks'

export const ActionsList = {
    'CONNECT_TO_NETWORK': 'CONNECT_TO_NETWORK',
    'DISCONNECT': 'DISCONNECT',
    'GET_BALANCE': 'GET_BALANCE',
    'UPDATE_BALANCE_CALLBACK': 'UPDATE_BALANCE_CALLBACK',
    'UPDATE_NETWORK_ITEMS': 'UPDATE_NETWORK_ITEMS',
    'CHANGE_NETWORK': 'CHANGE_NETWORK',
    'CHANGE_ACCOUNT': 'CHANGE_ACCOUNT',
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
    updateNetworkItems: (payload) => ({
        type: ActionsList.UPDATE_NETWORK_ITEMS,
        payload
    }),
    changeNetwork: (payload) => ({
        type: ActionsList.CHANGE_NETWORK,
        payload
    }),
    changeAccount: (payload) => ({
        type: ActionsList.CHANGE_ACCOUNT,
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

        console.log('getBalance', networks[networkName]);
        if (networks[networkName]) {
            getBalanceRequest();
        }

        return {type: ActionsList.GET_BALANCE}
    }
};
