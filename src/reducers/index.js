import { combineReducers } from 'redux';
import { WorkMode } from '../constants/mode';
import accounts from './accounts';
import screen from './screen';
import wallet from './wallet';
import requests from './requests';

const reducers = {
    screen,
    wallet,
    accounts
};

if (window.work_mode === WorkMode.proxy) {
    reducers.requests = requests;
}

const walletStore = combineReducers(reducers);

export default walletStore
