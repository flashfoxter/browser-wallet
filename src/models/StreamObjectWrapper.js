const PING_PONG_TIMEOUT = 1000;

let streamId = 1;

function generateStreamId() {
    return streamId++;
}
export class StreamObjectWrapper {
    constructor(connectionStream, name) {
        this.connectionStream = connectionStream;
        this.subscriptions = {};
        this.lastPingId = 0;
        this.lastPingTime = 0;
        this.pingValue = 0;
        this.name = (name ? name : 'unnamed') + generateStreamId();
        this.pairName = '';
        this.handleData = (dataStr) => {
            try {
                if (typeof dataStr === 'object' && dataStr.name && dataStr.name === 'publicConfig') {
                    //skip
                } else if (dataStr === 'ACK') {
                    //skip
                } else {
                    const {eventName, data} = JSON.parse(dataStr);

                    if (this.subscriptions[eventName]) {
                        this.subscriptions[eventName](data);
                    }
                }
            } catch(e) {
                console.log('cant parse', dataStr);
                throw e;
            }
        };
        this.connectionStream.on('data', this.handleData);
        this.on('pong', (id) => {
            if (id === this.lastPingId) {
                this.pingValue = Date.now() - this.lastPingTime;
            } else {
                console.log('Pong but...', this.lastPingId, id);
            }
        });
        this.on('pairName', (name) => {
            this.pairName = name;
        });
        this.emit('pairName', this.name);
        this.on('ping', (id) => {
            this.emit('pong', id);
        });
        this.on('end', () => {});
        this.checkPongInterval = setInterval(
            () => {
                // console.log('ping value:', this.pingValue, 'name:', this.name, 'pairName:', this.pairName);
                if (this.pingValue > PING_PONG_TIMEOUT) {
                    console.log('check failed', this.pingValue);
                    this.close();
                }
            },
            PING_PONG_TIMEOUT
        );

        this.pingInterval = setInterval(
            () => {
                this.sendPing()
            },
            PING_PONG_TIMEOUT
        );
        this.sendPing();
    }

    sendPing() {
        this.lastPingId = Math.round(Math.random() * 1000);
        this.lastPingTime = Date.now();
        this.emit('ping', this.lastPingId);
    }

    on(eventName, cb) {
        // todo unsubscribes

        if (eventName === 'disconnected' || eventName === 'end') {
            this.subscriptions.disconnect = cb;

            this.connectionStream.on('end', () => {
                cb();
                this.close();
            });

        } else {
            this.subscriptions[eventName] = cb;

            return () => {
                delete this.subscriptions[eventName];
            };
        }
    }

    emit(eventName, data) {
        try {
            const sendObject = {eventName, data};
            this.connectionStream.write(JSON.stringify(sendObject));
        } catch(e) {
            //failed on write, need close connection
            this.close();
        }
    }

    close() {
        console.trace('close Stream', this.name, 'pair:', this.pairName);
        this.connectionStream.end();
        clearInterval(this.checkPongInterval);
        clearInterval(this.pingInterval);
    }
}