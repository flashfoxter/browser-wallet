import PortStream from 'extension-port-stream';
import extension from 'extensionizer';
import {StreamObjectWrapper} from './models/StreamObjectWrapper';

export class StreamActoionsController {
    constructor() {
        const extensionPort = extension.runtime.connect({ name: 'notification' });
        this.connectionStream = new StreamObjectWrapper(new PortStream(extensionPort), 'notificationStream');
    }

    setupEvents() {

    }
}