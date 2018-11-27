var bip39 = require('bip39');
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require('web3-provider-engine');
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var HookedSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js');
var ProviderSubprovider = require('web3-provider-engine/subproviders/provider.js');
var Web3 = require('web3');
var Transaction = require('ethereumjs-tx');

function BackendProvider(provider_url, addresses=null, hook_cb) {

    this.addresses = addresses;
    console.log('create backend provider', addresses);


    const tmp_accounts = this.addresses;
    const tmp_wallets = this.wallets;

    this.engine = new ProviderEngine();
    this.lastAdditionalData = null;
    const self = this;
    this.engine.addProvider(new HookedSubprovider({
        getAccounts: function (cb) { cb(null, tmp_accounts); },
        signTransaction: function (data, cb) {
            hook_cb('sendTransaction', data, cb, self.lastAdditionalData);
        },
        processTransaction: function (data, cb) {
            hook_cb('sendTransaction', data, cb, self.lastAdditionalData);
        },
    }));
    this.engine.addProvider(new FiltersSubprovider());

    var httpProvider = new Web3.providers.HttpProvider(provider_url);
    if (!httpProvider.sendAsync) {
        httpProvider.sendAsync = (payload, callback) => {
            httpProvider.send(
                payload,
                (error, response) => {

                    if (error) {
                        //throw error;
                        callback(error, response);
                    } else {
                        callback(error, response);
                    }
                }
            );
        };
    }

    this.engine.addProvider(new ProviderSubprovider(httpProvider));
    this.engineStartPromise = new Promise(
        (resolve, reject) => {
            this.engine.start((err, res) => {
                if (err) {reject(err);}
                resolve(res);
            }); // Required by the provider engine.
        }
    );
};

BackendProvider.prototype.sendAsync = function () {
    console.log('send async BackendProvider2', arguments, this.engine.sendAsync);
    this.lastAdditionalData = arguments[2];
    this.engine.sendAsync.apply(this.engine, arguments);
};

BackendProvider.prototype.send = function () {
    console.log('send Sync', arguments);
    return this.engine.send.apply(this.engine, arguments);
};

// returns the address of the given address_index, first checking the cache
BackendProvider.prototype.getAddress = function (idx) {
    if (!idx) { return this.addresses[0]; }
    else { return this.addresses[idx]; }
};

// returns the addresses cache
BackendProvider.prototype.getAddresses = function () {
    return this.addresses;
};

module.exports = BackendProvider;
