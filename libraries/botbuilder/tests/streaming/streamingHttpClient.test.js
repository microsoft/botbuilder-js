const { expect } = require('chai');
const { StreamingHttpClient } = require('../../lib');

describe('StreamingHttpClient', function() {
    this.timeout(3000);

    it('should construct when provided a server', () => {
        const server = { isConnected: true };
        const client = new StreamingHttpClient(server);
        expect(client.server).to.equal(server);
    });

    it('should throw an error if missing the "server" parameter', () => {
        try {
            new StreamingHttpClient();
        } catch (err) {
            expect(err.message).to.contain('StreamingHttpClient: Expected server.');
        }
    });

    it('should throw an error on sendRequest if missing "httpRequest" parameter', async () => {
        const client = new StreamingHttpClient({});
        try {
            await client.sendRequest();
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.contain('StreamingHttpClient.sendRequest(): missing "httpRequest" parameter');
        }
    });

    it('should throw an error on sendRequest if internal server is not connected', async () => {
        const client = new StreamingHttpClient({});
        try {
            await client.sendRequest({});
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.contain('StreamingHttpClient.sendRequest(): Streaming connection is disconnected');
        }
    });
});
