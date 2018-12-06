import Button from '@material-ui/core/Button/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import Fade from '@material-ui/core/Fade/Fade';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Web3 from 'web3';
import { PageActions } from '../actions/index';
import { networks } from '../constants/networks';
import NetHelper from '../helpers/NetHelper';
import { store } from '../index';
import { mainLightTextColor } from './StyledComponents';

const etherscanNetToURLMap = {
    rinkeby: 'https://rinkeby.etherscan.io/txs?a=',
    ropsten: 'https://ropsten.etherscan.io/txs?a=',
    kovan: 'https://kovan.etherscan.io/txs?a=',
    mainnet: 'https://etherscan.io/txs?a='
};

const TIME_FORMAT = 'MMM-DD-YYYY hh:mm:ss A';

const styles = theme => ({
    greySubText: {
        color: mainLightTextColor,
        lineHeight: 1,
        marginTop: '-4px',
        fontSize: '12px'
    },
    historyButton: {
        padding: '0',
        minWidth: '232px',
        minHeight: '36px',
        fontSize: '14px',
        fontWeight: 600
    },
    column: {
        flexBasis: '50%',
        overflow: 'hidden'
    },
    heading: {
        color: mainLightTextColor,
        fontSize: theme.typography.pxToRem(12),
    },
    content: {
        color: '#000',
        fontSize: theme.typography.pxToRem(12),
    },
    transactionsTitle: {
        fontSize: theme.typography.pxToRem(20),
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500
    },
    expansionPanel: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '6px',
        boxShadow: 'none',
        '&:first-child': {
            borderRadius: '6px'
        }
    },
    expansionSummary: {
        width: '100%',
        '& > :last-child': {
            paddingRight: '0'
        }
    },
    directionIn: {
        width: '26px',
        height: '20px',
        borderRadius: '8px',
        border: 'solid 1px #009d8b',
        color: '#009d8b',
        fontSize: theme.typography.pxToRem(8),
        display: 'inline-block',
        lineHeight: '20px',
        textAlign: 'center',
        marginRight: '4px'
    },
    directionOut: {
        width: '26px',
        height: '20px',
        borderRadius: '8px',
        border: 'solid 1px #ff9600',
        color: '#ff9600',
        fontSize: theme.typography.pxToRem(8),
        display: 'inline-block',
        lineHeight: '20px',
        textAlign: 'center',
        marginRight: '4px'
    },
    directionSelf: {
        width: '26px',
        height: '20px',
        borderRadius: '8px',
        border: 'solid 1px #31bbfa',
        color: '#31bbfa',
        fontSize: theme.typography.pxToRem(8),
        display: 'inline-block',
        lineHeight: '20px',
        textAlign: 'center',
        marginRight: '4px'
    },
});

class Transactions extends Component {
    constructor (props) {
        super(props);

        const {networkName} = this.props.wallet;
        const {accountIndex} = this.props.accounts;

        this.state = {
            transactions: [],
            getTransactionsError: '',
            transactionsLoaded: false,
            showLoadingIndicator: false
        };

        this.lastNetworkName = networkName;
        this.lastAccountIndex = accountIndex;

    }

    componentDidMount() {
        this.storeSubscription = store.subscribe(() => this.storeChanged());
    }

    componentWillUnmount() {
        this.storeSubscription();
    }

    storeChanged() {
        const storeState = store.getState();
        const {networkName} = storeState.wallet;
        const {accountIndex} = storeState.accounts;

        if (this.lastNetworkName !== networkName || this.lastAccountIndex !== accountIndex) {
            this.lastNetworkName = networkName;
            this.lastAccountIndex = accountIndex;

            if (this.state.transactionsLoaded) {
                this.setState({
                    transactionsLoaded: false,
                    transactions: [],
                    getTransactionsError: '',
                    showLoadingIndicator: false
                });
            }
        }
    }

