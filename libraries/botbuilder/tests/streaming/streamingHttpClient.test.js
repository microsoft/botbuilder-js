const assert = require('assert');
const { StreamingHttpClient } = require('../../lib');

describe('StreamingHttpClient', function () {
    this.timeout(3000);

    it('should construct when provided a server', function () {
        const server = { isConnected: true };
        const client = new StreamingHttpClient(server);
        assert.strictEqual(client.server, server);
    });

    it('should throw an error if missing the "server" parameter', function () {
        assert.throws(() => new StreamingHttpClient(), Error('StreamingHttpClient: Expected server.'));
    });

    it('should throw an error on sendRequest if missing "httpRequest" parameter', async function () {
        const client = new StreamingHttpClient({});

        await assert.rejects(
            client.sendRequest(),
            new Error('StreamingHttpClient.sendRequest(): missing "httpRequest" parameter')
        );
    });

    it('should throw an error on sendRequest if internal server is not connected', async function () {
        const client = new StreamingHttpClient({});

        await assert.rejects(
            client.sendRequest({}),
            new Error(
                'StreamingHttpClient.sendRequest(): Streaming connection is disconnected, and the request could not be sent.'
            )
        );
    });
});
