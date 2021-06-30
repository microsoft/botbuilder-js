const { RequestManager } = require('../lib/payloads');
const { expect } = require('chai');
const REQUEST_ID = '123';

describe('RequestManager', function () {
    it('RequestManager starts empty', function () {
        const rm = new RequestManager();

        const count = rm.pendingRequestCount();
        expect(count).to.equal(0);
    });

    it('getResponse() called twice throws', async function () {
        const rm = new RequestManager();
        rm.getResponse(REQUEST_ID);

        rm.getResponse(REQUEST_ID).catch((reason) =>
            expect(reason).to.equal(`requestId '${REQUEST_ID}' already exists in RequestManager`)
        );
    });

    it('signalResponse() with no requestId returns false', async function () {
        const rm = new RequestManager();
        const requestId = '123';
        const result = await rm.signalResponse(requestId, undefined);

        expect(result).to.equal(false);
    });

    it('RequestManager end to end success', async function () {
        const rm = new RequestManager();
        const requestId = '123';

        const promise = rm.getResponse(requestId, undefined);

        const result = await rm.signalResponse(requestId, undefined);
        expect(result).to.equal(true);

        const receiveResponse = await promise;

        expect(receiveResponse).to.equal(undefined);
        expect(rm.pendingRequestCount()).to.equal(0);
    });
});
