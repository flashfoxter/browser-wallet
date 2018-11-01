import { ActionsList } from '../actions';
import { createStoredReducer } from '../models/StoredReducer';

export const ScreenNames = {
    'SIGN_IN_SCREEN': 'SIGN_IN_SCREEN',
    'SIGN_UP_CHOOSE_TYPE': 'SIGN_UP_CHOOSE_TYPE',
    'SIGN_UP_MNEMONIC': 'SIGN_UP_MNEMONIC',
    'SIGN_UP_KEYS': 'SIGN_UP_KEYS',
    'MAIN_SCREEN': 'MAIN_SCREEN',
    'ABOUT_SCREEN': 'ABOUT_SCREEN',
    'SEND_SCREEN': 'SEND_SCREEN'
};

const initialState = {
    currentScreen: ScreenNames.SIGN_IN_SCREEN,
    screenHistory: []
};

const MAX_HISTORY_LENGTH = 3;

const screen = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.CHANGE_SCREEN: {
                const screenHistory = state.screenHistory.concat([state.currentScreen]);
                if (screenHistory.length > MAX_HISTORY_LENGTH) {
                    screenHistory.shift();
                }
                return Object.assign({}, state, {currentScreen: action.payload, screenHistory});
            }
        case ActionsList.GO_BACK_SCREEN: {
                if (state.screenHistory) {
                    const screenHistory = state.screenHistory.concat();
                    const currentScreen = screenHistory.pop();
                    return Object.assign({}, state, {currentScreen, screenHistory});
                }
                return state;
            }
        case ActionsList.SIGN_UP:
        case ActionsList.SIGN_IN:
            return Object.assign({}, state, {screenHistory: [], currentScreen: ScreenNames.MAIN_SCREEN});
        case ActionsList.LOG_OUT:
            return Object.assign({}, state, {screenHistory: [], currentScreen: ScreenNames.SIGN_IN_SCREEN});
        default:
            return state
    }
}, 'screen', initialState);

export default screen;