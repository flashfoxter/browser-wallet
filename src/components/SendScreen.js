import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {PageActions} from '../actions/index'
import InputFieldInState from "../models/InputFieldInState";
import AuthHelper from "../helpers/AuthHelper";
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {bigElementWidth, mainColor, mainLightTextColor} from "./StyledComponents";
import Typography from "@material-ui/core/Typography";
import {ScreenNames} from "../reducers/screen";
import GoMainHeader from './GoMainHeader'
import AccountSelector from "./AccountSelector";
import SimpleAccountSelector from "./SimpleAccountSelector";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import Fade from "../../node_modules/@material-ui/core/Fade/Fade";
import CircularProgress from "../../node_modules/@material-ui/core/CircularProgress/CircularProgress";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {networks} from "../constants/networks";

const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    labelText: {
        color: mainLightTextColor
    },
    amountText: {
        color: mainColor
    },
    backdrop: {
        zIndex: 0
    },
    centerAnimation: {
        position: 'fixed',
        top: 'calc(50% - 44px)',
        left: 'calc(50% - 44px)',
    }
});


const FieldNames = {
    address: 'address',
    amount: 'amount',
    password: 'password'
};

class SendScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            address: {value: '', error: ''},
            amount: {value: '', error: ''},
            password: {value: '', error: ''},
            showPassword: false,
            sendInProgress: false,
            openDialogue: false,
            dialogueMessage: ''
        };

        this.fields = {
            address: new InputFieldInState({}, FieldNames.address, this),
            amount: new InputFieldInState({}, FieldNames.amount, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };
    }

    async sendTo(event) {


        // return;
        // connect then send

        const sendButton = event.target;
        const toAddress = this.state.address.value;
        const {currentAccounts, accountIndex} = this.props.accounts;
        const {balance, networkName} = this.props.wallet;

        const accountAddress = currentAccounts[accountIndex];

        let isValid = true;

        if (!Web3.utils.isAddress(toAddress)) {
            this.fields.login.error = 'Destination address is not valid';
            isValid = false;
        }

        const amount = parseFloat(this.state.amount.value);
        if (Number.isNaN(amount)) {
            this.fields.amount.error = 'incorrect amount';
            isValid = false;
        } else if (amount <= 0) {
            this.fields.amount.error = 'Amount mast be greater then 0';
            isValid = false;
        } else if (amount > balance) {
            this.fields.amount.error = 'Amount mast be less then you have';
            isValid = false;
        }

        const data = AuthHelper.getUserDataFormStorage(this.props.accounts.currentLogin, this.state.password.value);
        if (!data) {
            this.fields.password.error = 'Password is invalid';
            isValid = false;
        }

        const transactionObject = {
            from: accountAddress,
            to: toAddress,
            value: Web3.utils.toWei(this.state.amount.value, 'ether')
        };

        if (isValid) {
            // connect
            let web3 = null;

            // authorize by mnemonic
            if (typeof data === 'string') {
                let networkUri = networkName;
                if (networks[networkName]) {
                    networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
                }

                const provider = new HDWalletProvider(data, networkUri);
                web3 = new Web3(provider);
            }

            this.setState({sendInProgress: true});
            try {
                const transactionInfo = await web3.eth.sendTransaction(transactionObject);
                console.log('TransactionInfo:', transactionInfo);
                //this.transactionInfo.innerText += `sent transaction with id: ${transactionInfo.transactionHash}\n`;
                //show dialog
                this.setState({
                    openDialogue: true,
                    dialogueMessage: 'transaction sent'
                });
            } catch (error) {
                console.log('TransactionError:', error);
                //show dialog with error
                this.setState({
                    openDialogue: true,
                    dialogueMessage: 'transaction error'
                });
            }
            this.setState({sendInProgress: false});
            this.props.pageActions.getBalance();

        }
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    handleClose() {
        this.setState({openDialogue: false})
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid
                container
                justify='center'>
                <GoMainHeader screenName={ScreenNames.MAIN_SCREEN}>
                    Send
                </GoMainHeader>
                <form onSubmit={this.sendTo.bind(this)}>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <SimpleAccountSelector/>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '0px' }}
                        justify='flex-start'>
                        <div>
                            <span className={classes.labelText}>Balance: </span>
                            <span className={classes.amountText}>{this.props.wallet.balance} ETH</span>
                            <span>{this.state.sendInProgress ? 'true' : 'false'}</span>
                        </div>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.address.error}>
                            <InputLabel htmlFor="component-filled">Send to</InputLabel>
                            <FilledInput id="component-filled"
                                         value={this.state.address.value}
                                         onChange={event => this.setValue(event, FieldNames.address)} />
                            {this.state.address.error
                                ? <FormHelperText id="component-error-text">{this.state.address.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.amount.error}>
                            <InputLabel htmlFor="component-filled">Amount</InputLabel>
                            <FilledInput id="component-filled"
                                         value={this.state.amount.value}
                                         onChange={event => this.setValue(event, FieldNames.amount)} />
                            {this.state.amount.error
                                ? <FormHelperText id="component-error-text">{this.state.amount.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.password.error}>
                            <InputLabel htmlFor="component-filled-password">Password</InputLabel>
                            <FilledInput id="component-filled-password"
                                         value={this.state.password.value}
                                         type={this.state.showPassword ? 'text' : 'password'}
                                         onChange={event => this.setValue(event, FieldNames.password)}
                                         endAdornment={
                                             (
                                                 <InputAdornment position="end">
                                                     <IconButton
                                                         aria-label="Toggle password visibility"
                                                         onClick={this.handleClickShowPassword.bind(this)}>

                                                         {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                     </IconButton>
                                                 </InputAdornment>
                                             )
                                         }/>
                            {this.state.password.error
                                ? <FormHelperText id="component-error-text">{this.state.password.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <Button variant='contained'
                                color='secondary'
                                size='large'
                                onClick={this.sendTo.bind(this)}>Send</Button>
                    </Grid>
                </form>
                {this.state.sendInProgress
                    ? <Backdrop open={this.state.sendInProgress} className={classes.backdrop}/>
                    : null}

                {
                    this.state.sendInProgress
                        ? <Fade
                            in={this.state.sendInProgress}
                            style={{
                                transitionDelay: this.state.sendInProgress ? '800ms' : '0ms',
                            }}
                            unmountOnExit>
                            <CircularProgress className={classes.centerAnimation}/>
                        </Fade>
                        : null
                }
                <Dialog
                    open={this.state.openDialogue}
                    onClose={this.handleClose.bind(this)}
                    aria-labelledby="alert-dialog-title">
                    <DialogTitle id="alert-dialog-title">You successfully Signed Up</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
SendScreen.propTypes = {
    accounts: PropTypes.object.isRequired,
    wallet: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        accounts: state.accounts,
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

export default withStyles(styles)(connect(
    mapStateToProps,
    mapDispatchToProps
)(SendScreen))
