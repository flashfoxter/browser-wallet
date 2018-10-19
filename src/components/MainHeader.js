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

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '234px',
        height: '44px'
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
        top: 'calc(50% - 22px)',
        right: 0,
        borderLeft: '1px solid rgba(0,0,0,0.1)',
        height: '44px',
        padding: '0 4px',
    },
    iconContainer: {
        fontSize: '18px',
        marginRight: '5px',
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: '1em'
    },
    menuItem: {
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.03)'
        },
        '&:hover $deleteIcon': {
            color: 'rgba(0,0,0,0.2)',
            display: 'inline-block',
        },
        '&:hover $deleteIcon:hover': {
            color: 'rgba(0,0,0,0.3)',
        },
        '&$menuItemSelected': {
            backgroundColor: '#fff'
        },
        '&$menuItemSelected:hover': {
            backgroundColor: 'rgba(0,0,0,0.03)'
        },
    },
    menuItemSelected: {
        '&:hover $selectedIconWithDelete': {
            display: 'none'
        }
    },
    deleteIcon: {
        fontSize: '18px',
        float: 'right',
        display: 'none',
        lineHeight: '1em',
        position: 'absolute',
        right: '20px',
        color: 'rgba(0,0,0,0.2)',
        '&:hover': {
            color: 'rgba(0,0,0,0.3)',
        }
    },
    selectedIcon: {
        fontSize: '18px',
        float: 'right',
        display: 'inline-block',
        lineHeight: '1em',
        position: 'absolute',
        right: '20px',
        color: '#009d8b'
    },
    selectedIconWithDelete: {
        fontSize: '18px',
        float: 'right',
        display: 'inline-block',
        lineHeight: '1em',
        position: 'absolute',
        right: '20px',
        color: '#009d8b'
    }
});

const IconDiscColors = [
    '#f35b38',
    '#31bbfa',
    '#7ed321',
    '#149c8b',
    '#fdd835',
    '#fb8c00',
    '#7b1fa2',
    '#757575'
];

const NetworkType = {
    basic: 'basic',
    custom: 'custom'
}

const DEFAULT_NETWORK_ITEMS = [
    {
        value: networks.rinkeby,
        label: 'Rinkeby Test Network',
        type: NetworkType.basic
    },
    {
        value: networks.kovan,
        label: 'Kovan Test Network',
        type: NetworkType.basic
    },
    {
        value: networks.ropsten,
        label: 'Ropsten Test Network',
        type: NetworkType.basic
    },
    {
        value: networks.mainnet,
        label: 'Main Ethereum Network',
        type: NetworkType.basic
    }
];

class MainHeader extends Component {
    constructor (props) {
        super(props);

        const networksItems = this.props.wallet.networksItems;
        this.networkItemsForSelect = null;
        const networksListUpdate = this.onNetworkListUpdate.bind(this);

        if (networksItems && networksItems.length) {
            this.networkItemsForSelect = new ArrayWithKeys('value', networksItems, networksListUpdate);
        } else {

            this.networkItemsForSelect = new ArrayWithKeys('value', DEFAULT_NETWORK_ITEMS, networksListUpdate);
        }

        this.state = {
            networkName: this.props.wallet.networkName,
            menuOpen: false,
            customNetwork: null
        };

    }

    onNetworkListUpdate(networkItems) {
        console.log('update net Items', networkItems, this.props.pageActions.updateNetworkItems);
        this.props.pageActions.updateNetworkItems(networkItems);
    }

    onNetworkChange(networkName) {
        this.props.pageActions.changeNetwork(networkName);
        this.props.pageActions.getBalance();
    }

    handleClickGoMain = () => {
        this.props.pageActions.changeScreen(this.props.screenName);

    };

    handleOnOpen(event) {
        this.setState({menuOpen: true});
    }

    handleOnClose(event) {

        const tagName = event.target.tagName.toLowerCase();
        console.log(event.target.className);
        const className = typeof event.target.className === 'string' ? event.target.className.toLowerCase() : '';
        console.log('onClose', event.target, tagName, className);
        if (tagName === 'div' && className.indexOf('muibackdrop') > -1) {
            this.setState({menuOpen: false});
        }
    }

    handleChange(event) {
        if (event.target.value === 'custom') {
            this.setState({customNetwork: ''});

        } else if(event.target.value !== 'customInput'){
            this.setState({networkName: event.target.value, menuOpen: false});
            this.onNetworkChange(event.target.value);
        }
        console.log('handleChange', event.target.name, event.target.value, this);
    }

    networkRenderValue(value) {
        const {classes} = this.props;

        const index = this.networkItemsForSelect.getIndexByKey(value);
        const color = IconDiscColors[index % IconDiscColors.length];
        const itemDesc = this.networkItemsForSelect.getElementByKey(value);

        console.log('val', value, itemDesc, this.networkItemsForSelect.arr);

        return   (<span><span className={classes.iconContainer} style={{color}}>
                        <Lens color='inherit' fontSize='inherit'/>
                    </span>
            {itemDesc.label}</span>)
    }

