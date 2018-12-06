import PortStream from 'extension-port-stream';
import extension from 'extensionizer';
import {StreamObjectWrapper} from '../models/StreamObjectWrapper';

export class StreamConfigController {
    constructor() {
        const extensionPort = extension.runtime.connect({ name: 'config' });
        this.connectionStream = new StreamObjectWrapper(new PortStream(extensionPort), 'configStream');
    }

    sendConfigChanges(changes) {
        this.connectionStream.emit('configChange', changes);
    }
}