import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Web3 from 'web3';
import Backdrop from '../../node_modules/@material-ui/core/Backdrop/Backdrop';
import CircularProgress from '../../node_modules/@material-ui/core/CircularProgress/CircularProgress';
import Fade from '../../node_modules/@material-ui/core/Fade/Fade';
import HDWalletProvider from '../libs/truffle-hdwallet-provider';
import Done from '../../node_modules/@material-ui/icons/Done';
import Visibility from '../../node_modules/@material-ui/icons/Visibility';
import VisibilityOff from '../../node_modules/@material-ui/icons/VisibilityOff';
import { PageActions } from '../actions/index';
import { networks } from '../constants/networks';
import AuthHelper from '../helpers/AuthHelper';
import NetHelper from '../helpers/NetHelper';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';
import GoMainHeader from './GoMainHeader';
import { mainBorderRadius } from './StyledComponents';


const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '296px',
        height: '56px',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: mainBorderRadius
    },
    selectRoot: {
        display: 'flex',
        justifyContent: 'flex-start'
    },
    filledInput: {
        padding: '0',
        fontSize: '14px',
        display: 'inline-block'
    },
    selectInputRoot: {
        '&:focus': {
            background: 'inherit'
        }
    },
    selectRenderValue: {
        width: '296px',
        marginTop: '16px',
        padding: '0 16px'
    },
    selectIcon: {
        height: '25px',
        lineHeight: '1em',
        padding: '0',
    },
    dropDownIcon: {
        fontSize: '22px',
        display: 'inline-block',
        lineHeight: '1em',
        color: '#434343',
        marginTop: '1px',
        overflow: 'visible',
        width: '1px'
    },
    iconContainer: {
        fontSize: '12px',
        marginLeft: '5px',
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: '1em',
        cursor: 'pointer'
    },
    backdrop: {
        zIndex: 0
    },
    centerAnimation: {
        position: 'fixed',
        top: 'calc(50% - 44px)',
        left: 'calc(50% - 44px)',
    },
    menuItem: {
        position: 'relative',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        '&:focus': {
            outline: 'none'
        },
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.03)'
        },
        '&$menuItemSelected': {
            backgroundColor: '#fff'
        },
        '&$menuItemSelected:hover': {
            backgroundColor: 'rgba(0,0,0,0.03)'
        },
    },
    menuItemSelected: {},
    selectedIcon: {
        fontSize: '18px',
        float: 'right',
        display: 'inline-block',
        lineHeight: '1em',
        position: 'absolute',
        right: '10px',
        color: '#009d8b',
        top: '6px'
    },
    formControl: {
        borderRadius: mainBorderRadius
    }
});

const FieldNames = {
    address: 'address',
    password: 'password'
};

const saveFields = ['state', 'inputFields', 'account', 'abiMethods', 'abiData', 'payload', 'gasPrice'];

const PRETTY_JSON = 2;

class ContractScreen extends Component {
    constructor (props) {
        super(props);

        this.onLoad();

        const {networkName} = this.props.wallet;

        let networkUri = networkName;
        if (networks[networkName]) {
            networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
        }

        this.provider = new HDWalletProvider('', networkUri);
        this.testWeb3 = new Web3(this.provider);

        this.updateGasPrice()
    }

    onLoad() {
        if (this.props.screen.currentScreenData) {
            const savedData = this.props.screen.currentScreenData.data;
            saveFields.forEach(fieldName => {
                this[fieldName] = savedData[fieldName];
            });

            this.fields = {
                address: new InputFieldInState({value: savedData.fields.address}, FieldNames.address, this),
                password: new InputFieldInState({value: savedData.fields.password}, FieldNames.password, this)
            };

            this.state.address.value = savedData.fields.address;
            this.state.password.value = savedData.fields.password;

        } else {
            this.state = {
                address: {value: '', error: ''},
                password: {value: '', error: ''},
                openDialogue: false,
                openSelectDialog: false,
                showPassword: false,
                abiFileName: '',
                abiFileError: '',
                abiMethods: [],
                methodName: '',
                lastResult: ''
            };

            this.fields = {
                address: new InputFieldInState({}, FieldNames.address, this),
                password: new InputFieldInState({}, FieldNames.password, this)
            };

            this.inputFields = [];

            this.account = null;
            this.abiMethods = [];
            this.abiData = {};

            this.payload = null;
            this.gasPrice = 1000000000;
        }
    }

