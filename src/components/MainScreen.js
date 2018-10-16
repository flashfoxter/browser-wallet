import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import {networks} from '../constants/networks';
// import * as https from 'https';
// import * as urlParser from 'url';
import {PageActions} from '../actions/index'
import Transactions from "./Transactions";
import AuthHelper from "../helpers/AuthHelper";
import NetHelper from "../helpers/NetHelper";
import Grid from "@material-ui/core/Grid";
import MainHeader from "./MainHeader";

const CUSTOM_ID = 'custom';

class MainScreen extends Component {
    constructor (props) {
        super(props);

        // NetHelper.getBalance('0xc94770007dda54cF92009BFF0dE90c06F603a09f','mainnet');
        console.log('props:', props);
        this.props.pageActions.getBalance();
    }

    changeMnemonic(event) {
        this.setState({mnemonic: event.target.value});
    }

    async toggleConnectionState(event) {
        const buttonElement = event.target;
        if (!this.props.wallet.isConnected) {
            const mnemonic = this.state.mnemonic;
            if (mnemonic === '') {
                alert('mnemonic is not valid');
                // return;
            }
            localStorage.setItem(MNEMONIC_ID, mnemonic);

            console.log('addresses', AuthHelper.getAddressesFromMnemonic('mountains supernatural bird...', 10));

            const network = this.refs.networkSelect.value;
            let networkUri;
            let networkName = '';
            if (networks[network]) {
                networkName = network;
                networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
            } else if (network == 'custom') {
                networkUri = this.refs.customConnectionInput.value;
                localStorage.setItem(CUSTOM_ID, networkUri);
            } else {
                alert("Unknown network");
                return;
            }
            console.log('Connecting to ', networkUri);

            const provider = new HDWalletProvider(mnemonic, networkUri, 0, 10);
            const web3 = new Web3(provider);
            const accs = await web3.eth.getAccounts();
            console.log('w3', web3, buttonElement, accs);
            buttonElement.disabled = true;
            const accountAddress = accs[0];

            this.props.pageActions.connectToNetwork({
                web3,
                accountAddress,
                networkName,
                isConnected: !!accountAddress
            });

            buttonElement.disabled = false;

            this.props.pageActions.getBalance();
        } else {
            this.props.pageActions.disconnect();
        }

    }

    render() {

        return (
            <Grid
                container
                justify='center'>
                <MainHeader/>
                Network: <select ref="networkSelect" disabled={this.props.wallet.isConnected}>
                    <option value='rinkeby'>Rinkeby</option>
                    <option value='kovan'>Kovan</option>
                    <option value='ropsten'>Ropsten</option>
                    <option value='mainnet'>Etherium Main Network</option>
                    <option value='custom'>Custom</option>
                </select>
                <br/>Custom: <input ref="customConnectionInput" type='text' />
                <br/><br/>

                Account: <input value={this.props.wallet.accountAddress} disabled type='text' />
                <br/>Balance: <label>{this.props.wallet.balance}</label>
                <hr />
                <Transactions/>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
MainScreen.propTypes = {
    wallet: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        wallet: state.wallet
    }
}

/**
 * Binding actions
 * @param  {function}
 */
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(PageActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainScreen)
