import {ActionsList} from "../actions";

export const ScreenNames = {
    'SIGN_IN_SCREEN': 'SIGN_IN_SCREEN',
    'SIGN_UP_CHOOSE_TYPE': 'SIGN_UP_CHOOSE_TYPE',
    'SIGN_UP_MNEMONIC': 'SIGN_UP_MNEMONIC',
    'SIGN_UP_KEYS': 'SIGN_UP_KEYS',
    'MAIN_SCREEN': 'MAIN_SCREEN'
};

const screen = (state = ScreenNames.SIGN_IN_SCREEN, action) => {
    switch (action.type) {
        case ActionsList.SIGN_UP:
        case ActionsList.SIGN_IN:
            return ScreenNames.MAIN_SCREEN;
        case ScreenNames.SIGN_IN_SCREEN:
        case ScreenNames.SIGN_UP_MNEMONIC:
        case ScreenNames.SIGN_UP_CHOOSE_TYPE:
        case ScreenNames.MAIN_SCREEN:
            return action.type;
        default:
            return state
    }
};

export default screen;