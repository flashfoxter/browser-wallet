import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {PageActions} from '../actions/index'
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import {
    topPanelBackgroundColor,
    topPanelHeight
} from "./StyledComponents";
import {networks} from '../constants/networks';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from "@material-ui/core/Typography";
import Divider from '@material-ui/core/Divider';

import Lens from '@material-ui/icons/Lens';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Done from '@material-ui/icons/Done';
import Exit from '@material-ui/icons/ExitToApp';
import { ArrayWithKeys } from '../models/ArrayWithKeys'
import Copy from './icons/Copy'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '234px',
        height: '25px'
    },
    filledInput: {
        padding: '0px 0px 0px 8px',
        fontSize: '14px',
        display: 'flex'
    },
    selectInputRoot: {
        '&:focus': {
            background: 'inherit'
        }
    },
    selectIcon: {
        //top: 'calc(50% - 12px)',
        //right: -25,
        height: '25px',
        display: 'inline-block',
        position: 'relative',
        lineHeight: '1em',
        padding: '0',
    },
    iconContainer: {
        fontSize: '12px',
        marginLeft: '5px',
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: '1em'
    },
    menuItem: {
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
        right: '20px',
        color: '#009d8b'
    },
    accountAddress: {
        color: 'rgba(0, 0, 0, 0.5)'
    }
});

class AccountSelector extends Component {
    constructor (props) {
        super(props);

        this.state = {
            menuOpen: false,
        };
    }

    handleOnOpen(event) {
        this.setState({menuOpen: true});
    }

    handleOnClose(event) {

        const tagName = event.target.tagName.toLowerCase();
        const className = typeof event.target.className === 'string' ? event.target.className.toLowerCase() : '';
        if (tagName === 'div' && className.indexOf('muibackdrop') > -1) {
            this.setState({menuOpen: false});
        }
    }

    handleChange(event) {

        this.setState({menuOpen: false});
        this.props.pageActions.changeAccount({accountIndex: event.target.value});
        this.props.pageActions.getBalance();
    }

    renderValue(value) {
        const {classes} = this.props;
        const {currentAccounts} = this.props.accounts;

        const accountAddress = currentAccounts[value];

        return (<Typography variant='h5' >Account{value ? value : ''}</Typography>)
    }

    render() {
        const {classes} = this.props;
        const {currentAccounts, accountIndex} = this.props.accounts;

        const menuItems = currentAccounts.map((accountAddr, index) => {


            let selectedIcon = null;
            if (index === accountIndex) {
                const className = classes.selectedIcon;
                selectedIcon = <span className={className}>
                    <Done color='inherit' fontSize='inherit'/>
                </span>
            }

            return (
                <Grid key={index} value={index}>
                    <Grid container
                          justify='center'>
                        <Typography variant='h5' >Account{index ? index : ''}</Typography>
                    </Grid>
                    <Grid container
                          className={classes.accountAddress}
                          justify='center'>
                        <Typography noWrap={true} style={{width: '155px', fontSize: '12px'}}
                                    color='inherit'>{accountAddr}</Typography>
                        {selectedIcon}
                    </Grid>
                </Grid>
            );
        });

        const accountAddress = currentAccounts[accountIndex];

        return (

            <Grid>
                <Grid container
                      justify='center'>
                    <Select
                        className={classes.selectInput}
                        value={this.props.accounts.accountIndex}
                        open={this.state.menuOpen}
                        onChange={this.handleChange.bind(this)}
                        onOpen={this.handleOnOpen.bind(this)}
                        onClose={this.handleOnClose.bind(this)}
                        renderValue={this.renderValue.bind(this)}
                        classes={{
                            selectMenu: classes.filledInput,
                            select: classes.selectInputRoot,
                            icon: classes.selectIcon
                        }}
                        input={<InputBase name="accountAddress"/>}
                    >
                        {menuItems}
                    </Select>
                </Grid>
                <Grid container
                      className={classes.accountAddress}
                      justify='center'>
                    <Typography noWrap={true} style={{width: '205px', fontSize: '12px'}}
                                color='inherit'>{accountAddress}</Typography>
                    <span className={classes.iconContainer}>
                        <Copy color='inherit' fontSize='inherit'/>
                    </span>
                </Grid>
            </Grid>

        )
    }
}

/**
 * Set data types for App
 * @type {Object}
 */
AccountSelector.propTypes = {
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
)(AccountSelector))
