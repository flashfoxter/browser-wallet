import extension from 'extensionizer';
import NetHelper from './helpers/NetHelper';
import {StreamObjectWrapper} from './models/StreamObjectWrapper';
const PortStream = require('extension-port-stream');
import BackendProvider from './libs/proxy-web3/backend-provider';


const height = 640;
const width = 376;


class NotificationManager {
    showPopup () {
        this._getPopup((err, popup) => {
            if (err) throw err;

            // Bring focus to chrome popup
            if (popup) {
                // bring focus to existing chrome popup
                extension.windows.update(popup.id, { focused: true })
            } else {
                const cb = (currentPopup) => { this._popupId = currentPopup.id };
                // create new notification popup
                const creation = extension.windows.create({
                    url: 'notification.html',
                    type: 'popup',
                    width,
                    height,
                }, cb);
                creation && creation.then && creation.then(cb)
            }
        })
    }

    closePopup () {
        // closes notification popup
        this._getPopup((err, popup) => {
            if (err) throw err;
            if (!popup) return;
            extension.windows.remove(popup.id, console.error)
        })
    }

    _getPopup (cb) {
        this._getWindows((err, windows) => {
            if (err) throw err;
            cb(null, this._getPopupIn(windows))
        })
    }

    _getWindows (cb) {
        // Ignore in test environment
        if (!extension.windows) {
            return cb()
        }

        extension.windows.getAll({}, (windows) => {
            cb(null, windows)
        })
    }

    _getPopupIn (windows) {
        return windows ? windows.find((win) => {
            // Returns notification popup
            return (win && win.type === 'popup' && win.id === this._popupId)
        }) : null
    }

}


class BackgroundController {
    constructor() {
        this.notificationStream = null;
        this.contentpagesStreams = [];
        this.configStream = null;
        this.notificationManager = new NotificationManager();
        this.notificationIsOpen = false;
        this.initListeners();
        this.messagesForNotification = [];
        this.providerConfig = {
            networkName: '',
            currentAccounts: [],
            accountIndex: 0
        };
        this.readConfig();
        this.provider = null;
        this.requestIdMap = {};
        this.requestIdToStreamMap = {};
        this.requestIdToCallback = {};
        this.updateProviderInstance();
    }

    readConfig() {
        const prefix = 'reducer:';
        const walletStoreStr = localStorage.getItem(prefix + 'wallet');
        const accountsStoreStr = localStorage.getItem(prefix + 'accounts');
        if (walletStoreStr) {
            const walletStore = JSON.parse(walletStoreStr);
            this.providerConfig.networkName = walletStore.networkName;
        }
        if (accountsStoreStr) {
            const accountsStore = JSON.parse(accountsStoreStr);
            this.providerConfig.currentAccounts = accountsStore.currentAccounts;
            this.providerConfig.accountIndex = accountsStore.accountIndex;
        }
    }

    updateProviderInstance() {
        const {networkName, currentAccounts, accountIndex} = this.providerConfig;
        const accountAddress = currentAccounts.length ? currentAccounts[accountIndex] : '';
        let networkUri = NetHelper.getNetworkUri(networkName);

        if (networkUri) {
            if (this.provider) {
                this.provider.engine.stop();
            }
            this.provider = new BackendProvider(networkUri, [accountAddress], this.hookRetranslatedCall.bind(this));
        }
    }

    hookRetranslatedCall(name, data, callback, additionalData) {
        const request = {
            data,
            method: name,
            additionalData
        };

        this.requestIdToCallback[additionalData.requestId] = callback;
        this.requestIdMap[additionalData.requestId] = request;
        if (this.notificationStream) {
            this.notificationStream.emit('addMessage', request);
        } else {
            this.notificationManager.showPopup();
            this.messagesForNotification.push(request);
        }
    }

    initListeners() {
        extension.runtime.onConnect.addListener((remotePort) => this.connectRemote(remotePort));
    }

    connectRemote (remotePort) {
        const processName = remotePort.name;
        const portStream = new PortStream(remotePort);
        if (processName === 'tigercontent') {
            const stream = new StreamObjectWrapper(portStream, 'backendToContent');

            this.contentpagesStreams.push(stream);
            stream.on('disconnect', () => {
                this.contentpagesStreams = this.contentpagesStreams.filter(item => item.name !== stream.name);
                Object.keys(this.requestIdToStreamMap).map(
                    key => {
                        if (this.requestIdToStreamMap[key] === stream) {
                            delete this.requestIdToStreamMap[key];
                            delete this.requestIdToCallback[key];
                        }
                    }
                )
            });

            stream.on('sendAsync', data => {
                const {requestId, payload} = data;

                this.requestIdToStreamMap[requestId] = stream;
                this.provider.sendAsync(payload, (err, response) => {
                    stream.emit('sendResponse', {requestId, payload: {response, err}});
                }, data);
            });
            stream.on('send', data => {
                const {requestId, payload} = data;

                this.requestIdToStreamMap[requestId] = stream;
                this.provider.send(payload, (response, err) => {
                    stream.emit('sendResponse', {requestId, payload: {response, err}});
                }, data)
            });

        } else if(processName === 'notification') {
            if (this.notificationStream) this.notificationStream.close();

            this.notificationStream = new StreamObjectWrapper(portStream, 'backendToNotification');
            this.notificationStream.on('disconnect', () => {
                this.notificationStream = null;
            });
            this.messagesForNotification.forEach(request => {
                this.notificationStream.emit('addMessage', request);
            });
            this.notificationStream.on('responseMessage', this.processResponseMessage.bind(this));
            this.messagesForNotification = [];

        } else if(processName === 'config') {
            if (this.configStream) this.configStream.close();

            this.configStream = new StreamObjectWrapper(portStream, 'backendToApplication');
            this.configStream.on('disconnect', () => {this.configStream = null});
            this.configStream.on('configChange', (changes) => {
                this.providerConfig = Object.assign({}, this.providerConfig, changes);
                this.updateProviderInstance();
            });
        }

    }

    processResponseMessage(responseMessage) {
        const {additionalData, data} = responseMessage;
        const {err, response} = data;
        const stream = this.requestIdToStreamMap[additionalData.requestId];

        if (stream) {
            stream.emit('responseMessage have stream')
            this.requestIdToCallback[additionalData.requestId](err, response);
        } else {
            console.trace('now cant find callback');
        }
    }
}

//extension.runtime.onConnectExternal.addListener(connectExternal);

const controller = new BackgroundController();



// communication with page or other extension
/*function connectExternal (remotePort) {
    const originDomain = urlUtil.parse(remotePort.sender.url).hostname
    const portStream = new PortStream(remotePort)
    controller.setupUntrustedCommunication(portStream, originDomain)
}*/