    async getHistory(event) {
        const {networkName} = this.props.wallet;
        const {currentAccounts, accountIndex} = this.props.accounts;
        const accountAddress = currentAccounts[accountIndex];
        const ACCOUNT_STR_LEN = 42;

        let historyData = [];

        if (networkName) {
            const url = etherscanNetToURLMap[networkName] + accountAddress.toLowerCase();
            this.setState({showLoadingIndicator: true});

            try {
                const responseBody = await NetHelper.httpRequest(url, 'GET');
                const historyEl = document.createElement('div');
                historyEl.innerHTML = responseBody;

                // find table element
                const tableEl = historyEl.querySelector('#ContentPlaceHolder1_mainrow div div div table');
                if (tableEl) {
                    //collecting data
                    const trElements = tableEl.querySelectorAll('tbody tr');
                    if (trElements && trElements.length) {
                        const noMatchesElement = trElements[0].querySelector('td[colspan="6"]');
                        if (!noMatchesElement) {
                            trElements.forEach(trElement => {
                                const transactionInfo = {};
                                transactionInfo.transactionHash = trElement.querySelector('td:nth-child(1)').innerText;
                                const dataSpan = trElement.querySelector('td:nth-child(3) span');

                                const attrs = {};
                                for (let i = dataSpan.attributes.length - 1; i >= 0; i--) {
                                    const attr = dataSpan.attributes[i];
                                    attrs[attr.name] = attr.value;
                                }

                                transactionInfo.createTime = attrs['title'] ? attrs['title'] : attrs['data-original-title'];
                                transactionInfo.direction = trElement.querySelector('td:nth-child(5)').innerText;
                                transactionInfo.direction = transactionInfo.direction.trim();
                                const fromATag = trElement.querySelector('td:nth-child(4) a[href]');
                                if (fromATag) {
                                    transactionInfo.from = fromATag.attributes.href.value;
                                    transactionInfo.from = transactionInfo.from.substr(-ACCOUNT_STR_LEN);
                                } else {
                                    transactionInfo.from = trElement.querySelector('td:nth-child(4)').innerText;
                                }

                                const toATag = trElement.querySelector('td:nth-child(6) a[href]');
                                if (toATag) {
                                    transactionInfo.to = toATag.attributes.href.value;
                                    transactionInfo.to = transactionInfo.to.substr(-ACCOUNT_STR_LEN);
                                } else {
                                    transactionInfo.to = trElement.querySelector('td:nth-child(6)').innerText;
                                }

                                transactionInfo.amount = trElement.querySelector('td:nth-child(7)').innerText;
                                transactionInfo.txFee = trElement.querySelector('td:nth-child(8)').innerText;

                                historyData.push(transactionInfo);
                            });
                        }
                    }

                    this.setState({transactions: historyData});
                } else {
                    try {
                        const response = await NetHelper.getHistory(accountAddress, networkName);
                        response.result.forEach(transaction => {
                            const transactionInfo = {};
                            transactionInfo.from = transaction.from;
                            transactionInfo.to = transaction.to;
                            transactionInfo.transactionHash = transaction.hash;
                            transactionInfo.createTime = moment.unix(transaction.timeStamp).format(TIME_FORMAT);
                            transactionInfo.direction = transaction.from === transaction.to
                                ? 'SELF'
                                : (transaction.from === accountAddress
                                    ? 'OUT' : 'IN'
                                  );
                            transactionInfo.amount = Web3.utils.fromWei(transaction.value, 'ether');
                            historyData.push(transactionInfo);
                        });
                        this.setState({transactions: historyData});

                    } catch(e) {
                        console.log('error while api req:', e);
                        this.setState({getTransactionsError: 'can\'t get history'});
                    }

                }

                this.setState({
                    showLoadingIndicator: false,
                    transactionsLoaded: true
                });
            } catch (e) {
                try {
                    const response = await NetHelper.getHistory(accountAddress, networkName);
                    response.result.forEach(transaction => {
                        const transactionInfo = {};
                        transactionInfo.from = transaction.from;
                        transactionInfo.to = transaction.to;
                        transactionInfo.transactionHash = transaction.hash;
                        transactionInfo.createTime = moment.unix(transaction.timeStamp).format(TIME_FORMAT);
                        transactionInfo.direction = transaction.from === transaction.to
                            ? 'SELF'
                            : (transaction.from === accountAddress
                                    ? 'OUT' : 'IN'
                            );
                        transactionInfo.amount = Web3.utils.fromWei(transaction.value, 'ether');
                        historyData.push(transactionInfo);
                    });
                    this.setState({transactions: historyData});

                } catch(e) {
                    console.log('error while api req:', e);
                    this.setState({getTransactionsError: 'can\'t get history'});
                }
                this.setState({
                    showLoadingIndicator: false,
                    transactionsLoaded: true
                });
            }
        } else {
            this.setState({getTransactionsError: 'can\'t get history'});
        }
    }

