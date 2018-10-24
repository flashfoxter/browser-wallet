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
import AccountSelector from './AccountSelector'
import Typography from '@material-ui/core/Typography/Typography'
import { mainColor } from './StyledComponents'
import Button from '@material-ui/core/Button'
import { ScreenNames } from '../reducers/screen'

const CUSTOM_ID = 'custom';

class MainScreen extends Component {
    constructor (props) {
        super(props);

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
        const {currentAccounts, accountIndex} = this.props.accounts;

        return (
            <Grid
                container
                justify='center'>
                <MainHeader/>
                <Grid
                    container
                    style={{ padding: '12px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                    justify='center'>
                    <AccountSelector/>
                </Grid>
                <Grid
                    container
                    style={{ padding: '16px' }}
                    justify='center'>
                    <img src='./icons/eth_logo.svg' width='56px' height='56px'/>
                </Grid>
                <Grid
                    container
                    justify='center'>
                    <Typography style={{fontSize: '38px', color: mainColor}}>
                        {this.props.wallet.balance}
                        <span style={{color: 'rgba(0, 157, 139, 0.5)'}}>ETH</span>
                    </Typography>
                </Grid>
                <Grid container style={{
                    paddingTop: '16px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                    <Grid item xs={6} style={{paddingRight: '12px'}}
                              container
                              alignItems='center'
                              justify='flex-end'>
                        <Button variant='contained'
                                color='secondary'
                                onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SEND_SCREEN)}
                                size='small'
                                type='submit'
                                >Send</Button>
                    </Grid>
                    <Grid item xs={6} style={{paddingLeft: '12px'}}
                          container
                          alignItems='center'
                          justify='flex-start'>
                        <Button variant='contained'
                                color='secondary'
                                size='small'
                                type='submit'
                                >Contract</Button>
                    </Grid>
                </Grid>
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
        wallet: state.wallet,
        accounts: state.accounts
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
