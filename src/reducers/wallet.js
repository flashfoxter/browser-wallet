import {ActionsList} from '../actions';
import {ScreenNames} from "./screen";
const initialState = {
    isConnected: false,
    web3: null,
    networkName: 'rinkeby',
    balance: 0,
    sendTransactionProgress: false,
    getHistoryProgress: false
};

const wallet = (state = initialState, action) => {
    switch (action.type) {
        case ActionsList.UPDATE_BALANCE_CALLBACK:
        case ActionsList.CONNECT_TO_NETWORK:
            return Object.assign({}, state, action.payload);
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
}

export default wallet
