import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {PageActions} from '../actions/index';
import {ScreenNames} from '../reducers/screen';


class AppMenu extends Component {

    render() {

        return (
            <div className="menu">
                <button onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SIGN_IN_SCREEN)}>
                    Sign In
                </button>
                <button onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.SIGN_UP_SCREEN)}>
                    Sign Up
                </button>
                <button onClick={this.props.pageActions.changeScreen.bind(this, ScreenNames.MAIN_SCREEN)}>
                    MainScreen
                </button>
            </div>
        )
    }
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

export default connect(
    null,
    mapDispatchToProps
)(AppMenu)
