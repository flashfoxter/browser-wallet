const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');


const MNEMONIC_ID = 'mnemonic';
const CUSTOM_ID = 'custom';

const mnemonicInput = document.getElementById(MNEMONIC_ID);
const customInput = document.getElementById(CUSTOM_ID);


let provider;
let web3;


const init = () => {
    const mnemonic = localStorage.getItem(MNEMONIC_ID);
    if (mnemonic) {
        mnemonicInput.value = mnemonic;
    }

    const custom = localStorage.getItem(CUSTOM_ID);
    if (custom) {
        customInput.value = custom;
    }
}


const connect = async () => {
    // TODO: validate mnemonic
    const mnemonic = mnemonicInput.value;
    if (mnemonic === '') {
        alert('mnemonic is not valid');
        return;
    }
    localStorage.setItem(MNEMONIC_ID, mnemonic);

    const networks = {
            rinkeby: 'ac236de4b58344d88976c12184cde32f'
    };
    const network = document.getElementById('network').value;
    let networkUri;
    if (networks[network]) {
        networkUri = 'https://rinkeby.infura.io/v3/' + networks[network];
    } else if (network == 'custom') {
        networkUri = customInput.value;
        localStorage.setItem(CUSTOM_ID, customInput.value);
    } else {
        alert("Unknown network");
        return;
    }
    console.log('Connecting to ', networkUri);

    provider = new HDWalletProvider(mnemonic, networkUri);
    web3 = new Web3(provider);

    document.getElementById('connected').innerHTML = 'connected';

    document.getElementById('account').value = (await web3.eth.getAccounts())[0];
    getBalance();
};


const getBalance = async () => {
    const result = await web3.eth.getBalance(document.getElementById('account').value);
    document.getElementById('balance').innerHTML = web3.utils.fromWei(result, 'ether');
};


document.getElementById('connect').addEventListener("click", function() {
    connect();
}, false);


init();
