import {ActionsList} from "../actions";
import {createStoredReducer} from '../models/StoredReducer';

export const ScreenNames = {
    'SIGN_IN_SCREEN': 'SIGN_IN_SCREEN',
    'SIGN_UP_CHOOSE_TYPE': 'SIGN_UP_CHOOSE_TYPE',
    'SIGN_UP_MNEMONIC': 'SIGN_UP_MNEMONIC',
    'SIGN_UP_KEYS': 'SIGN_UP_KEYS',
    'MAIN_SCREEN': 'MAIN_SCREEN',
    'SEND_SCREEN': 'SEND_SCREEN'
};

const screen = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.SIGN_UP:
        case ActionsList.SIGN_IN:
            return ScreenNames.MAIN_SCREEN;
        case ActionsList.LOG_OUT:
            return ScreenNames.SIGN_IN_SCREEN;
        case ScreenNames.SIGN_IN_SCREEN:
        case ScreenNames.SIGN_UP_MNEMONIC:
        case ScreenNames.SEND_SCREEN:
        case ScreenNames.SIGN_UP_CHOOSE_TYPE:
        case ScreenNames.MAIN_SCREEN:
            return action.type;
        default:
            return state
    }
}, 'screen', ScreenNames.SIGN_IN_SCREEN);

export default screen;