    saveState() {
        const savedData = {};
        saveFields.forEach(fieldName => {
            savedData[fieldName] = this[fieldName];
        });
        savedData.fields = {address: this.fields.address.value, password: this.fields.password.value};

        this.props.pageActions.saveCurrentScreenState(savedData);
    }

    async updateGasPrice() {
        this.gasPrice = await this.testWeb3.eth.getGasPrice();
        this.provider.engine.stop();
        this.saveState();
    }

    updateInputs(methodName) {
        const {abiMethods} = this.state;
        if (methodName) {
            this.inputFields = abiMethods[methodName].inputs.map((inputDef, ind) => {
                return {
                    name: inputDef.name,
                    key: 'input_' + methodName + ind,
                    value: '',
                    error: '',
                    label: (inputDef.name ? inputDef.name : 'input') + ' ' + inputDef.type + ' (json)'
                };
            });

            if (abiMethods[methodName]['type'] === 'payable') {
                this.inputFields.push(
                    {
                        name: 'payable_amount',
                        key: 'payable_amount' ,
                        value: '',
                        error: '',
                        label: 'Amount'
                    }
                );
            }
        }
    }

    fileABIHandler(event) {
        const target = event.target;

        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = (theFile => {
                return e => {
                    const contractAbi = e.target.result;

                    let abiFileError = '';
                    try {
                        this.readABI(contractAbi);
                    } catch(e) {
                        console.log('error while readPK', e);
                        this.contractData = null;
                        abiFileError = 'Selected file does not contain the correct privateKey';
                    }
                    console.log('afterSelect:', abiFileError, theFile.name);
                    this.setState({abiFileName: theFile.name, abiFileError});
                    this.saveState();

                };
            })(target.files[0]);

            // Read in the abi file.
            reader.readAsText(target.files[0]);

        }
    }

    clickToSelectABIFile(event) {
        this.refs.abiFile.click();
    }

    readABI(contractAbi) {
        console.log('contract content', contractAbi);
        this.abiMethods = NetHelper.readAbi(contractAbi);
        if (!this.abiMethods) {
            throw new Error('invalid abi file');
        }
        const web3 = new Web3();
        this.contractData = new web3.eth.Contract(JSON.parse(contractAbi));
        console.log('contract content', this.contractData, this.abiMethods);
        this.abiData = JSON.parse(contractAbi);

        const methodName = Object.keys(this.abiMethods)[0];
        this.setState({abiMethods: this.abiMethods, methodName});
        this.updateInputs(methodName);
        this.saveState();
    }

    async onChangeAddress() {
        const address = this.fields.address.value;
        const {networkName} = this.props.wallet;
        console.log('addr is', address, networks[networkName]);
        if (networks[networkName]) {
            const abiContent = await NetHelper.getAbi(address, networkName);
            if (abiContent) {
                try {
                    this.readABI(abiContent);
                    this.saveState();
                    this.forceUpdate();
                } catch(e) {
                    console.log('abi from etherscan error:', e);
                }
            }
        }
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
        this.saveState();
    }

    handleClose() {

    }

    handleCloseMethodSelect() {
        this.setState({openSelectDialog: false});
        this.saveState();
    }

    handleOpenMethodSelect() {
        console.log('handleOpenMethodSelect');
        this.setState({openSelectDialog: true});
        this.saveState();
    }

    handleClickShowPassword() {
        this.setState(state => ({ showPassword: !state.showPassword }));
        this.saveState();
    }

    renderMethodValue(value) {
        const {classes} = this.props;
        const {abiMethods, methodName} = this.state;

        return (
            <Grid container justify='flex-start' className={classes.selectRenderValue}>
                <Typography noWrap={true}
                            color='inherit'>{value}</Typography>
            </Grid>
        );
    }

    handleChangeMethod(event) {
        this.setState({openSelectDialog: false, methodName: event.target.value});
        this.updateInputs(event.target.value);
        this.saveState();
    }

    async callMethod(event) {
        event.preventDefault();
        const toAddress = this.state.address.value;
        const {currentAccounts, accountIndex} = this.props.accounts;
        const {balance, networkName} = this.props.wallet;

        const accountAddress = currentAccounts[accountIndex];

        let isValid = true;

        if (!Web3.utils.isAddress(this.state.address.value)) {
            this.fields.address.error = 'Invalid address';
            isValid = false;
        }

        const methodInfo = this.abiMethods[this.state.methodName];
        let data = '';
        if (methodInfo['stateMutability'] !== 'view') {
            data = AuthHelper.getUserDataFormStorage(this.props.accounts.currentLogin, this.state.password.value);
            if (!data) {
                this.fields.password.error = 'Password is invalid';
                isValid = false;
            }
        }

        const args = [];
        let amount = 0;
        let amount_str = '';
        this.inputFields.map(inputDef => {
            if (inputDef['name'] !== 'payable_amount') {
                let data = null;
                try {
                    data = JSON.parse(inputDef.value);
                } catch(e) {
                    isValid = false;
                    inputDef.error = 'Invalid format: ' + e.message;
                    console.log('parse Error', inputDef);
                }
                args.push(data);
            } else {
                amount = parseFloat(inputDef['value']);
                amount_str = inputDef['value'];
                if (Number.isNaN(amount)) {
                    inputDef['error'] = 'incorrect amount';
                    isValid = false;
                } else if (amount <= 0) {
                    inputDef['error'] = 'Amount mast be greater then 0';
                    isValid = false;
                } else if (amount > balance) {
                    inputDef['error'] = 'Amount mast be less then you have';
                    isValid = false;
                }
            }
        });

        if (isValid) {
            // connect
            let web3 = null;

            const optionsObject = {
                from: accountAddress
            };

            // authorize by mnemonic
            let onEnd = () => {};
            if (typeof data === 'string') {
                let networkUri = networkName;
                if (networks[networkName]) {
                    networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
                }

                const provider = new HDWalletProvider(data, networkUri, 0, 10);
                onEnd = () => {provider.engine.stop()};
                web3 = new Web3(provider);

                web3.eth.defaultAccount = accountAddress;
            } else {
                let networkUri = networkName;

                if (networks[networkName]) {
                    networkUri = `https://${networkName}.infura.io/v3/ac236de4b58344d88976c12184cde32f`;
                }

                web3 = new Web3(new Web3.providers.HttpProvider(networkUri));
                web3.eth.accounts.wallet.add(data);
            }

            this.setState({sendInProgress: true});
            try {
                const contract = new web3.eth.Contract(this.abiData, toAddress, optionsObject);

                let transactionInfo = null;
                if (methodInfo['stateMutability'] === 'view') {

                    transactionInfo = await contract.methods[this.state.methodName]
                        .apply(contract, args).call(optionsObject);
                } else {
                    const method = contract.methods[this.state.methodName]
                        .apply(contract, args);
                    const gasLimit = await method.estimateGas(optionsObject);
                    console.log('gasLimit', gasLimit);
                    optionsObject.gas = gasLimit;
                    optionsObject.gasPrice = this.gasPrice;
                    if (amount) {
                        optionsObject.value = Web3.utils.toWei(amount_str, 'ether');
                    }

                    console.log('optionsObject', optionsObject);
                    transactionInfo = await method.send(optionsObject);
                }

                console.log('TransactionInfo:', transactionInfo);
                this.setState({lastResult: JSON.stringify(transactionInfo, null, PRETTY_JSON)});

            } catch (error) {
                console.log('TransactionError:', error);
            }
            onEnd();
            this.setState({sendInProgress: false});
            this.saveState();
            //this.props.pageActions.getBalance();

        } else {
            this.saveState();
            this.forceUpdate();
        }

    }

    render() {

        const {classes} = this.props;
        const {abiMethods, methodName, lastResult} = this.state;
        console.log('abiMethods', abiMethods);
        const SelectMethodItems = Object.keys(abiMethods).map(method => {
            const methodDesc = abiMethods[method];
            console.log('methodName', method);
            let selectedIcon = null;
            if (method === methodName) {
                const className = classes.selectedIcon;
                selectedIcon = <span className={className}>
                    <Done color='inherit' fontSize='inherit'/>
                </span>
            }

            return (
                <Grid key={method} value={method} className={classes.menuItem}>
                    <Grid container
                          style={{padding: '0 16px'}}
                          justify='flex-start'>
                        <Typography noWrap={true}
                                    style={{maxWidth: '245px'}}
                                    color='inherit'>{method}</Typography>
                        {selectedIcon}
                    </Grid>
                </Grid>
            );
        });

        let inputFields = null;

        let methodDesc = null;
        if (methodName) {
            methodDesc = abiMethods[methodName];
            inputFields = this.inputFields.map((inputDesc, ind) => {
                return <Grid
                    key={inputDesc.key}
                    container
                    style={{ paddingTop: '32px' }}
                    justify='center'>
                    <FormControl
                        variant="filled"
                        error={!!inputDesc.error}>
                        <InputLabel htmlFor="component-filled">{inputDesc.label}</InputLabel>
                        <FilledInput id="component-filled"
                                     multiline
                                     value={inputDesc.value}
                                     onChange={event => {
                                         inputDesc.value = event.target.value;
                                         inputDesc.error = '';
                                         this.saveState();
                                         this.forceUpdate();
                                     }} />
                        {inputDesc.error
                            ? <FormHelperText>{inputDesc.error}</FormHelperText>
                            : null
                        }
                    </FormControl>
                </Grid>
            });
        }



        return (
            <Grid
                container
                justify='center'>
                <GoMainHeader screenName={ScreenNames.SIGN_IN_SCREEN}>
                    Sign Up
                </GoMainHeader>
                <form>
                    <Grid
                        container
                        style={{ padding: '24px 32px 12px 32px' }}
                        size='small'
                        justify='center'>
                        <Grid
                            container
                            justify='flex-start'
                            item xs={6}>
                            <Button variant='outlined' onClick={this.clickToSelectABIFile.bind(this)}>+ ABI file</Button>
                        </Grid>
                        <Grid
                            container
                            justify='flex-start'
                            alignItems='center'
                            style={{paddingLeft: '12px'}}
                            item xs={6}>
                            <input ref='abiFile' type='file' onChange={this.fileABIHandler.bind(this)}
                                   style={{width:'1px', height:'1px', overflow:'hidden', visibility: 'hidden'}}
                            />
                            <Typography noWrap style={{maxWidth: '125px'}}>
                                {this.state.abiFileName}
                            </Typography>
                        </Grid>
                    </Grid>
                    {
                        this.state.abiFileError
                            ? <Grid
                                container
                                style={{ padding: 0, borderTop: '1px solid #b00020', margin: '0 32px', width: 'auto'}}
                                size='small'
                                justify='center'>
                                <Typography style={{color: '#b00020', fontSize: '12px'}}>
                                    {this.state.abiFileError}
                                </Typography>
                            </Grid>
                            : null
                    }
                    <Grid
                        container
                        style={{ padding: '24px 32px 12px 32px' }}
                        size='small'
                        justify='center'>
                        <FormControl
                            variant="filled">
                            <InputLabel htmlFor="component-filled">Method</InputLabel>
                            <Select
                                variant='filled'
                                className={classes.selectInput}
                                value={this.state.methodName}
                                open={this.state.openSelectDialog}
                                onChange={this.handleChangeMethod.bind(this)}
                                onOpen={this.handleOpenMethodSelect.bind(this)}
                                onClose={this.handleCloseMethodSelect.bind(this)}
                                renderValue={this.renderMethodValue.bind(this)}
                                classes={{
                                    selectMenu: classes.filledInput,
                                    root: classes.selectRoot,
                                    select: classes.selectInputRoot,
                                    icon: classes.selectIcon
                                }}
                                input={<InputBase name="methodName"/>}
                            >
                                {SelectMethodItems}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.address.error}>
                            <InputLabel htmlFor="component-filled">Contract address</InputLabel>
                            <FilledInput id="component-filled"
                                         value={this.state.address.value}
                                         onChange={event => {
                                             this.setValue(event, FieldNames.address);
                                             this.onChangeAddress();
                                         }} />
                            {this.state.address.error
                                ? <FormHelperText id="component-error-text">{this.state.address.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    {inputFields}
                    {
                        lastResult
                            ? <Grid
                                container
                                style={{ paddingTop: '32px' }}
                                justify='center'>
                                <FormControl
                                    variant="filled">
                                    <InputLabel htmlFor="component-filled">Last call result:</InputLabel>
                                    <FilledInput id="component-filled"
                                                 multiline
                                                 disabled={true}
                                                 value={lastResult}/>
                                </FormControl>
                            </Grid>
                            : null
                    }
                    {
                        methodDesc && methodDesc['stateMutability'] !== 'view'
                            ? <Grid
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
                            : null
                    }
                    <Grid
                        container
                        style={{ padding: '32px 0' }}
                        justify='center'>
                        <Button variant='contained'
                                color='secondary'
                                disabled={this.abiMethods.length === 0}
                                onClick={this.callMethod.bind(this)}
                                size='large'>Call method</Button>
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
ContractScreen.propTypes = {
    accounts: PropTypes.object.isRequired,
    wallet: PropTypes.object.isRequired,
    screen: PropTypes.object.isRequired
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
        screen: state.screen,
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
)(ContractScreen));
