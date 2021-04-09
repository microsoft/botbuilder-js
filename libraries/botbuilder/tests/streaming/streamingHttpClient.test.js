const assert = require('assert');
const { StreamingHttpClient } = require('../../lib');

describe('StreamingHttpClient', function() {
    this.timeout(3000);

    it('should construct when provided a server', () => {
        const server = { isConnected: true };
        const client = new StreamingHttpClient(server);
        assert.strictEqual(client.server, server);
    });

    it('should throw an error if missing the "server" parameter', () => {
        assert.throws(
            () => new StreamingHttpClient(),
            Error('StreamingHttpClient: Expected server.')
        );
    });

    it('should throw an error on sendRequest if missing "httpRequest" parameter', async () => {
        const client = new StreamingHttpClient({});

        await assert.rejects(
            client.sendRequest(),
            Error('StreamingHttpClient.sendRequest(): missing "httpRequest" parameter')
        );
    });

    it('should throw an error on sendRequest if internal server is not connected', async () => {
        const client = new StreamingHttpClient({});

        await assert.rejects(
            client.sendRequest({}),
            Error('StreamingHttpClient.sendRequest(): Streaming connection is disconnected, and the request could not be sent.')
        );
    });
});
