const PortStream = require('extension-port-stream');
import extension from 'extensionizer';
import {StreamObjectWrapper} from './models/StreamObjectWrapper';

const extensionPort = extension.runtime.connect({ name: 'notification' });
const connectionStream = new StreamObjectWrapper(new PortStream(extensionPort), 'notificationStream');

connectionStream.on('openPopup', data => {
    const eventsEl = document.getElementById('events');
    const text = eventsEl.innerText;
    eventsEl.innerText = JSON.stringify(data)+'\n'+text;
});