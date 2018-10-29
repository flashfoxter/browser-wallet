import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {PageActions} from '../actions/index'
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import {
    mainBorderRadius,
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
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import Done from '@material-ui/icons/Done';
import Exit from '@material-ui/icons/ExitToApp';
import { ArrayWithKeys } from '../models/ArrayWithKeys'
import Copy from './icons/Copy'
import Popover from '@material-ui/core/Popover/Popover'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '296px',
        height: '56px',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        border: mainBorderRadius
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
        // top: 'calc(50% - 12px)',
        // right: -25,
        height: '25px',
        // display: 'none',
        // position: 'relative',
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
    accountAddress: {
        color: 'rgba(0, 0, 0, 0.5)',
        width: '234px'
    },
    typography: {
        margin: theme.spacing.unit * 2,
    },
});

const POPOVER_TIMEOUT = 3000;

class SimpleAccountSelector extends Component {
    constructor (props) {
        super(props);

        this.state = {
            menuOpen: false,
            selectElement: null,
            popoverOpen: false,
            popoverAnchorEl: null
        };
        this.selectedElement = null;
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

        return (
            <Grid container justify='flex-start' className={classes.selectRenderValue}>
                <Typography noWrap={true}
                            color='inherit'>{accountAddress}</Typography>
            </Grid>
        );
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
                <Grid key={index} value={index} className={classes.menuItem}>
                    <Grid container
                          style={{padding: '0 16px'}}
                          justify='flex-start'>
                        <Typography noWrap={true}
                                    style={{maxWidth: '245px'}}
                                    color='inherit'>{accountAddr}</Typography>
                        {selectedIcon}
                    </Grid>
                </Grid>
            );
        });

        const accountAddress = currentAccounts[accountIndex];

        return (
            <FormControl
                variant="filled">
                <InputLabel htmlFor="component-filled">Send to</InputLabel>
                <Select
                    variant='filled'
                    className={classes.selectInput}
                    value={this.props.accounts.accountIndex}
                    open={this.state.menuOpen}
                    onChange={this.handleChange.bind(this)}
                    onOpen={this.handleOnOpen.bind(this)}
                    onClose={this.handleOnClose.bind(this)}
                    renderValue={this.renderValue.bind(this)}
                    classes={{
                        selectMenu: classes.filledInput,
                        root: classes.selectRoot,
                        select: classes.selectInputRoot,
                        icon: classes.selectIcon
                    }}
                    input={<InputBase name="accountAddress"/>}
                >
                    {menuItems}
                </Select>
            </FormControl>

        )
    }
}

/**
 * Set data types for App
 * @type {Object}
 */
SimpleAccountSelector.propTypes = {
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
)(SimpleAccountSelector))
