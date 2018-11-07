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
import { mainColor } from './StyledComponents';

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
                    <img src='./icons/logo-text.svg' style={{width: 280, height: 32}}/>
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
