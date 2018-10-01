const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

let provider;
let web3;

const account = document.getElementById('account');
const balance = document.getElementById('balance');


const connect = async () => {
    const networks = {
            rinkeby: 'ac236de4b58344d88976c12184cde32f'
    };

    const network = document.getElementById('network').value;
    let networkUri;
    if (networks[network]) {
        networkUri = 'https://rinkeby.infura.io/v3/' + networks[network];
    } else {
        // TODO
        networkUri = 'http://localhost:8501';
    }

    provider = new HDWalletProvider(document.getElementById('mnemonic'), networkUri);
    web3 = new Web3(provider);

    document.getElementById('connected').innerHTML = 'connected';
};


const getBalance = async () => {
    const result = await web3.eth.getBalance(account.value);
    balance.innerHTML = web3.utils.fromWei(result, 'ether');
};


document.getElementById('connect').addEventListener("click", function() {
    connect();
}, false);
document.getElementById('get-balance').addEventListener("click", function() {
    getBalance();
}, false);
