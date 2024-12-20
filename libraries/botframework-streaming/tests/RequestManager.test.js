const { RequestManager } = require('../lib/payloads');
const { expect } = require('chai');
const { expectEventually } = require('./helpers');

const REQUEST_ID = '123';

describe('RequestManager', function () {
    it('starts empty', function () {
        const rm = new RequestManager();

        const count = rm.pendingRequestCount();
        expect(count).to.equal(0);
    });

    it('getResponse() called twice throws', async function () {
        const rm = new RequestManager();
        rm.getResponse(REQUEST_ID);

        rm.getResponse(REQUEST_ID).catch((reason) =>
            expect(reason).to.equal(`requestId '${REQUEST_ID}' already exists in RequestManager`),
        );
    });

    it('signalResponse() with no requestId returns false', async function () {
        const rm = new RequestManager();
        const requestId = '123';
        const result = await rm.signalResponse(requestId, undefined);

        expect(result).to.equal(false);
    });

    it('end to end success', async function () {
        const rm = new RequestManager();
        const requestId = '123';

        const promise = rm.getResponse(requestId, undefined);
        expect(rm.pendingRequestCount()).to.equal(1);

        const result = await rm.signalResponse(requestId, undefined);
        expect(result).to.equal(true);

        const receiveResponse = await promise;

        expect(receiveResponse).to.equal(undefined);
        expect(rm.pendingRequestCount()).to.equal(0);
    });

    describe('rejectAllResponses() is called', function () {
        let rm;
        let promise1;
        let promise2;

        this.beforeEach(function () {
            rm = new RequestManager();
            promise1 = rm.getResponse('1', undefined);
            promise2 = rm.getResponse('2', undefined);

            rm.rejectAllResponses('disconnected');
        });

        it('should reject all requests', async function () {
            (await expectEventually(promise1)).to.throw('disconnected');
            (await expectEventually(promise2)).to.throw('disconnected');
        });

        it('should have no pending requests', function () {
            expect(rm.pendingRequestCount()).to.equal(0);

            // Catching rejection to prevent Node.js reporting UnhandledPromiseRejection.
            promise1.catch(() => {});
            promise2.catch(() => {});
        });
    });
});
