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
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Web3 from 'web3';
import Visibility from '../../node_modules/@material-ui/icons/Visibility';
import VisibilityOff from '../../node_modules/@material-ui/icons/VisibilityOff';
import { PageActions } from '../actions/index';
import AuthHelper from '../helpers/AuthHelper';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';
import GoMainHeader from './GoMainHeader';

const FieldNames = {
    mnemonic: 'mnemonic',
    login: 'login',
    password: 'password'
};

class ContractScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            login: {value: '', error: ''},
            password: {value: '', error: ''},
            openDialogue: false,
            showPassword: false,
            abiFileName: '',
            abiFileError: ''
        };

        this.fields = {
            login: new InputFieldInState({}, FieldNames.login, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };

        this.account = null;

        this.payload = null;
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
                        console.log('contract content', contractAbi);
                        const web3 = new Web3();
                        this.contractData = new web3.eth.Contract(JSON.parse(contractAbi));
                        console.log('contract content', this.contractData);
                    } catch(e) {
                        console.log('error while readPK', e);
                        this.contractData = null;
                        abiFileError = 'Selected file does not contain the correct privateKey';
                    }
                    console.log('afterSelect:', abiFileError, theFile.name);
                    this.setState({abiFileName: theFile.name, fileError: abiFileError});

                };
            })(target.files[0]);

            // Read in the abi file.
            reader.readAsText(target.files[0]);

        }
    }

    clickToSelectABIFile(event) {
        this.refs.abiFile.click();
    }

    signUp() {
        let isValid = true;

        if (!this.account) {
            isValid = false;
        }

        if (!this.state.login.value) {
            this.fields.login.error = 'Login can\'t be empty';
            isValid = false;
        } else {
            const isExists = AuthHelper.checkExistsUserInStorage(this.state.login.value);
            if (isExists) {
                this.fields.login.error = 'Login already used';
                isValid = false;
            }
        }

        if (!this.state.password.value) {
            this.fields.password.error = 'Password can\'t be empty';
            isValid = false;
        }

        if (isValid) {
            const accounts = [this.account.address.toLowerCase()];

            this.payload = {
                account: this.account,
                login: this.state.login.value,
                password: this.state.password.value,
                accounts
            };

            this.setState({openDialogue: true});
            console.log('isValid Form', this.payload);
        } else {
            const payload = {
                account: this.account,
                login: this.fields.login.error,
                password: this.fields.password.error
            };

            console.log('inValid Form', payload);
        }
    }

    fileHandler(event) {
        const target = event.target;

        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = (theFile => {
                return e => {
                    const privateKey = e.target.result;

                    let fileError = '';
                    try {
                        const web3 = new Web3();
                        this.account = web3.eth.accounts.privateKeyToAccount(privateKey);
                        console.log(this.account);
                    } catch(e) {
                        console.log('error while readPK', e);
                        this.account = null;
                        fileError = 'Selected file does not contain the correct privateKey';
                    }
                    console.log('afterSelect:', fileError, theFile.name);
                    this.setState({fileName: theFile.name, fileError});

                };
            })(target.files[0]);

            // Read in the private key file.
            reader.readAsText(target.files[0]);

        }
    }

    clickToSelectFile(event) {
        console.log('event', event, this.refs.pk);
        this.refs.pk.click();
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
    }

    handleClose() {
        this.setState({openDialogue: false});
        this.props.pageActions.signUp(this.payload);
    }

    handleClickShowPassword() {
        this.setState(state => ({ showPassword: !state.showPassword }));
    }

    render() {

        return (
            <Grid
                container
                justify='center'>
                <GoMainHeader screenName={ScreenNames.SIGN_IN_SCREEN}>
                    Sign Up
                </GoMainHeader>
                <Grid
                    container
                    style={{ padding: '24px 32px 12px 32px' }}
                    size='small'
                    justify='center'>
                    <Grid
                        container
                        justify='flex-start'
                        item xs={6}>
                        <Button variant='outlined' onClick={this.clickToSelectABIFile.bind(this)}>+ Private key</Button>
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
                            {this.state.fileName}
                        </Typography>
                    </Grid>
                </Grid>
                {
                    this.state.abiFileError
                        ? <Grid
                            container
                            style={{ padding: '0 32px 0 32px', borderTop: '1px solid #b00020' }}
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
                    style={{ paddingTop: '24px' }}
                    justify='center'>
                    <FormControl
                        variant="filled"
                        error={!!this.state.login.error}>
                        <InputLabel htmlFor="component-filled-login">Login</InputLabel>
                        <FilledInput id="component-filled-login"
                                     value={this.state.login.value}
                                     onChange={event => this.setValue(event, FieldNames.login)} />
                        {this.state.login.error
                            ? <FormHelperText>{this.state.login.error}</FormHelperText>
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
                            onClick={this.signUp.bind(this)}>Sign Up</Button>
                </Grid>
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
    accounts: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
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
)(ContractScreen)