    render() {
        const {classes} = this.props;
        const {networkName} = this.props.wallet;
        const canGetHistory = !!networks[networkName];

        const transactions = this.state.transactions.map((transaction) => {

            if (transaction.error) {
                return <div key={transaction.key}>error while send transaction: {transaction.error.message}</div>;
            }

            let directionClassName = classes.directionSelf;
            let transactionAddr = transaction.to;

            if (transaction.direction === 'IN') {
                directionClassName = classes.directionIn;
                transactionAddr = transaction.from;
            } else if (transaction.direction === 'OUT') {
                directionClassName = classes.directionOut;
            }

            return (
                <Grid container key={transaction.transactionHash}
                         style={{padding: '0 16px 16px 16px'}}
                         justify='center'>
                    <ExpansionPanel className={classes.expansionPanel}>
                        <ExpansionPanelSummary classes={{content: classes.expansionSummary}}
                                               expandIcon={<ExpandMoreIcon />}>

                            <div className={classes.column}>
                                <Typography className={classes.heading}>Direction</Typography>
                                <Typography noWrap={true} style={{fontSize: '12px'}}
                                            className={classes.content}
                                            color='inherit'>
                                    <span className={directionClassName}>{transaction.direction}</span>
                                    {transactionAddr}
                                </Typography>
                            </div>
                            <div className={classes.column}>
                                <Typography className={classes.heading}>Value</Typography>
                                <Typography className={classes.content}>{transaction.amount}</Typography>
                            </div>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <div className={classes.column}>
                                <Typography className={classes.heading}>TxHash</Typography>
                                <Typography noWrap={true} style={{fontSize: '12px'}}
                                            className={classes.content}
                                            color='inherit'>
                                    {transaction.transactionHash}
                                </Typography>
                            </div>
                            <div className={classes.column}>
                                <Typography className={classes.heading}>Data and Time</Typography>
                                <Typography className={classes.content}>{transaction.createTime}</Typography>
                            </div>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
            );
        });

        return (
            <Grid container style={{paddingTop: '16px'}}>
                <Grid container
                    justify='center'>
                    <Typography variant='h6' className={classes.transactionsTitle}>Transaction History</Typography>
                </Grid>
                <Grid container
                      justify='center'>
                    <Typography variant='body2' className={classes.greySubText}>Info: etherscan.io</Typography>
                </Grid>

                <Grid container
                      style={{paddingTop: '16px'}}
                      justify='center'>

                    {
                        this.state.transactionsLoaded
                            ? (
                                this.state.transactions.length
                                    ? transactions
                                    :
                                    <Typography variant='body2'>
                                        No Transactions
                                    </Typography>
                            )
                            : (
                                this.state.showLoadingIndicator
                                    ? <Fade
                                            in={this.state.showLoadingIndicator}
                                            style={{
                                                transitionDelay: this.state.showLoadingIndicator ? '800ms' : '0ms',
                                            }}
                                            unmountOnExit>
                                          <CircularProgress/>
                                      </Fade>
                                    : <Button
                                            variant='outlined'
                                            onClick={this.getHistory.bind(this)}
                                            className={classes.historyButton}
                                            disabled={!canGetHistory}>
                                          Show History
                                      </Button>
                            )
                    }

                </Grid>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
Transactions.propTypes = {
    wallet: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        wallet: state.wallet,
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
)(Transactions))
