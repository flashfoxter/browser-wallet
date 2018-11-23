/*global Web3*/
cleanContextForImports();
import {StreamObjectWrapper} from './models/StreamObjectWrapper';
const LocalMessageDuplexStream = require('post-message-stream');
import {ProxyProvider} from './libs/proxy-web3/proxy-provider';

require('web3/dist/web3.min.js');

class TigerWalletController {
    constructor() {

        //function onMessage(messageType, handler, remove) {
        //    window.addEventListener('message', function ({ data }) {
        //        if (!data || data.type !== messageType) { return }
        //        remove && window.removeEventListener('message', handler);
        //        handler.apply(window, arguments)
        //    })
        //}

        //
        // setup plugin communication
        //

        // setup background connection
        var walletStream = new StreamObjectWrapper(new LocalMessageDuplexStream({
            name: 'tigerinpage',
            target: 'tigercontent',
        }), 'inpageToContent');

        console.log('walletStream', walletStream, 'location:', window.location.href);

        //const provider =

        this.walletStream = walletStream;
        window.walletStream = walletStream;
        this.setupGlobalWeb3();
    }

    setupConnection() {

    }

    setupGlobalWeb3() {
        const proxyProvider = new ProxyProvider(this.walletStream);
        const web3 = new Web3(proxyProvider);
        web3.setProvider = function () {
            log.debug('TigerWallet - overrode web3.setProvider');
        };
        window.web3 = web3;
    }
}

if (window.tigerWallet) {
    console.log('tigerWallet already defined');
} else {
    window.tigerWallet = new TigerWalletController();
}

restoreContextAfterImports();

// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
var __define

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
function cleanContextForImports () {
    __define = global.define
    try {
        global.define = undefined
    } catch (_) {
        console.warn('MetaMask - global.define could not be deleted.')
    }
}

/**
 * Restores global define object from cached reference
 */
function restoreContextAfterImports () {
    try {
        global.define = __define
    } catch (_) {
        console.warn('MetaMask - global.define could not be overwritten.')
    }
}