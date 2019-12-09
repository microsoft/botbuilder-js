const { randomBytes } = require('crypto');

class MockHttpRequest {
    constructor(options = {}) {
        const config = Object.assign({
            method: 'GET',
            headers: {
                'upgrade': 'websocket',
                'sec-websocket-key': randomBytes(16).toString('base64'),
                'sec-websocket-version': '13',
                'sec-websocket-protocol': ''
            }
        }, options);

        this.method = config.method;
        this.headers = config.headers;
    }

    setHeader(key, value) {
        this.headers[key] = value;
    }

    streams(value) {
        this.streamsVal = value;
    }

    streams() {
        return this.streamsVal;
    }
}

module.exports.MockHttpRequest = MockHttpRequest;
