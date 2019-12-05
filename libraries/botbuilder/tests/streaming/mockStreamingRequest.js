const { ActivityTypes } = require('botbuilder-core');

// Mock of botframework-streaming/src/ContentStream
class MockContentStream {
    constructor(options = {}) {
        const config = Object.assign({
            readAsJson: async () => ({ type: ActivityTypes.Invoke, serviceUrl: 'somewhere/', channelId: 'test' })
        }, options);

        this.readAsJson = config.readAsJson;
    }
}

// Mock of botframework-streaming/src/interfaces/IReceiveRequest
class MockStreamingRequest {
    constructor(options = {}) {
        const config = Object.assign({
            verb: 'POST',
            path: '/api/messages',
            streams: [new MockContentStream()]
        }, options);

        this.verb = config.verb;
        this.path = config.path;
        this.streams = config.streams;
    }
}

module.exports.MockContentStream = MockContentStream;
module.exports.MockStreamingRequest = MockStreamingRequest;
