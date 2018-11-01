import { combineReducers } from 'redux';
import accounts from './accounts';
import screen from './screen';
import wallet from './wallet';

const walletStore = combineReducers({
    screen,
    wallet,
    accounts
});

export default walletStore
