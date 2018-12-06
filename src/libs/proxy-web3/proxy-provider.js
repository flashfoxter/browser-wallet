export class ProxyProvider {
    constructor(stream, pageInfo) {
        this.stream = stream;
        this.pageInfo = pageInfo;
        this.lastId = 0;
        this.idRequestsMap = {};
        this.stream.on('sendResponse', data => this.processResponse(data));
    }

    sendAsync(payload, callback) {
        const currentRequestId = this.generarateNewId();
        this.idRequestsMap[currentRequestId] = callback;
        this.stream.emit('sendAsync', {payload, requestId: currentRequestId, additionalData: this.stream.additionalData});
    }

    send(payload, callback) {
        //console.trace('sendSync', payload, callback);
        if (callback) {
            this.sendAsync(payload, callback)
        } else {
            return this._sendSync(payload)
        }
    }

    processResponse(data) {
        const {requestId, payload} = data;
        if (this.idRequestsMap[requestId]) {
            const {response, err} = payload;

            this.idRequestsMap[requestId](err, response);
            delete this.idRequestsMap[requestId];
        } else {
            console.log('cant find callback in idRequestMap', data, this.idRequestsMap);
        }
    }

    _sendSync(payload) {
        console.trace('cant send sync', payload, ' Promise will be returned');
        return new Promise((resolve, reject) => {
            this.sendAsync(payload, (err, result) => {
                console.log('Promise: err is ', err, ' result is ', result);
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    generarateNewId() {
        return ++this.lastId;
    }
}