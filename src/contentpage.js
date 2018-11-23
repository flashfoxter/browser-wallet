import {StreamObjectWrapper} from './models/StreamObjectWrapper';
const extension = require('extensionizer');
const PortStream = require('extension-port-stream');
const LocalMessageDuplexStream = require('post-message-stream');
const injectContent = require('./../inject.js');
const Web3 = require('web3');

//const CDN_REQUIRE = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js';
//const CDN_WEB3 = 'https://cdn.jsdelivr.net/npm/web3@0.20.7/dist/web3.min.js';

class ContentController {
    constructor() {
        this.injectScript();
        this.setupStreams();
        this.isConnectedBackground = false;
    }

    async injectScript() {
        try {
            const container = document.head || document.documentElement;

            const inpageSuffix = '//# sourceURL=' + extension.extension.getURL('inject.js') + '\n';
            const content = injectContent.toString() + inpageSuffix;

            let scriptTag = document.createElement('script');
            scriptTag.setAttribute('async', false);
            scriptTag.textContent = content;
            container.insertBefore(scriptTag, container.children[0]);
            //container.removeChild(scriptTag);
        } catch (e) {
            console.error('Tiger wallet script injection failed', e)
        }
    }

    setupStreams () {
        this.inpageStream = new StreamObjectWrapper(new LocalMessageDuplexStream({
            name: 'tigercontent',
            target: 'tigerinpage'
        }), 'contentPageToInpage');

        this.inpageStream.on(
            'sendAsync',
            (requestData) => {
                this.retranslate('sendAsync', requestData);
            }
        );

        this.inpageStream.on(
            'send',
            (requestData) => {
                this.retranslate('send', requestData);
            }
        );
    }

    checkBackgroundConnection() {
        if (!this.isConnectedBackground) {
            const pluginPort = extension.runtime.connect({ name: 'tigercontent' });
            const pluginStream = new PortStream(pluginPort);
            this.backgroundStream = new StreamObjectWrapper(pluginStream, 'contentpageToBackend');
            this.isConnectedBackground = true;
            this.backgroundStream.on('disconnect', () => {
                this.isConnectedBackground = false;
            });
            this.backgroundStream.on('sendResponse', data => this.retranslateBack('sendResponse', data));
        }
    }

    retranslate(eventName, data) {
        this.checkBackgroundConnection();
        this.backgroundStream.emit(eventName, data);
    }

    retranslateBack(eventName, data) {
        console.log('retranslateBack');
        this.inpageStream.emit(eventName, data);
    }
}
const controller = new ContentController();