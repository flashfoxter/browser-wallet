import Backdrop from '@material-ui/core/Backdrop/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fade from '@material-ui/core/Fade/Fade';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Web3 from 'web3';
import { PageActions } from '../actions/index';
import { networks } from '../constants/networks';
import AuthHelper from '../helpers/AuthHelper';
import NetHelper from '../helpers/NetHelper';
import { streamActionsController } from '../index';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';
import GoMainHeader from './GoMainHeader';
import RequestSelector from './RequestSelector';
import SimpleAccountSelector from './SimpleAccountSelector';
import { mainColor, mainLightTextColor } from './StyledComponents';

const HDWalletProvider = require('../libs/truffle-hdwallet-provider');

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
    commissionLabelText: {
        fontSize: '12px',
        color: mainLightTextColor
    },
    commissionText: {
        fontSize: '12px',
        color: mainColor
    },
    backdrop: {
        zIndex: 0
    },
    centerAnimation: {
        position: 'fixed',
        top: 'calc(50% - 44px)',
        left: 'calc(50% - 44px)',
    },
    dialogText: {
        color: mainLightTextColor,
        fontSize: '14px',
        whiteSpace: 'pre-wrap'
    },
    dialogTitle: {
        fontSize: '20px',
        whiteSpace: 'pre-wrap',
        fontWeight: 600
    },
    dialogContent: {
        margin: '0 24px',
        padding: 0
    }
});

const FieldNames = {
    address: 'address',
    amount: 'amount',
    password: 'password'
};

const DEFAULT_GASLIMIT = 21000;

class RequestScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            address: {value: '', error: ''},
            amount: {value: '', error: ''},
            password: {value: '', error: ''},
            showPassword: false,
            sendInProgress: false,
            openDialogue: false,
            dialogueTitle: '',
            dialogueMessage: null,
            completedSuccessful: false,
            commission: '-'
        };

        this.fields = {
            address: new InputFieldInState({}, FieldNames.address, this),
            amount: new InputFieldInState({}, FieldNames.amount, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };

        const {networkName} = this.props.wallet;

        let networkUri = networkName;
        if (networks[networkName]) {
            networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
        }
        this.provider = new HDWalletProvider('', networkUri);
        this.testWeb3 = new Web3(this.provider);

        this.gasPrice = 1000000000;
        this.updateGasPrice()

    }

    async updateGasPrice() {
        this.gasPrice = await new Promise((resolve, reject) => {
            this.testWeb3.eth.getGasPrice((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        let gasPrice = this.testWeb3.utils.toBN(this.gasPrice);
        const commissionBN = gasPrice.mul(this.testWeb3.utils.toBN(DEFAULT_GASLIMIT));

        let com = this.testWeb3.utils.fromWei(commissionBN, 'ether');

        this.setState({commission: com.toString()});
        this.provider.engine.stop();
    }

    async accept(event) {
        event.preventDefault();

        const {currentAccounts, accountIndex} = this.props.accounts;
        const {balance, networkName} = this.props.wallet;
        const {requests, requestIndex} = this.props.requests;
        const requestInfo = requests[requestIndex];
        console.log('requestInfo', requestInfo);


        let toAddress = '';
        if (requestInfo) {
            toAddress = requestInfo.data.to;
        }

        const accountAddress = currentAccounts[accountIndex];

        let isValid = true;


        if (toAddress && !this.testWeb3.utils.isAddress(toAddress)) {
            this.fields.address.error = 'Invalid address';
            isValid = false;
        }

        const data = AuthHelper.getUserDataFormStorage(this.props.accounts.currentLogin, this.state.password.value);
        if (!data) {
            this.fields.password.error = 'Password is invalid';
            isValid = false;
        }

        //const wallData = AuthHelper.getUserDataFormStorage('xamlo2', 'a1a2a3a4');
        //console.log('wallData', wallData, this.testWeb3.accounts);
        //isValid = false;

        if (isValid) {
            // connect
            let web3 = null;
            console.log('form is valid');

            const transactionObject = {
                from: accountAddress,
                gasPrice: this.gasPrice,
                //gas: DEFAULT_GASLIMIT,
                value: requestInfo.data.value
            };

            if (toAddress) {
                transactionObject.to = toAddress;
            }

            if (requestInfo.data.data) {
                transactionObject.data = requestInfo.data.data;
            }

            let networkUri = NetHelper.getNetworkUri(networkName);
            // authorize by mnemonic
            if (typeof data === 'string') {
                const provider = new HDWalletProvider(data, networkUri, 0, 10);
                web3 = new Web3(provider);

                web3.eth.defaultAccount = accountAddress;
            } else {
                web3 = new Web3(new Web3.providers.HttpProvider(networkUri));
                web3.eth.accounts.wallet.add(data);
            }

            this.setState({sendInProgress: true});
            try {

                const gas = await web3.eth.estimateGas(transactionObject);
                console.log('gas limit', gas);
                transactionObject.gas = gas;

                const transactionInfo = await web3.eth.sendTransaction(transactionObject);

                console.log('TransactionInfo:', transactionInfo);

                streamActionsController.sendResponse({
                    requestId: requestInfo.requestId,
                    additionalData: requestInfo.additionalData,
                    data: {response: transactionInfo}
                });

                //show dialog
                const amount = this.state.amount.value;
                const hash = transactionInfo.transactionHash;

                this.setState({
                    openDialogue: true,
                    completedSuccessful: true,
                    dialogueTitle: 'You successfully\nmake a transaction:',
                    dialogueMessage: "Send to: \n" + toAddress
                        + "\nAmount: " + amount + " ETH\nTransactionHash\n" + hash
                });
            } catch (error) {
                console.log('TransactionError:', error);

                streamActionsController.sendResponse({
                    requestId: requestInfo.requestId,
                    additionalData: requestInfo.additionalData,
                    data: {err: error}
                });
                //show dialog with error
                this.setState({
                    openDialogue: true,
                    dialogueTitle: 'Transaction error',
                    dialogueMessage: "Error description:\n" + error.message
                });
            }
            this.setState({sendInProgress: false});
            this.props.pageActions.getBalance();

        } else {
            console.log('form is invalid')
        }
    }

    async decline(event) {
        event.preventDefault();

        const {requests, requestIndex} = this.props.requests;
        const requestInfo = requests[requestIndex];


        streamActionsController.sendResponse({
            requestId: requestInfo.requestId,
            additionalData: requestInfo.additionalData,
            data: {
                err: {
                    message: 'Request was rejected by user'
                }
            }
        });
        this.props.pageActions.declineRequest();
    }

    async sall(event) {
        event.preventDefault();
        const {requests, requestIndex} = this.props.requests;

        console.log('requestsInfo', requests, requestIndex);
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    handleClose() {
        if (!this.state.completedSuccessful) {
            this.setState({
                openDialogue: false,
                dialogueTitle: '',
                dialogueMessage: null
            });
        } else {
            this.props.pageActions.declineRequest();
            this.setState({
                openDialogue: false,
                dialogueTitle: '',
                dialogueMessage: null
            });
        }
    }

    render() {
        const {classes} = this.props;
        const {requests, requestIndex} = this.props.requests;
        const requestInfo = requests[requestIndex];

        let amount = '0';
        if (requestInfo) {
            amount = this.testWeb3.utils.fromWei(this.testWeb3.utils.toBN(requestInfo.data.value), 'ether').toString();
        }

        return (
            <Grid
                container
                justify='center'>
                <GoMainHeader screenName={ScreenNames.MAIN_SCREEN}>
                    Send
                </GoMainHeader>
                <form onSubmit={this.accept.bind(this)}>
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
                        </div>
                    </Grid>
                    {
                        requests.length
                            ? <Grid
                                container
                                style={{paddingTop: '32px'}}
                                justify='center'>
                                <RequestSelector/>
                              </Grid>
                            : null
                    }
                    {
                        requests.length && requestInfo.data.to
                            ? <Grid
                                container
                                style={{paddingTop: '32px'}}
                                justify='center'>

                                <FormControl
                                    variant="filled"
                                    error={!!this.state.address.error}>
                                    <InputLabel htmlFor="component-filled">Send to</InputLabel>
                                    <FilledInput id="component-filled"
                                                 disabled={true}
                                                 value={requestInfo.data.to}
                                                 onChange={event => this.setValue(event, FieldNames.address)}/>
                                    {this.state.address.error
                                        ? <FormHelperText
                                            id="component-error-text">{this.state.address.error}</FormHelperText>
                                        : null
                                    }
                                </FormControl>
                              </Grid>
                            : null
                    }
                    {
                        requests.length && requestInfo.additionalData.additionalData
                            ? <Grid
                                container
                                style={{paddingTop: '32px'}}
                                justify='flex-start'>
                                <Tooltip title={requestInfo.additionalData.additionalData.location}>
                                    <Typography noWrap={true} style={{width: '240px'}}>
                                        Site location: {requestInfo.additionalData.additionalData.location}
                                    </Typography>
                                </Tooltip>
                              </Grid>
                            : null
                    }
                    {
                        requests.length && requestInfo.data.data
                            ? <Grid
                                container
                                style={{paddingTop: '32px'}}
                                justify='flex-start'>
                                <Typography>Deploy contract</Typography>
                              </Grid>
                            : null
                    }
                    {
                        requests.length === 0
                            ? <Grid
                                container
                                style={{paddingTop: '32px'}}
                                justify='flex-start'>
                                <Typography>No active requests</Typography>
                              </Grid>
                            : null
                    }
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.amount.error}>
                            <InputLabel htmlFor="component-filled">Amount</InputLabel>
                            <FilledInput id="component-filled"
                                         value={amount}
                                         disabled={true} />
                            {this.state.amount.error
                                ? <FormHelperText id="component-error-text">{this.state.amount.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '0px' }}
                        justify='flex-start'>
                        <div>
                            <span className={classes.commissionLabelText}>Commission: </span>
                            <span className={classes.commissionText}>{this.state.commission} ETH</span>
                        </div>
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
                    {
                        requests.length
                            ? <Grid
                                container
                                style={{padding: '32px 0'}}
                                justify='center'>
                                <Button variant='contained'
                                        color='secondary'
                                        size='large'
                                        type='submit'
                                        onClick={this.accept.bind(this)}>Accept</Button>
                              </Grid>
                            : null
                    }
                    {
                        requests.length
                            ? <Grid
                                container
                                style={{padding: '32px 0'}}
                                justify='center'>
                                <Button variant='contained'
                                        color='secondary'
                                        size='large'
                                        type='submit'
                                        onClick={this.decline.bind(this)}>Decline</Button>
                              </Grid>
                            : null
                    }
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
                    aria-describedby="alert-dialog-description"
                    aria-labelledby="alert-dialog-title">
                    <DialogTitle id="alert-dialog-title" disableTypography={true}>
                        <Typography variant='h2' className={classes.dialogTitle}>
                            {this.state.dialogueTitle}
                        </Typography>
                    </DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Typography className={classes.dialogText}>
                            {this.state.dialogueMessage}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} color="secondary" autoFocus>
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
RequestScreen.propTypes = {
    accounts: PropTypes.object.isRequired,
    wallet: PropTypes.object.isRequired,
    requests: PropTypes.object.isRequired,
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
        wallet: state.wallet,
        requests: state.requests
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
)(RequestScreen))