    customNetworkDelete(event, itemDesc) {
        event.stopPropagation();
        let newValue = this.state.networkName;
        if (itemDesc.value === this.state.networkName) {
            newValue = this.networkItemsForSelect.arr[0].value;
            this.onNetworkChange(newValue);
        }
        this.networkItemsForSelect.removeByKey(itemDesc.value);
        this.setState({
            networkName: newValue,
        });
    }

    customNetworkBlur(event) {
        if (event.target.value) {
            const networkObj = {
                value: event.target.value,
                label: event.target.value,
                type: NetworkType.custom
            }
            try {
                this.networkItemsForSelect.addItem(networkObj);
            } catch(e) {
                console.log('Network already in list', e);
            }
            this.setState({
                networkName: networkObj.value,
                menuOpen: false,
                customNetwork: null
            });
            this.onNetworkChange(networkObj.value);
        } else {
            this.setState({
                menuOpen: false,
                customNetwork: null
            });
        }
    }

    render() {
        const {classes} = this.props;


        const menuItems = this.networkItemsForSelect.map((itemDesc, index) => {
            const color = IconDiscColors[index % IconDiscColors.length];

            let deleteIcon = null;
            if (itemDesc.type === NetworkType.custom) {

                deleteIcon = <span className={classes.deleteIcon}
                                   onClick={event => this.customNetworkDelete(event, itemDesc)}>
                    <Delete color='inherit' fontSize='inherit'/>
                </span>
            }

            let selectedIcon = null;
            if (itemDesc.value === this.state.networkName) {
                const className = deleteIcon ? classes.selectedIconWithDelete : classes.selectedIcon;
                selectedIcon = <span className={className}>
                    <Done color='inherit' fontSize='inherit'/>
                </span>
            }

            return <MenuItem value={itemDesc.value} key={itemDesc.value}
                             classes={{
                                 root: classes.menuItem,
                                 selected: classes.menuItemSelected
                             }}
                    style={{fontSize: '14px', paddingLeft: '8px'}}>

                    <span className={classes.iconContainer} style={{color}}>
                        <Lens color='inherit' fontSize='inherit'/>
                    </span>

                    {itemDesc.label}
                    {deleteIcon}
                    {selectedIcon}
                </MenuItem>
        });

        if (this.state.customNetwork !== null) {
            menuItems.push(
                <MenuItem value='customInput' key='customInput'
                          style={{fontSize: '14px', paddingLeft: '8px'}}>

                    <span className={classes.iconContainer}
                          style={{color: IconDiscColors[this.networkItemsForSelect.length % IconDiscColors.length]}}>
                        <Lens color='inherit' fontSize='inherit'/>
                    </span>

                    <InputBase className={classes.margin} value={this.state.customNetwork}
                               autoFocus={true}
                               onChange={event => this.setState({customNetwork: event.target.value})}
                               onBlur={this.customNetworkBlur.bind(this)}
                    />
                </MenuItem>
            );
        }

        menuItems.push(<Divider key='divider' />);
        menuItems.push(
            <MenuItem value='custom' key='custom'
                                 style={{fontSize: '14px', paddingLeft: '8px'}}>

                <span className={classes.iconContainer} style={{color: '#000'}}>
                    <Add color='inherit' fontSize='inherit'/>
                </span>
                Add New Network
            </MenuItem>
        );

        return (
            <Grid
                container
                style={{
                    height: topPanelHeight,
                    backgroundColor: topPanelBackgroundColor
                }}>
                <Grid item xs={3}
                      container
                      alignItems='center'
                      justify='flex-start'>
                    <img src='./icons/ic-wallet-logo.svg'
                         style={{width: 44, height: 44, marginLeft: 14}}/>
                </Grid>
                <Grid item xs={7}
                      className={classes.container}
                      container
                      alignItems='center'
                      justify='center'>
                    <Grid>
                        <FormControl variant="filled">
                            <Select
                                className={classes.selectInput}
                                value={this.state.networkName}
                                open={this.state.menuOpen}
                                onChange={this.handleChange.bind(this)}
                                onOpen={this.handleOnOpen.bind(this)}
                                onClose={this.handleOnClose.bind(this)}
                                renderValue={this.networkRenderValue.bind(this)}
                                classes={{
                                    selectMenu: classes.filledInput,
                                    select: classes.selectInputRoot,
                                    icon: classes.selectIcon
                                }}
                                input={<FilledInput name="networkName"/>}
                            >
                                {menuItems}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid item xs={2}
                      container
                      className={classes.container}
                      alignItems='center'
                      justify='flex-end'>
                    <IconButton
                        color='primary'
                        aria-label="Close"
                        disableRipple
                        onClick={this.handleClickGoMain}>

                        <Exit/>
                    </IconButton>
                </Grid>
            </Grid>
        )
    }
}

/**
 * Set data types for App
 * @type {Object}
 */
MainHeader.propTypes = {
    classes: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        wallet: state.wallet
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
)(MainHeader))
