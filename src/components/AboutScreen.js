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
import {
    bigElementWidth,
    mainBorderRadius,
    mainColor,
    topPanelBackgroundColor,
    topPanelHeight
} from "./StyledComponents";
import Typography from "@material-ui/core/Typography";
import {ScreenNames} from "../reducers/screen";
import Close from '@material-ui/icons/Close';
import GoMainHeader from "./GoMainHeader";

// f7
const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    contentBlock: {
        margin: '24px 32px 0 32px'
    },
    link: {
        color: mainColor,
        textAlign: 'center',
        textDecoration: 'none'
    },
});

class AboutScreen extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid
                container
                justify='center'>
                <GoMainHeader screenName={ScreenNames.SIGN_IN_SCREEN}>
                    About
                </GoMainHeader>
                <Grid
                    container
                    style={{ padding: '39px 0 14px 0' }}
                    justify='center'>
                    <img src='./icons/ic-wallet-logo.svg' style={{width: 72, height: 72}}/>
                </Grid>
                <Grid
                    container
                    justify='center'>
                    <Typography variant="h6" color='secondary'>
                        Tiger Ethereum Wallet
                    </Typography>
                </Grid>
                <Grid
                    className={classes.contentBlock}
                    container
                    size='small'
                    justify='center'>
                    <Typography>
                        Text about application. Describe how the functions and about the team.
                        Text about application. Describe how the functions and about the team.
                        Text about application. Describe how the functions and about the team.
                    </Typography>
                </Grid>
                <Grid
                    className={classes.contentBlock}
                    style={{ paddingTop: '74px' }}
                    container
                    size='small'
                    justify='flex-start'>
                    <Typography>
                        More about our projects:<br />
                        <a href='http://www.gotiger.com' target='_blank' className={classes.link}>www.gotiger.com</a>
                    </Typography>
                </Grid>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
AboutScreen.propTypes = {
    classes: PropTypes.object.isRequired
};

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
    null,
    mapDispatchToProps
)(AboutScreen))
