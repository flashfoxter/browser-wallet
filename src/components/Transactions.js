import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import NetHelper from '../helpers/NetHelper';
import {PageActions} from '../actions/index';

const etherscanNetToURLMap = {
    rinkeby: 'https://rinkeby.etherscan.io/txs?a=',
    ropsten: 'https://ropsten.etherscan.io/txs?a=',
    kovan: 'https://kovan.etherscan.io/txs?a=',
    mainnet: 'https://etherscan.io/txs?a='
};

class Transactions extends Component {
    constructor (props) {
        super(props);

        console.log('props:', props);
        this.state = {transactions: [], showLoadingIndicator: false};
    }

    async sendTo(event) {
        const sendButton = event.target;
        const toAddress = this.refs.sendTo.value;
        const {web3, balance, accountAddress} = this.props.wallet;

        if (!web3.utils.isAddress(toAddress)) {
            alert('Destination address is not valid');
            return;
        }
        const amount = parseFloat(this.refs.amount.value);
        if (Number.isNaN(amount)) {
            alert('incorrect amount');
            return;
        } else if (amount <= 0) {
            alert('Amount mast be greater then 0');
            return;
        } else if (amount > balance) {
            alert('Amount mast be less then you have');
            return;
        }

        const transactionObject = {
            from: accountAddress,
            to: toAddress,
            value: web3.utils.toWei(this.refs.amount.value, 'ether')
        };

        sendButton.disabled = true;
        this.setState({showLoadingIndicator: true});
        try {
            const transactionInfo = await web3.eth.sendTransaction(transactionObject);
            console.log('TransactionInfo:', transactionInfo);
            this.setState({transactions: this.state.transactions.concat([transactionInfo])});
            // this.transactionInfo.innerText += `sent transaction with id: ${transactionInfo.transactionHash}\n`;
        } catch (error) {
            console.log('TransactionError:', error);
            const errorData = {key: Math.round((new Date()).getTime() / 1000), error};
            this.setState({transactions: this.state.transactions.concat([errorData])});
            // this.transactionInfo.innerText += `error while send transaction\n`;
        }
        this.setState({showLoadingIndicator: false});
        sendButton.disabled = false;

        this.props.pageActions.getBalance();
    }

    async getHistory(event) {
        const {networkName, accountAddress} = this.props.wallet;

        const historyButton = event.target;
        if (networkName) {
            const url = etherscanNetToURLMap[networkName] + accountAddress.toLowerCase();
            this.setState({showLoadingIndicator: true});
            historyButton.disabled = true;
            const responseBody = await NetHelper.httpRequest(url, 'GET');
            const historyEl = document.createElement('div');
            historyEl.innerHTML = responseBody;
            console.log(historyEl);
            // find table element
            const tableEl = historyEl.querySelector('#ContentPlaceHolder1_mainrow div div div table');
            if (tableEl) {
                // split all links from table
                const aTagLists = tableEl.querySelectorAll('a[href]');
                aTagLists.forEach((aTag) => {
                    aTag.removeAttribute('href');
                });

                //clear tag
                this.refs.historyTable.innerHTML = '';
                this.refs.historyTable.appendChild(tableEl);
            } else {
                this.refs.historyTable.innerHTML = 'can\'t get history';
            }
            this.setState({showLoadingIndicator: false});
            historyButton.disabled = false;
        } else {
            this.refs.historyTable.innerHTML = 'Can\'t get history for Custom network';
        }
    }

    render() {

        const transactions = this.state.transactions.map((transaction) => {
            if (transaction.error) {
                return <div key={transaction.key}>error while send transaction: {transaction.error.message}</div>;
            }
            return <div key={transaction.transactionHash}>sent transaction with id: {transaction.transactionHash}</div>
        });
        return (
            <div className="transactions">

                Send to: <input ref='sendTo' disabled={!this.props.wallet.isConnected} type='text' /><br/>
                Amount: <input ref='amount' disabled={!this.props.wallet.isConnected} type='text' /><br/>
                <button
                        onClick={this.sendTo.bind(this)}
                        disabled={!this.props.wallet.isConnected}>
                    Send
                </button><br/>
                <button
                        onClick={this.getHistory.bind(this)}
                        disabled={!this.props.wallet.isConnected}>
                    History
                </button><br/>
                <div style={{display: this.state.showLoadingIndicator ? 'block' : 'none'}}>
                    <img src="spinner.svg" />
                </div>
                {transactions}
                <div ref='historyTable' />
            </div>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
Transactions.propTypes = {
    wallet: PropTypes.object.isRequired
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Transactions)
