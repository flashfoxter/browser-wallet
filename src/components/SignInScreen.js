import Button from '@material-ui/core/Button';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import AuthHelper from '../helpers/AuthHelper';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';

// f7
const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    }
});


const FieldNames = {
    login: 'login',
    password: 'password'
};

class SignInScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            login: {value: '', error: ''},
            password: {value: '', error: ''},
            showPassword: false
        };

        this.fields = {
            login: new InputFieldInState({}, FieldNames.login, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };
    }

    signIn(event) {
        event.preventDefault();
        let isValid = true;
        const login = this.state.login.value;
        const password = this.state.password.value;

        if (!login) {
            this.fields.login.error = 'Login can\'t be empty';
            isValid = false;
        }

        if (!password) {
            this.fields.password.error = 'Password can\'t be empty';
            isValid = false;
        }

        if (isValid) {
            const data = AuthHelper.getUserDataFormStorage(login, password);

            if (data) {
                // do login
                // get accounts
                let accounts = [];
                if (typeof data === 'string') {
                    accounts = AuthHelper.getAddressesFromMnemonic(data, 10);
                } else {
                    accounts = [data.address.toLowerCase()];
                }
                this.props.pageActions.signIn({
                    login,
                    accounts
                });
            } else {
                this.fields.login.error = 'Wrong login or password';
            }
        } else {
            const payload = {
                login: this.fields.login.error,
                password: this.fields.password.error
            };
        }
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    render() {

        return (
            <Grid
                container
                justify='center'>
                <form onSubmit={this.signIn.bind(this)}>
                    <Grid
                        container
                        style={{ padding: '39px 0 14px 0' }}
                        justify='center'>
                        <img src='./icons/ic-wallet-logo.svg' style={{width: 72, height: 72}}/>
                    </Grid>
                    <Grid
                        container
                        justify='center'>
                        <img src='./icons/logo-text.svg' style={{width: 280, height: 32}}/>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <FormControl
                            variant="filled"
                            error={!!this.state.login.error}>
                            <InputLabel htmlFor="component-filled">Login</InputLabel>
                            <FilledInput id="component-filled"
                                         value={this.state.login.value}
                                         onChange={event => this.setValue(event, FieldNames.login)} />
                            {this.state.login.error
                                ? <FormHelperText id="component-error-text">{this.state.login.error}</FormHelperText>
                                : null
                            }
                        </FormControl>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <TextField
                            variant="filled"
                            type={this.state.showPassword ? 'text' : 'password'}
                            label="Password"
                            value={this.state.password.value}
                            onChange={event => this.setValue(event, FieldNames.password)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={this.handleClickShowPassword}
                                        >
                                            {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '32px' }}
                        justify='center'>
                        <Button variant='contained'
                                color='secondary'
                                size='large'
                                type='submit'
                                onClick={this.signIn.bind(this)}>Log In</Button>
                    </Grid>
                    <Grid
                        container
                        style={{ paddingTop: '24px' }}
                        size='large'
                        justify='center'>
                        <Button color='secondary' onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SIGN_UP_CHOOSE_TYPE)}>Sign Up</Button>
                    </Grid>
                </form>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
SignInScreen.propTypes = {
    accounts: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
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

export default withStyles(styles)(connect(
    mapStateToProps,
    mapDispatchToProps
)(SignInScreen))
