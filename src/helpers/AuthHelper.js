import * as Aes256 from 'aes256';
import * as bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';

const USER_PREFIX = 'stored_user:';

export default {
    addUserToStorage(login, password, data) {
        const dataStr = JSON.stringify(data);

        const encodedData = Aes256.encrypt(password, dataStr);
        console.log(USER_PREFIX + login.toLowerCase(),'data: ', encodedData);
        localStorage.setItem(USER_PREFIX + login.toLowerCase(), encodedData);
    },

    getUserDataFormStorage(login, password) {
        const encodedData = localStorage.getItem(USER_PREFIX + login.toLowerCase());
        if (encodedData) {
            console.log('encodedData', encodedData);
            try {
                const dataStr = Aes256.decrypt(password, encodedData);
                console.log('dataStr', dataStr);
                return JSON.parse(dataStr);
            } catch (e) {
                console.log('err', e);
                return null;
            }

        }

        return null;
    },

    checkExistsUserInStorage(login) {
        return !!localStorage.getItem(USER_PREFIX + login.toLowerCase());
    },

    getAddressesFromMnemonic(mnemonic, quantity) {
        const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
        const wallet_hdpath = "m/44'/60'/0'/0/";
        const addresses = [];

        for (let i = 0; i < quantity; i++) {
            const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
            const addr = '0x' + wallet.getAddress().toString('hex');
            addresses.push(addr);
        }

        return addresses;
    }
};