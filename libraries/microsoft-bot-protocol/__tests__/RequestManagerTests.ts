import { RequestManager } from '../src/Payloads/RequestManager';
import { ReceiveResponse } from '../src/ReceiveResponse';

describe('RequestManagerTests', () => {

  it('RequestManager starts empty', () => {
    let rm = new RequestManager();

    let count = rm.pendingRequestCount();
    expect(count)
      .toBe(0);
  });

  it('RequestManager.getResponseAsync called twice throws', async () => {
    let rm = new RequestManager();
    let requestId = '123';

    expect.assertions(1);
    rm.getResponseAsync(requestId, undefined);

    rm.getResponseAsync(requestId, undefined)
      .catch((reason) => expect(reason)
        .toBe('requestId already exists in RequestManager'));

  });

  it('RequestManager.signalResponse with no requestId returns false', async () => {
    let rm = new RequestManager();
    let requestId = '123';
    let response = new ReceiveResponse();

    let result = await rm.signalResponse(requestId, response);

    expect(result)
      .toBe(false);
  });

  it('RequestManager end to end success', async () => {
    let rm = new RequestManager();
    let requestId = '123';
    let response = new ReceiveResponse();

    let promise = rm.getResponseAsync(requestId, undefined);

    let result = await rm.signalResponse(requestId, response);
    expect(result)
      .toBe(true);

    let receiveResponse = await promise;

    expect(receiveResponse)
      .toBe(response);
    expect(rm.pendingRequestCount())
      .toBe(0);
  });

});
