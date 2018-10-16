import {combineReducers} from 'redux'
import screen from './screen'
import wallet from './wallet'
import accounts from './accounts'

const walletStore = combineReducers({
    screen,
    wallet,
    accounts
});

export default walletStore
