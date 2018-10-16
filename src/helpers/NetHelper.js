const https = require('https');
const urlParser = require('url');
const Web3 = require('web3');

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
                reject(e);
            });
        });
    },
    async getBalance(address, network) {
        const requestURI = 'https://api.infura.io/v1/jsonrpc/'
            + network + '/eth_getBalance?params=[%22'
            + address + '%22,%22latest%22]';

        const response = await this.httpRequest(requestURI);
        const jsonResponse = JSON.parse(response);

        return Web3.utils.fromWei(jsonResponse.result, 'ether');
    }
};