import HDWalletProvider from '../libs/truffle-hdwallet-provider';
import Web3 from 'web3';
import { networks } from '../constants/networks';
import NetHelper from '../helpers/NetHelper';
import { store } from '../index';

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
            let result = 0;
            let isConnected = true;
            if (networks[networkName]) {
                result = await NetHelper.getBalance(accountAddress, networkName);
            } else {

                try {
                    const provider = new HDWalletProvider('', networkName);
                    await provider.engineStartPromise;
                    const web3 = new Web3(provider);
                    provider.engine.on('error', (e) => console.log('err', e));

                    result = await web3.eth.getBalance(accountAddress);
                    provider.engine.stop();

                    result = web3.utils.fromWei(result, 'ether');
                } catch(e) {
                    console.log('error while connect', e);
                    isConnected = false;
                }
            }
            const balance = result;
            store.dispatch(PageActions.updateBalanceCallback({balance, isConnected}));
        };

        getBalanceRequest();

        return {type: ActionsList.GET_BALANCE}
    }
};
