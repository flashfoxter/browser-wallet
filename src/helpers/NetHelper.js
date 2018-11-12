import https from 'https';
import urlParser from 'url';
import Web3 from 'web3';
import { ETHERSCAN_TOKEN } from '../constants/etherscan';
import { networks } from '../constants/networks';

const ETHERSCAN_NETWORKS_URI_MAP = {
    [networks.rinkeby]: 'https://api-rinkeby.etherscan.io',
    [networks.kovan]: 'https://api-kovan.etherscan.io',
    [networks.mainnet]: 'https://api.etherscan.io',
    [networks.ropsten]: 'https://api-ropsten.etherscan.io',
};

export default {
    async httpRequest(url, method, data) {
        return new Promise (function (resolve, reject) {
            const reqInfo = urlParser.parse(url);

            const options = {
                hostname: reqInfo.hostname,
                port: reqInfo.port ? reqInfo.port : reqInfo.protocol === 'https:' ? 443 : 80,
                path: reqInfo.path,
                method: method ? method : 'GET'
            };

            try {
                const req = https.request(options, function (res) {
                    res.on('data', function (uint8ArrayData) {
                        const str = String.fromCharCode.apply(null, uint8ArrayData);
                        resolve(str);
                    });
                });
                if (data) {
                    req.write(data);
                }
                req.end();

                req.on('error', function (e) {
                    console.log('error while request', e);
                    reject(e);
                });
            } catch(e) {
                console.log('catched e', e);
            }
        });
    },
    async getBalance(address, network) {
        const requestURI = 'https://api.infura.io/v1/jsonrpc/'
            + network + '/eth_getBalance?params=[%22'
            + address + '%22,%22latest%22]';

        const response = await this.httpRequest(requestURI);
        const jsonResponse = JSON.parse(response);

        return Web3.utils.fromWei(jsonResponse.result, 'ether');
    },
    async getHistory(address, network) {
        const domain = ETHERSCAN_NETWORKS_URI_MAP[network];

        const requestURI = domain + '/api?module=account&action=txlist&address='
                + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + ETHERSCAN_TOKEN;
        const response = JSON.parse(await this.httpRequest(requestURI));

        return response;
    },
    async getBalanceCustomRpc(uri, address, network) {
        const requestURI = 'https://api.infura.io/v1/jsonrpc/'
            + network + '/eth_getBalance?params=[%22'
            + address + '%22,%22latest%22]';

        const getBlockRequest = {
            id: 5311408654528138,
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params: ["latest", true]
        };
        const response = await this.httpRequest(requestURI);
        const jsonResponse = JSON.parse(response);

        return Web3.utils.fromWei(jsonResponse.result, 'ether');
    },
};