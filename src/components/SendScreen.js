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
import {bigElementWidth} from "./StyledComponents";
import Typography from "@material-ui/core/Typography";
import {ScreenNames} from "../reducers/screen";
import GoMainHeader from './GoMainHeader'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
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
            showPassword: false
        };

        this.fields = {
            address: new InputFieldInState({}, FieldNames.address, this),
            amount: new InputFieldInState({}, FieldNames.amount, this),
            password: new InputFieldInState({}, FieldNames.password, this)
        };
    }

    async sendTo(event) {
        //connect then send
        const sendButton = event.target;
        const toAddress = this.refs.sendTo.value;
        const {web3, balance, accountAddress} = this.props.wallet;

        if (!web3.utils.isAddress(toAddress)) {
            alert('Destination address is not valid');
            return;
        }
        const amount = parseFloat(this.refs.amount.value);
        if (Number.isNaN(amount)) {
            alert('incorrect amount');
            return;
        } else if (amount <= 0) {
            alert('Amount mast be greater then 0');
            return;
        } else if (amount > balance) {
            alert('Amount mast be less then you have');
            return;
        }

        const transactionObject = {
            from: accountAddress,
            to: toAddress,
            value: web3.utils.toWei(this.refs.amount.value, 'ether')
        };

        sendButton.disabled = true;
        this.setState({showLoadingIndicator: true});
        try {
            const transactionInfo = await web3.eth.sendTransaction(transactionObject);
            console.log('TransactionInfo:', transactionInfo);
            this.setState({transactions: this.state.transactions.concat([transactionInfo])});
            // this.transactionInfo.innerText += `sent transaction with id: ${transactionInfo.transactionHash}\n`;
        } catch (error) {
            console.log('TransactionError:', error);
            const errorData = {key: Math.round((new Date()).getTime() / 1000), error};
            this.setState({transactions: this.state.transactions.concat([errorData])});
            // this.transactionInfo.innerText += `error while send transaction\n`;
        }
        this.setState({showLoadingIndicator: false});
        sendButton.disabled = false;

        this.props.pageActions.getBalance();
    }

    setValue(event, fieldName) {
        const value = event.target.value;
        this.fields[fieldName].value = value;
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

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
                        <Button variant='contained'
                                color='secondary'
                                size='large'
                                type='submit'
                                onClick={this.sendTo.bind(this)}>Log In</Button>
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
                                onClick={this.sendTo.bind(this)}>Send</Button>
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
SendScreen.propTypes = {
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
)(SendScreen))
