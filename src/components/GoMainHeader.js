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
import Typography from "@material-ui/core/Typography";

import Close from '@material-ui/icons/Close';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    }
});

class GoMainHeader extends Component {
    constructor (props) {
        super(props);
    }

    handleClickGoMain = () => {
        this.props.pageActions.changeScreen(this.props.screenName);
    };

    render() {
        const {classes} = this.props;


        return (
            <Grid
                container
                style={{
                    height: topPanelHeight,
                    backgroundColor: topPanelBackgroundColor
                }}>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={10}
                      className={classes.container}
                      container
                      alignItems='center'
                      justify='center'>
                    <Grid>
                        <Typography variant='h5'>
                            {this.props.children}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={1}
                      container
                      className={classes.container}
                      alignItems='center'
                      justify='flex-end'>
                    <IconButton
                        color='primary'
                        aria-label="Close"
                        disableRipple
                        onClick={this.handleClickGoMain}>

                        <Close/>
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
GoMainHeader.propTypes = {
    classes: PropTypes.object.isRequired,
    screenName: PropTypes.string.isRequired
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
)(GoMainHeader))
