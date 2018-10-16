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
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from "@material-ui/core/Typography";

import Lens from '@material-ui/icons/Lens';
import Exit from '@material-ui/icons/ExitToApp';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectInput: {
        width: '234px'
    },
    filledInput: {
        padding: '0px 0px 0px 8px',
        fontSize: '14px'
    },
    overrides: {
        MuiFilledInput: {
            root: {
                padding: '0px 0px 0px 8px',
                fontSize: '14px'
            }
        }
    }
});

const NetworkItemsForSelect = [
    {
        value: networks.rinkeby,
        label: 'Rinkeby Test Network',
        color: '#f35b38'
    },
    {
        value: networks.kovan,
        label: 'Kovan Test Network',
        color: '#31bbfa'
    },
    {
        value: networks.ropsten,
        label: 'Ropsten Test Network',
        color: '#7ed321'
    },
    {
        value: networks.mainnet,
        label: 'Main Ethereum Network',
        color: '#149c8b'
    }
];

class MainHeader extends Component {
    constructor (props) {
        super(props);

        this.state = {networkName: 'rinkeby'};
    }

    handleClickGoMain = () => {
        this.props.pageActions.changeScreen(this.props.screenName);
    };

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
        console.log('handleChange', event.target.name, event.target.value, this);
    }

    render() {
        const {classes} = this.props;

        const menuItems = NetworkItemsForSelect.map(itemDesc => {
            return <MenuItem value={itemDesc.value} key={itemDesc.value}
                    style={{fontSize: '14px', paddingLeft: '8px'}}>
                <span style={{color: itemDesc.color, fontSize: 16, margin: '2px 7px 0 0'}}><Lens
                    color='inherit'
                    fontSize='inherit'/></span>
                {itemDesc.label}
                </MenuItem>
        });

        return (
            <Grid
                container
                style={{
                    height: topPanelHeight,
                    backgroundColor: topPanelBackgroundColor
                }}>
                <Grid item xs={3}>
                    <img src='./icons/ic-wallet-logo.svg' style={{width: 44, height: 44}}/>
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
                                onChange={this.handleChange.bind(this)}
                                classes={{
                                    selectMenu: classes.filledInput
                                }}
                                input={<FilledInput className={classes.filledInput}
                                                    style={{padding: '0px 0px 0px 8px'}}
                                                    name="networkName"/>}
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
)(MainHeader))
