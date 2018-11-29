import extension from 'extensionizer';
import NetHelper from './helpers/NetHelper';
import {StreamObjectWrapper} from './models/StreamObjectWrapper';
const PortStream = require('extension-port-stream');
import {networks} from './constants/networks';
import BackendProvider from './libs/proxy-web3/backend-provider';

class MyExtension {
    sendMessage(message, query = {}) {
        extension.tabs.query(query, tabs => {
            tabs.forEach(tab => {
                extension.tabs.sendMessage(tab.id, message)
            })
        })
    }
}


const height = 640;
const width = 376;


class NotificationManager {

    /**
     * A collection of methods for controlling the showing and hiding of the notification popup.
     *
     * @typedef {Object} NotificationManager
     *
     */

    /**
     * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
     * notification windows are given a 'popup' type.
     *
     */
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

    /**
     * Closes a MetaMask notification if it window exists.
     *
     */
    closePopup () {
        // closes notification popup
        this._getPopup((err, popup) => {
            if (err) throw err;
            if (!popup) return;
            extension.windows.remove(popup.id, console.error)
        })
    }

    /**
     * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
     * type 'popup')
     *
     * @private
     * @param {Function} cb A node style callback that to whcih the found notification window will be passed.
     *
     */
    _getPopup (cb) {
        this._getWindows((err, windows) => {
            if (err) throw err;
            cb(null, this._getPopupIn(windows))
        })
    }

    /**
     * Returns all open MetaMask windows.
     *
     * @private
     * @param {Function} cb A node style callback that to which the windows will be passed.
     *
     */
    _getWindows (cb) {
        // Ignore in test environment
        if (!extension.windows) {
            return cb()
        }

        extension.windows.getAll({}, (windows) => {
            cb(null, windows)
        })
    }

    /**
     * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
     *
     * @private
     * @param {array} windows An array of objects containing data about the open MetaMask extension windows.
     *
     */
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
        console.log('this.providerConfig', this.providerConfig);
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
        console.log('hook', name, data, callback, additionalData);
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
        console.log('remotePort', processName, remotePort);
        const portStream = new PortStream(remotePort);
        if (processName === 'tigercontent') {
            const stream = new StreamObjectWrapper(portStream, 'backendToContent');

            /*
            stream.on('openPopup', (popupData) => {
                this.notificationManager.showPopup();
                if (this.notificationStream) {
                    this.notificationStream.emit('openPopup', {
                        from: stream.name,
                            popupData
                    });
                } else {
                    this.messagesForNotification.push(
                        {
                            event: 'openPopup',
                            data: {
                                from: stream.name,
                                popupData
                            },
                        }
                    );
                }
            });*/
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
                console.log('get sendAsync request ', data);
                const {requestId, payload} = data;
                this.requestIdToStreamMap[requestId] = stream;
                this.provider.sendAsync(payload, (err, response) => {
                    console.log('after do sendAsync request ', {response, err});
                    stream.emit('sendResponse', {requestId, payload: {response, err}});
                }, data)
            });
            stream.on('send', data => {
                console.log('get send request ', data);
                const {requestId, payload} = data;
                this.requestIdToStreamMap[requestId] = stream;
                this.provider.send(payload, (response, err) => {
                    console.log('after do send request ', {response, err});
                    stream.emit('sendResponse', {requestId, payload: {response, err}});
                }, data)
            });

        } else if(processName === 'notification') {
            if (this.notificationStream) this.notificationStream.close();

            this.notificationStream = new StreamObjectWrapper(portStream, 'backendToNotification');
            this.notificationStream.on('disconnect', () => {this.notificationStream = null});
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
        console.log(responseMessage, this.requestIdToStreamMap, this.requestIdToCallback);
        if (stream) {
            //stream.emit('responseMessage', )
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