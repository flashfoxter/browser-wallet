# Chrome Tiger Ethereum Wallet
![Dashboard](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Dashboard.PNG)

# Features
  - Mnemonic phrase ([BIP39](https://iancoleman.io/bip39/)) and private key import support
  - Connection to known Ethereum netwoks
  - Connection to custom node via RPC
  - Get balance
  - Send transactions
  - View transactions history (via [Etherscan](https://etherscan.io))
  - Contracts support: load ABI from Etherscan or file, list methods, dynamic UI
  - Address QR Code support
  - web3 injection and transactions handling

![Login](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Login.PNG)
![Sign-Up](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/SignUp.PNG)
![Mnemonic](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Mnemonic.PNG)
![Transaction](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Transaction.PNG)
![Contract](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Contract.PNG)
![QR Code](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/QrCode.PNG)
![Remix web3 injection](https://github.com/tigerdevpool/browser-wallet/blob/master/screenshots/Remix.PNG)

# Installation

## Software Prerequisites
  - Install [Node.js](https://nodejs.org/)
  - Run *npm install -g browserify*
  - Run *npm install*

## Building
  - Run *npm run build*

## Deployment
  - Open *chrome://extensions/* in Google Chrome
  - Enable *Developer mode*
  - Click *Load unpacked* and select project folder
