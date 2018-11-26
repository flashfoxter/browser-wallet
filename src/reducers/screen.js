import { ActionsList } from '../actions';
import { WorkMode } from '../constants/mode';
import { createStoredReducer } from '../models/StoredReducer';

export const ScreenNames = {
    'SIGN_IN_SCREEN': 'SIGN_IN_SCREEN',
    'SIGN_UP_CHOOSE_TYPE': 'SIGN_UP_CHOOSE_TYPE',
    'SIGN_UP_MNEMONIC': 'SIGN_UP_MNEMONIC',
    'SIGN_UP_KEYS': 'SIGN_UP_KEYS',
    'MAIN_SCREEN': 'MAIN_SCREEN',
    'ABOUT_SCREEN': 'ABOUT_SCREEN',
    'SEND_SCREEN': 'SEND_SCREEN',
    'CONTRACT_SCREEN': 'CONTRACT_SCREEN',
    'REQUEST_SCREEN': 'REQUEST_SCREEN'
};

const initialState = {
    currentScreen: window.work_mode === WorkMode.proxy ? ScreenNames.REQUEST_SCREEN : ScreenNames.SIGN_IN_SCREEN,
    screenHistory: [],
    currentScreenData: {}
};

const MAX_HISTORY_LENGTH = 3;

const storageKey = window.work_mode === WorkMode.proxy ? 'screenProxy' : 'screen';

const screen = createStoredReducer((state, action) => {
    switch (action.type) {
        case ActionsList.SAVE_CURRENT_SCREEN_STATE: {
            return Object.assign(
                    {},
                    state,
                    {currentScreenData: {screenName: state.currentScreen, data: action.payload}}
                );
        }
        case ActionsList.CHANGE_SCREEN: {
                const screenHistory = state.screenHistory.concat([state.currentScreen]);
                if (screenHistory.length > MAX_HISTORY_LENGTH) {
                    screenHistory.shift();
                }
                const currentScreenData = null;
                return Object.assign({}, state, {currentScreen: action.payload, screenHistory, currentScreenData});
            }
        case ActionsList.GO_BACK_SCREEN: {
                if (state.screenHistory) {
                    const currentScreenData = null;
                    const screenHistory = state.screenHistory.concat();
                    const currentScreen = screenHistory.pop();
                    return Object.assign({}, state, {currentScreen, screenHistory, currentScreenData});
                }
                return state;
            }
        case ActionsList.SIGN_UP:
        case ActionsList.SIGN_IN:
            const screenName = window.work_mode === WorkMode.proxy
                ? ScreenNames.REQUEST_SCREEN
                : ScreenNames.MAIN_SCREEN;

            return Object.assign({}, state, {screenHistory: [], currentScreen: screenName});
        case ActionsList.LOG_OUT:
            return Object.assign({}, state, {screenHistory: [], currentScreen: ScreenNames.SIGN_IN_SCREEN});
        default:
            return state
    }
}, storageKey, initialState);

export default screen;