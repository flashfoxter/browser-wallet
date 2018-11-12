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
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Visibility from '../../node_modules/@material-ui/icons/Visibility';
import VisibilityOff from '../../node_modules/@material-ui/icons/VisibilityOff';
import { PageActions } from '../actions/index';
import AuthHelper from '../helpers/AuthHelper';
import { Mnemonic } from '../libs/jsbip39/jsbip39';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';
import GoMainHeader from './GoMainHeader';

const FieldNames = {
    mnemonic: 'mnemonic',
    login: 'login',
    password: 'password'
};

class SignUpMnemonicScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mnemonic: {value: '', error: ''},
            login: {value: '', error: ''},
            password: {value: '', error: ''},
            openDialogue: false,
            showPassword: false
        };

        this.fields = {
            mnemonic: new InputFieldInState({}, FieldNames.mnemonic, this),
            login: new InputFieldInState({}, FieldNames.login, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };
        this.payload = null;
    }

    signUp(event) {
        event.preventDefault();
        let isValid = true;

        if (!this.state.mnemonic.value) {
            this.fields.mnemonic.error = 'Mnemonic can\'t be empty';
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
            const accounts = AuthHelper.getAddressesFromMnemonic(this.state.mnemonic.value, 10);

            this.payload = {
                mnemonic: this.state.mnemonic.value,
                login: this.state.login.value,
                password: this.state.password.value,
                accounts
            };

            this.setState({openDialogue: true});
        } else {
            const payload = {
                mnemonic: this.fields.mnemonic.error,
                login: this.fields.login.error,
                password: this.fields.password.error
            };
        }
    }

    generateMnemonic() {
        const mnemonic = new Mnemonic('english');
        this.fields.mnemonic.value = mnemonic.generate();
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
                <form onSubmit={this.signUp.bind(this)} style={{width: '100%'}}>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.mnemonic.error}>
                            <InputLabel htmlFor="component-filled-mnemonic">Mnemonic</InputLabel>
                            <FilledInput id="component-filled-mnemonic"
                                         value={this.state.mnemonic.value}
                                         autoComplete="off"
                                         onChange={event => this.setValue(event, FieldNames.mnemonic)} />
                            {this.state.mnemonic.error
                                ? <FormHelperText>{this.state.mnemonic.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '24px' }}
                        size='small'
                        justify='center'>
                        <Button onClick={this.generateMnemonic.bind(this)}>Generate</Button>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
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
                                type='submit'
                                onClick={this.signUp.bind(this)}>Sign Up</Button>
                    </Grid>
                </form>
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
SignUpMnemonicScreen.propTypes = {
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
)(SignUpMnemonicScreen)
