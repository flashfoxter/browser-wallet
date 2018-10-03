const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const https = require('https');
const urlParser = require('url');


const MNEMONIC_ID = 'mnemonic';
const CUSTOM_ID = 'custom';
const SEND_TO_SELECTOR = 'send_to';
const SEND_BUTTON_SELECTOR = 'send_button';
const AMOUNT_SELECTOR = 'amount';
const CONNECT_BUTTON_SELECTOR = 'connect';
const NETWORK_SELECT_SELECTOR = 'network';
const ACCOUNT_SELECTOR = 'account';
const BALANCE_LABEL_SELECTOR = 'balance';
const CONNECTION_STATE_SELECTOR = 'connected';
const TRANSACTION_INFO_SELECTOR = 'transaction_info';
const LOADING_INDICATOR_SELECTOR = 'loading';
const HISTORY_BUTTON_SELECTOR = 'show_history';
const HISTORY_TABLE_PLACE_SELECTOR = 'history_table';

const networks = {
    rinkeby: 'rinkeby',
    ropsten: 'ropsten',
    kovan: 'kovan',
    mainnet: 'mainnet'
};

const etherscanNetToURLMap = {
    rinkeby: 'https://rinkeby.etherscan.io/txs?a=',
    ropsten: 'https://ropsten.etherscan.io/txs?a=',
    kovan: 'https://kovan.etherscan.io/txs?a=',
    mainnet: 'https://etherscan.io/txs?a='
};



class Wallet {
    constructor() {
        this.mnemonicInput = document.getElementById(MNEMONIC_ID);
        this.customInput = document.getElementById(CUSTOM_ID);
        this.sendToInput = document.getElementById(SEND_TO_SELECTOR);
        this.sendButton = document.getElementById(SEND_BUTTON_SELECTOR);
        this.amountInput = document.getElementById(AMOUNT_SELECTOR);
        this.connectButton = document.getElementById(CONNECT_BUTTON_SELECTOR);
        this.networkSelector = document.getElementById(NETWORK_SELECT_SELECTOR);
        this.accountInput = document.getElementById(ACCOUNT_SELECTOR);
        this.balanceLabel = document.getElementById(BALANCE_LABEL_SELECTOR);
        this.connectionStateElement = document.getElementById(CONNECTION_STATE_SELECTOR);
        this.transactionInfo = document.getElementById(TRANSACTION_INFO_SELECTOR);
        this.loadingIndicator = document.getElementById(LOADING_INDICATOR_SELECTOR);
        this.historyButton = document.getElementById(HISTORY_BUTTON_SELECTOR);
        this.placeForHistory = document.getElementById(HISTORY_TABLE_PLACE_SELECTOR);

        this.provider = null;
        this.web3 = null;
        this.isConnected = false;
        this.accountAddress = '';
        this.networkName = '';
        this.ballance = 0;
        this.init();
        this.addButtonListeners();
    }

    init() {
        const mnemonic = localStorage.getItem(MNEMONIC_ID);
        if (mnemonic) {
            this.mnemonicInput.value = mnemonic;
        }

        const custom = localStorage.getItem(CUSTOM_ID);
        if (custom) {
            this.customInput.value = custom;
        }
    }

