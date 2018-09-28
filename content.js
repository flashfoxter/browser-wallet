const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const provider = new HDWalletProvider(
        'saddle east game inmate screen defy alone embody cupboard grocery damage drive',
        'https://rinkeby.infura.io/v3/ac236de4b58344d88976c12184cde32f');
const web3 = new Web3(provider);

const account = document.getElementById('account');
const balance = document.getElementById('balance');


const getBalance = async () => {
    const result = await web3.eth.getBalance(account.value);
    balance.innerHTML = web3.utils.fromWei(result, 'ether');
};


document.getElementById('get-balance').addEventListener("click", function() {
    getBalance();
}, false);
