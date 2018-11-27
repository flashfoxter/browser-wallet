import PortStream from 'extension-port-stream';
import extension from 'extensionizer';
import { PageActions } from '../actions';
import {StreamObjectWrapper} from '../models/StreamObjectWrapper';
import { store } from '../index';
import { ScreenNames } from '../reducers/screen';

export class StreamActionsController {
    constructor(store) {
        const extensionPort = extension.runtime.connect({ name: 'notification' });
        this.store = store;
        this.connectionStream = new StreamObjectWrapper(new PortStream(extensionPort), 'notificationStream');
        this.setupEvents();
    }

    setupEvents() {
        this.connectionStream.on('addMessage', this.addMessage.bind(this));
    }

    addMessage(request) {
        console.log('I get request for transaction', request);
        store.dispatch(PageActions.addRequest(request));
        const {currentLogin} = store.getState().accounts;
        const {currentScreen} = store.getState().screen;
        if (currentLogin) {
            if (currentScreen !== ScreenNames.REQUEST_SCREEN) {
                PageActions.changeScreen(ScreenNames.REQUEST_SCREEN);
            }
        } else {
            if (currentScreen !== ScreenNames.SIGN_IN_SCREEN) {
                PageActions.changeScreen(ScreenNames.SIGN_IN_SCREEN);
            }
        }
    }
}