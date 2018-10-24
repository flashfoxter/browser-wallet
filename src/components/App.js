import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {PageActions} from '../actions/index'
import {ScreenNames} from "../reducers/screen";
import MainScreen from "./MainScreen";
import SignUpMnemonicScreen from "./SignUpMnemonicScreen";
import SignInScreen from "./SignInScreen";
import { MuiThemeProvider } from '@material-ui/core/styles';
import {theme} from './StyledComponents';
import SignUpChooseType from "./SignUpChooseType";
import SendScreen from './SendScreen'


class App extends Component {
    constructor (props) {
        super(props);

        console.log('props:', props);
    }

    render() {
        const { screen } = this.props;

        let screenComponent = null;
        if (screen === ScreenNames.MAIN_SCREEN) {
            screenComponent = <MainScreen/>
        } else if (screen === ScreenNames.SIGN_UP_MNEMONIC) {
            screenComponent = <SignUpMnemonicScreen/>
        } else if (screen === ScreenNames.SIGN_IN_SCREEN) {
            screenComponent = <SignInScreen/>
        } else if (screen === ScreenNames.SIGN_UP_CHOOSE_TYPE) {
            screenComponent = <SignUpChooseType/>
        } else if (screen === ScreenNames.SEND_SCREEN) {
            screenComponent = <SendScreen/>
        }
        return (
            <div className="app">
                <MuiThemeProvider theme={theme}>
                    {screenComponent}
                </MuiThemeProvider>
            </div>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
App.propTypes = {
    screen: PropTypes.string.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        screen: state.screen
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
