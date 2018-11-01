import {store} from '../index';
import NetHelper from "../helpers/NetHelper";
import { networks } from '../constants/networks'
import { ScreenNames } from '../reducers/screen'
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

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
    'LOG_OUT': 'LOG_OUT',
    'SIGN_IN': 'SIGN_IN',
    'CHANGE_SCREEN': 'CHANGE_SCREEN',
    'GO_BACK_SCREEN': 'GO_BACK_SCREEN'
};

export const PageActions = {
    changeScreen: (screenName) => ({
        type: ActionsList.CHANGE_SCREEN,
        payload: screenName
    }),
    goBackScreen: () => ({
        type: ActionsList.GO_BACK_SCREEN
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
    logOut: () => ({
        type: ActionsList.LOG_OUT
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
            let result = null;
            if (networks[networkName]) {
                result = await NetHelper.getBalance(accountAddress, networkName);
            } else {
                console.log('else');
                const provider = new HDWalletProvider('', networkName);
                const web3 = new Web3(provider);

                result = await web3.eth.getBalance(accountAddress);
                console.log('result', result);
                result = web3.utils.fromWei(result, 'ether');
            }
            const balance = result;
            store.dispatch(PageActions.updateBalanceCallback({balance}));
        };

        console.log('getBalance', networks[networkName]);
        getBalanceRequest();

        return {type: ActionsList.GET_BALANCE}
    }
};
