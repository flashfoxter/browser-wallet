import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import { ScreenNames } from '../reducers/screen';
import AccountSelector from './AccountSelector';
import MainHeader from './MainHeader';
import { mainBackgroundColor, mainColor } from './StyledComponents';
import Transactions from './Transactions';
import Drawer from '@material-ui/core/Drawer';

const CUSTOM_ID = 'custom';

class MainScreen extends Component {
    constructor (props) {
        super(props);

        this.props.pageActions.getBalance();
    }

    changeMnemonic(event) {
        this.setState({mnemonic: event.target.value});
    }

    render() {
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
                                disabled={!this.props.wallet.isConnected}
                                onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SEND_SCREEN)}
                                size='small'
                                type='submit'>
                            Send
                        </Button>
                    </Grid>
                    <Grid item xs={6} style={{paddingLeft: '12px'}}
                          container
                          alignItems='center'
                          justify='flex-start'>
                        <Button variant='contained'
                                color='secondary'
                                disabled={!this.props.wallet.isConnected}
                                onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.CONTRACT_SCREEN)}
                                size='small'
                                type='submit'>
                            Contract
                        </Button>
                    </Grid>
                </Grid>
                <Transactions/>
                <Drawer anchor="bottom" open={!this.props.wallet.isConnected}
                        ModalProps={{hideBackdrop: true, style: {top: 'initial'}}}>
                    <div
                        tabIndex={0}
                        role="button">
                        <Typography variant='h5' align='center' color='error' style={
                            {padding: '15px 0', backgroundColor: mainBackgroundColor}
                        }>
                            Connection broken
                        </Typography>
                    </div>
                </Drawer>
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
