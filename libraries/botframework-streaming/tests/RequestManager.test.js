const RequestManager = require( '../lib/payloads/requestManager');
const chai = require( 'chai');
var expect = chai.expect;

describe('RequestManager', () => {

    it('RequestManager starts empty', () => {
        let rm = new RequestManager.RequestManager();

        let count = rm.pendingRequestCount();
        expect(count)
            .to
            .equal(0);
    });

    it('RequestManager.getResponseAsync called twice throws', async () => {
        let rm = new RequestManager.RequestManager();
        let requestId = '123';
        rm.getResponse(requestId, undefined);

        rm.getResponse(requestId, undefined)
            .catch((reason) => expect(reason)
                .to
                .equal(`requestId \'${ requestId }\' already exists in RequestManager`));

    });

    it('RequestManager.signalResponse with no requestId returns false', async () => {
        let rm = new RequestManager.RequestManager();
        let requestId = '123';
        let response;
        let result = await rm.signalResponse(requestId, response);

        expect(result)
            .to
            .equal(false);
    });

    it('RequestManager end to end success', async () => {
        let rm = new RequestManager.RequestManager();
        let requestId = '123';
        let response;

        let promise = rm.getResponse(requestId, undefined);

        let result = await rm.signalResponse(requestId, response);
        expect(result)
            .to
            .equal(true);

        let receiveResponse = await promise;

        expect(receiveResponse)
            .to
            .equal(response);
        expect(rm.pendingRequestCount())
            .to
            .equal(0);
    });

});
