import { ActionsList, PageActions } from '../actions'
import {ScreenNames} from "./screen";
import {createStoredReducer} from '../models/StoredReducer';

const initialState = {
    isConnected: false,
    web3: null,
    networkName: 'rinkeby',
    networksItems: null,
    balance: 0,
    sendTransactionProgress: false,
    getHistoryProgress: false
};

const wallet = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.UPDATE_BALANCE_CALLBACK:
        case ActionsList.CONNECT_TO_NETWORK:
            return Object.assign({}, state, action.payload);
        case ActionsList.UPDATE_NETWORK_ITEMS:
            return Object.assign({}, state, {networksItems: action.payload});
        case ActionsList.CHANGE_NETWORK:
            return Object.assign({}, state, {networkName: action.payload});
        case ActionsList.DISCONNECT:
            return Object.assign(
                    {},
                    state,
                    {
                        isConnected: false,
                        web3: null,
                        balance: 0,
                        accountAddress: ''
                    }
                );
        default:
            return state
    }
}, 'wallet', initialState);

export default wallet
