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
import AboutScreen from './AboutScreen'
import SignUpPrivateKeyScreen from './SignUpPrivateKeyScreen'


class App extends Component {
    constructor (props) {
        super(props);

        console.log('props:', props);
    }

    render() {
        const {currentScreen} = this.props.screen;

        let screenComponent = null;
        switch (currentScreen) {
            case ScreenNames.SIGN_UP_MNEMONIC:
                screenComponent = <SignUpMnemonicScreen/>
                break;
            case ScreenNames.SIGN_UP_CHOOSE_TYPE:
                screenComponent = <SignUpChooseType/>
                break;
            case ScreenNames.SEND_SCREEN:
                screenComponent = <SendScreen/>
                break;
            case ScreenNames.ABOUT_SCREEN:
                screenComponent = <AboutScreen/>
                break;
            case ScreenNames.MAIN_SCREEN:
                screenComponent = <MainScreen/>
                break;
            case ScreenNames.SIGN_UP_KEYS:
                screenComponent = <SignUpPrivateKeyScreen/>
                break;
            case ScreenNames.SIGN_IN_SCREEN:
            default:
                screenComponent = <SignInScreen/>
        }
        return (
            <div style={{width: '360px', height: '600px', overflow: 'auto'}}>
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
    screen: PropTypes.object.isRequired
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
