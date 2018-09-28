const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const provider = new HDWalletProvider(
        'saddle east game inmate screen defy alone embody cupboard grocery damage drive',
        'https://rinkeby.infura.io/v3/ac236de4b58344d88976c12184cde32f');
const web3 = new Web3(provider);


const getBalance = async () => {
    //alert("start");
    const result = await web3.eth.getBalance("0x1A53069254c61f91D877581Dd8b6b2C683225C61");
    alert("finish: " + web3.utils.fromWei(result, 'ether'));
};


const button = document.getElementById('get-balance');
button.addEventListener("click", function() {
    //alert('hello');

    getBalance();
}, false);
