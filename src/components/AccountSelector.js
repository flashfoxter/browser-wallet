import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import Popover from '@material-ui/core/Popover/Popover';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import Done from '@material-ui/icons/Done';
import * as copyText from 'copy-text-to-clipboard';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import Copy from './icons/Copy';
import QRIcon from './icons/QRCodeIcon';
import QRCode from './QRCode';


const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '234px',
        height: '25px',
    },
    selectRoot: {
        display: 'flex',
        justifyContent: 'center'
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
        width: '234px',
    },
    selectIcon: {
        //top: 'calc(50% - 12px)',
        //right: -25,
        height: '25px',
        display: 'none',
        position: 'relative',
        lineHeight: '1em',
        padding: '0',
    },
    dropDownIcon: {
        fontSize: '22px',
        display: 'inline-block',
        lineHeight: '1em',
        color: '#434343',
        marginTop: '3px',
        overflow: 'visible',
        width: '1px'
    },
    iconContainer: {
        fontSize: '12px',
        marginLeft: '5px',
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: '1em',
        cursor: 'pointer',
        '&:hover': {
            color: '#4c4c4c'
        }
    },
    menuItem: {
        position: 'relative',
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
        right: '20px',
        color: '#009d8b',
        top: '12px'
    },
    accountAddress: {
        color: 'rgba(0, 0, 0, 0.5)',
        width: '234px'
    },
    typography: {
        margin: theme.spacing.unit * 2,
    },
});

const POPOVER_TIMEOUT = 1500;

class AccountSelector extends Component {
    constructor (props) {
        super(props);

        this.state = {
            menuOpen: false,
            selectElement: null,
            popoverOpen: false,
            popoverAnchorEl: null,
            qrCodeModalOpen: false
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

    handleOnCloseQR() {
        this.setState({qrCodeModalOpen: false});
    }

    handleOnOpenQR() {
        this.setState({qrCodeModalOpen: true});
    }

    handleChange(event) {

        this.setState({menuOpen: false});
        this.props.pageActions.changeAccount({accountIndex: event.target.value});
        this.props.pageActions.getBalance();
    }

    copyAddress(event) {
        const {currentAccounts, accountIndex} = this.props.accounts;
        const accountAddress = currentAccounts[accountIndex];
        const popoverAnchorEl = event.target;
        copyText.default(accountAddress);
        this.setState({
            popoverOpen: true,
            popoverAnchorEl
        });
        setTimeout(() => {
            this.setState({
                popoverOpen: false,
                popoverAnchorEl: null
            });
        }, POPOVER_TIMEOUT);
    }

    renderValue(value) {
        const {classes} = this.props;

        return (
            <Grid container justify='center' className={classes.selectRenderValue}>
                <Typography variant='h5' >Account{value ? value : ''}</Typography>
                <span className={classes.dropDownIcon}>
                    <ArrowDropDown color='inherit' fontSize='inherit'/>
                </span>
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
                            root: classes.selectRoot,
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
                    <Typography noWrap={true} style={{width: '200px', fontSize: '12px'}}
                                onClick={this.copyAddress.bind(this)}
                                color='inherit'>{accountAddress}</Typography>
                    <span className={classes.iconContainer}
                        onClick={this.copyAddress.bind(this)}>
                        <Copy color='inherit' fontSize='inherit'/>
                    </span>
                    <span className={classes.iconContainer}
                          onClick={this.handleOnOpenQR.bind(this)}>
                        <QRIcon color='inherit' fontSize='inherit'/>
                    </span>
                    <Popover
                        id="simple-popper"
                        open={this.state.popoverOpen}
                        anchorEl={this.state.popoverAnchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <Typography className={classes.typography}>Address was copied to clipboard</Typography>
                    </Popover>
                    <Dialog
                        open={this.state.qrCodeModalOpen}
                        onClose={this.handleOnCloseQR.bind(this)}>
                        <DialogContent>
                            <QRCode value={accountAddress} size={210} level='Q'/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleOnCloseQR.bind(this)} color="secondary" autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
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