    async toggleConnectState() {
        if (!this.isConnected) {
            const mnemonic = this.mnemonicInput.value;
            if (mnemonic === '') {
                alert('mnemonic is not valid');
                return;
            }
            localStorage.setItem(MNEMONIC_ID, mnemonic);

            const network = this.networkSelector.value;
            let networkUri;
            if (networks[network]) {
                this.networkName = network;
                networkUri = `https://${this.networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
            } else if (network == 'custom') {
                networkUri = this.customInput.value;
                localStorage.setItem(CUSTOM_ID, this.customInput.value);
            } else {
                alert("Unknown network");
                return;
            }
            console.log('Connecting to ', networkUri);

            this.provider = new HDWalletProvider(mnemonic, networkUri);
            this.web3 = new Web3(this.provider);
            console.log('w3', this.web3);
            this.accountAddress = (await this.web3.eth.getAccounts())[0];
            if (this.accountAddress) {
                this.isConnected = true;
            }
            this.updateAfterStateChanged();

            this.accountInput.value = this.accountAddress;

            this.getBalance();
        } else {
            this.web3 = null;
            this.isConnected = false;
            this.accountAddress = '';
            this.networkName = '';
            this.updateAfterStateChanged();
        }
    }

    updateAfterStateChanged() {
        if (this.isConnected) {
            this.mnemonicInput.disabled = true;
            this.customInput.disabled = true;
            this.networkSelector.disabled = true;
            this.connectionStateElement.innerHTML = 'connected';
            this.connectButton.innerText = 'Disconnect';
            this.sendToInput.disabled = false;
            this.sendButton.disabled = false;
            this.amountInput.disabled = false;
            this.historyButton.disabled = false;
        } else {
            this.mnemonicInput.disabled = false;
            this.customInput.disabled = false;
            this.networkSelector.disabled = false;
            this.connectionStateElement.innerHTML = 'not connected';
            this.connectButton.innerText = 'Connect';
            this.sendToInput.disabled = true;
            this.sendButton.disabled = true;
            this.amountInput.disabled = true;
            this.historyButton.disabled = true;
            this.accountInput.value = '';
            this.balanceLabel.innerHTML = '';
            this.ballance = 0;
        }
    }

    async getBalance() {
        const result = await this.web3.eth.getBalance(this.accountAddress);
        this.balanceLabel.innerHTML = this.web3.utils.fromWei(result, 'ether');
        this.ballance = parseFloat(this.balanceLabel.innerHTML);
    }

    async send() {
        const toAddress = this.sendToInput.value;
        if (!this.web3.utils.isAddress(toAddress)) {
            alert('Destination address is not valid');
            return;
        }
        const amount = parseFloat(this.amountInput.value);
        if (Number.isNaN(amount)) {
            alert('incorrect amount');
            return;
        } else if (amount <= 0) {
            alert('Amount mast be greater then 0');
            return;
        } else if (amount > this.ballance) {
            alert('Amount mast be less then you have');
            return;
        }

        const transactionObject = {
            from: this.accountAddress,
            to: toAddress,
            value: this.web3.utils.toWei(this.amountInput.value, 'ether')
        };

        this.sendButton.disabled = true;
        this.loadingIndicator.style.display = 'block';
        try {
            const transactionInfo = await this.web3.eth.sendTransaction(transactionObject);
            console.log('TransactionInfo:', transactionInfo);
            this.transactionInfo.innerText += `sent transaction with id: ${transactionInfo.transactionHash}\n`;
        } catch (error) {
            console.log('TransactionError:', error);
            this.transactionInfo.innerText += `error while send transaction\n`;
        }
        this.loadingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
        this.getBalance();
    }

    async getHistory(address, page) {
        if (this.networkName) {
            const url = etherscanNetToURLMap[this.networkName] + this.accountAddress.toLowerCase();
            this.historyButton.disabled = true;
            this.loadingIndicator.style.display = 'block';
            const responseBody = await this.httpRequest(url, 'GET');
            const historyEl = document.createElement('div');
            historyEl.innerHTML = responseBody;
            console.log(historyEl);
            // find table element
            const tableEl = historyEl.querySelector('#ContentPlaceHolder1_mainrow div div div table');
            if (tableEl) {
                // split all links from table
                const aTagLists = tableEl.querySelectorAll('a[href]');
                aTagLists.forEach((aTag) => {
                    aTag.removeAttribute('href');
                });

                //clear tag
                this.placeForHistory.innerHTML = '';
                this.placeForHistory.appendChild(tableEl);
            } else {
                this.placeForHistory.innerHTML = 'can\'t get history';
            }
            this.loadingIndicator.style.display = 'none';
            this.historyButton.disabled = false;
        } else {
            this.placeForHistory.innerHTML = 'Can\'t get history for Custom network';
        }
    }


    addButtonListeners() {
        const self = this;
        this.connectButton.addEventListener('click', function() {
            self.toggleConnectState();
        }, false);
        this.sendButton.addEventListener('click', function() {
            self.send();
        }, false);
        this.historyButton.addEventListener('click', function() {
            self.getHistory();
        });
    }

    async httpRequest(url, method, data) {
        return new Promise (function (resolve, reject) {
            const reqInfo = urlParser.parse(url);
            console.log('reqInfo', reqInfo);

            var options = {
                hostname: reqInfo.hostname,
                port: reqInfo.port ? reqInfo.port : reqInfo.protocol === 'https:' ? 443 : 80,
                path: reqInfo.path,
                method: method ? method : 'GET'
            };

            var req = https.request(options, function (res) {
                console.log('statusCode: ', res.statusCode);
                console.log('headers: ', res.headers);

                res.on('data', function (uint8ArrayData) {
                    const str = String.fromCharCode.apply(null, uint8ArrayData);
                    //console.log('body:', str);
                    resolve(str);
                });
            });
            if (data) {
                req.write(data);
            }
            req.end();

            req.on('error', function (e) {
                reject(e);
            });
        });
    }

}
const wallet = new Wallet();
