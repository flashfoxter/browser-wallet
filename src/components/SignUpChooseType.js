import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import { ScreenNames } from '../reducers/screen';
import GoMainHeader from './GoMainHeader';
import { mainBorderRadius, mainColor } from './StyledComponents';

// f7
const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    contentBlock: {
        margin: '24px 32px 0 32px'
    },
    chooseContainer: {
        width: '296px',
        height: '112px',
        borderRadius: mainBorderRadius,
        border: 'solid 1px rgba(0, 0, 0, 0.12)',
        cursor: 'pointer'
    },
    chooseContainerSub: {
        marginTop: '15px'
    },
    greenText: {
        color: mainColor,
        textAlign: 'center',
    },
    grayText: {
        color: theme.palette.text.disabled,
        textAlign: 'center',
    }
});


const FieldNames = {
    login: 'login',
    password: 'password'
};

class SignUpChooseType extends Component {
    constructor (props) {
        super(props);
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
                <GoMainHeader screenName={ScreenNames.SIGN_IN_SCREEN}>
                    Sign Up. Select Side
                </GoMainHeader>
                <Grid
                    className={classes.contentBlock}
                    container
                    size='small'
                    justify='center'>
                    <Typography>
                        To Sign Up, please generate Mnemonic or add your private and public keys.
                    </Typography>
                </Grid>
                <Grid
                    className={classes.contentBlock}
                    onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SIGN_UP_MNEMONIC)}
                    container
                    size='small'
                    justify='center'>
                    <Grid
                        container
                        className={classes.chooseContainer}
                        direction='column'
                        size='small'
                        alignItems='center'
                        justify='flex-start'>
                        <Grid
                            className={classes.chooseContainerSub}>

                            <Typography className={classes.greenText}>
                                Mnemonic
                            </Typography>

                        </Grid>
                        <Grid
                            className={classes.chooseContainerSub}>

                            <Typography className={classes.grayText}>
                                You will generate keywords
                            </Typography>

                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    className={classes.contentBlock}
                    onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SIGN_UP_KEYS)}
                    container
                    size='small'
                    justify='center'>
                    <Grid
                        container
                        className={classes.chooseContainer}
                        direction='column'
                        size='small'
                        alignItems='center'
                        justify='flex-start'>
                        <Grid
                            className={classes.chooseContainerSub}>

                            <Typography className={classes.greenText}>
                                Private and Public Keys
                            </Typography>

                        </Grid>
                        <Grid
                            className={classes.chooseContainerSub}>

                            <Typography className={classes.grayText}>
                                You will use already generated<br/>keys
                            </Typography>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
SignUpChooseType.propTypes = {
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
)(SignUpChooseType))
