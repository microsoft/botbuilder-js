const assert = require('assert');
const { BotContext } = require('botbuilder-core');
const { BotFrameworkAdapter } = require('../');

const reference = { 
    activityId: '1234', 
    channelId: 'test', 
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: { id: 'convo1' }   
};
const incomingMessage = BotContext.applyConversationReference({ text: 'test', type: 'message' }, reference, true);
const outgoingMessage = BotContext.applyConversationReference({ text: 'test', type: 'message' }, reference);
const incomingInvoke = BotContext.applyConversationReference({ type: 'invoke' }, reference, true);

class AdapterUnderTest extends BotFrameworkAdapter {
    constructor(settings) {
        super(settings);
        this.failAuth = false;
        this.failOperation = false;
        this.expectAuthHeader = '';
        this.newServiceUrl = undefined;
    }

    testAuthenticateRequest(request, authHeader) { return super.authenticateRequest(request, authHeader) }
    testCreateConnectorClient(serviceUrl) { return super.createConnectorClient(serviceUrl) }

    authenticateRequest(request, authHeader) {
        assert(request, `authenticateRequest() not passed request.`);
        assert(authHeader === this.expectAuthHeader, `authenticateRequest() not passed expected authHeader.`);
        return this.failAuth ? Promise.reject(new Error('failed auth')) : Promise.resolve();
    }

    createConnectorClient(serviceUrl) {
        assert(serviceUrl, `createConnectorClient() not passed serviceUrl.`);
        return { conversations: {
            replyToActivity: (conversationId, activityId, activity) => {
                assert(conversationId, `replyToActivity() not passed conversationId.`);
                assert(activityId, `replyToActivity() not passed activityId.`);
                assert(activity, `replyToActivity() not passed activity.`);
                return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
            },
            sendToConversation: (conversationId, activity) => {
                assert(conversationId, `sendToConversation() not passed conversationId.`);
                assert(activity, `sendToConversation() not passed activity.`);
                return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
            },
            updateActivity: (conversationId, activityId, activity) => {
                assert(conversationId, `updateActivity() not passed conversationId.`);
                assert(activityId, `updateActivity() not passed activityId.`);
                assert(activity, `updateActivity() not passed activity.`);
                return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: '5678' });
            },
            deleteActivity: (conversationId, activityId) => {
                assert(conversationId, `deleteActivity() not passed conversationId.`);
                assert(activityId, `deleteActivity() not passed activityId.`);
                return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve();
            },
            createConversation: (parameters) => {
                assert(parameters, `createConversation() not passed parameters.`);
                return this.failOperation ? Promise.reject(new Error(`failed`)) : Promise.resolve({ id: 'convo2', serviceUrl: this.newServiceUrl });
            }
        }};
    }
}

class MockRequest {
    constructor(body, headers) {
        this.data = JSON.stringify(body);
        this.headers = headers || {};
    }

    on(event, handler) {
        switch (event) {
            case 'data':
                handler(this.data);
                break;
            case 'end': 
                handler();
                break;
        }
    }
}

class MockBodyRequest {
    constructor(body, headers) {
        this.body = body;
        this.headers = headers || {};
    }

    on(event, handler) {
        assert(false, `unexpected call to request.on().`);
    }
}

class MockResponse {
    constructor() {
        this.ended = false;
        this.statusCode = undefined;
        this.body = undefined;
    }

    send(status, body) {
        assert(!this.ended, `response.send() called after response.end().`);
        this.statusCode = status;
        this.body = body;
    }

    end() {
        assert(!this.ended, `response.end() called twice.`);
        assert(this.statusCode !== undefined, `response.end() called before response.send().`);
        this.ended = true;        
    }
}

function assertResponse(res, statusCode, hasBody) {
    assert(res.ended, `response not ended.`);
    assert(res.statusCode === statusCode, `response has invalid statusCode.`);
    if (hasBody) {
        assert(res.body, `response missing body.`);
   } else {
        assert(res.body === undefined, `response has unexpected body.`);
    }
}

describe(`BotFrameworkAdapter`, function () {
    this.timeout(5000);

    it(`should authenticateRequest() if no appId or appPassword.`, function (done) {
        const req = new MockRequest(incomingMessage);
        const adapter = new AdapterUnderTest();
        adapter.testAuthenticateRequest(req, '').then(() => done());
    });

    it(`should fail to authenticateRequest() if appId+appPassword and no headers.`, function (done) {
        const req = new MockRequest(incomingMessage);
        const adapter = new AdapterUnderTest({ appId: 'bogusApp', appPassword: 'bogusPassword' });
        adapter.testAuthenticateRequest(req, '').then(() => {
            assert(false, `shouldn't succeed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should createConnectorClient().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const adapter = new AdapterUnderTest();
        const client = adapter.testCreateConnectorClient(reference.serviceUrl);
        assert(client, `client not returned.`);
        assert(client.conversations, `invalid client returned.`);
        done();
    });
    
    it(`should processRequest().`, function (done) {
        let called = false;
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 202);
            done();
        });
    });

    it(`should processRequest() sent as body.`, function (done) {
        let called = false;
        const req = new MockBodyRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 202);
            done();
        });
    });

    it(`should reject a bogus request sent to processRequest().`, function (done) {
        const req = new MockRequest('bogus');
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 500, true);
            done();
        });
    });

    it(`should reject a request without activity type sent to processRequest().`, function (done) {
        const req = new MockBodyRequest({ text: 'foo' });
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 500, true);
            done();
        });
    });

    it(`should fail to auth on call to processRequest().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.failAuth = true;
        adapter.processRequest(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 401, true);
            done();
        });
    });

    it(`should return 500 error on bot logic exception during processRequest().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            throw new Error(`bot exception`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 500, true);
            done();
        });
    });
    
    it(`should continueConversation().`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.continueConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.request, `context has no request.`);
            assert(context.request.type === undefined, `request has invalid type.`);
            assert(context.request.from && context.request.from.id === reference.user.id, `request has invalid from.id.`);
            assert(context.request.recipient && context.request.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should startConversation().`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.startConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.request, `context has no request.`);
            assert(context.request.conversation && context.request.conversation.id === 'convo2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should startConversation() and assign new serviceUrl.`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.newServiceUrl = 'https://example.org/channel2';
        adapter.startConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.request, `context has no request.`);
            assert(context.request.conversation && context.request.conversation.id === 'convo2', `request has invalid conversation.id.`);
            assert(context.request.serviceUrl === 'https://example.org/channel2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });
    
    it(`should fail to startConversation() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const bogus = Object.assign({}, reference);
        delete bogus.serviceUrl;
        adapter.startConversation(bogus, (context) => {
            assert(false, `bot logic shouldn't be called.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should deliver a single activity using sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.sendActivity([outgoingMessage]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 1, `invalid number of responses returned.`);
            assert(responses[0].id === '5678', `invalid response returned.`);
            done();
        });
    });

    it(`should deliver multiple activities using sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.sendActivity([outgoingMessage, outgoingMessage]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 2, `invalid number of responses returned.`);
            done();
        });
    });

    it(`should wait for a 'delay' using sendActivity().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        adapter.sendActivity([outgoingMessage, { type: 'delay', value: 600 }, outgoingMessage]).then((responses) => {
            const end = new Date().getTime();
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 3, `invalid number of responses returned.`);
            assert((end - start) >= 500, `didn't pause for delay.`);
            done();
        });
    });

    it(`should wait for a 'delay' withut a value using sendActivity().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        adapter.sendActivity([outgoingMessage, { type: 'delay' }, outgoingMessage]).then((responses) => {
            const end = new Date().getTime();
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 3, `invalid number of responses returned.`);
            assert((end - start) >= 500, `didn't pause for delay.`);
            done();
        });
    });

    it(`should return bots 'invokeResponse'.`, function (done) {
        const req = new MockRequest(incomingInvoke);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            // don't return anything
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 500, true);
            done();
        });
    });

    it(`should return 500 error if bot fails to return an 'invokeResponse'.`, function (done) {
        const req = new MockRequest(incomingInvoke);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processRequest(req, res, (context) => {
            return context.sendActivity({ type: 'invokeResponse', value: { status: 200, body: 'body' }})
        }).then(() => {
            assertResponse(res, 200, true);
            done();
        });
    });

    it(`should fail to sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.failOperation = true;
        const cpy = Object.assign({}, outgoingMessage);
        adapter.sendActivity([cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivity() without a serviceUrl.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, outgoingMessage, { serviceUrl: undefined });
        adapter.sendActivity([cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivity() without a conversation.id.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, outgoingMessage, { conversation: undefined });
        adapter.sendActivity([cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should post to a whole conversation using sendActivity() if replyToId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, outgoingMessage, { replyToId: undefined });
        adapter.sendActivity([cpy]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 1, `invalid number of responses returned.`);
            assert(responses[0].id === '5678', `invalid response returned.`);
            done();
        });
    });

    it(`should updateActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.updateActivity(incomingMessage).then(() => done());
    });

    it(`should fail to updateActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, incomingMessage, { serviceUrl: undefined });
        adapter.updateActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, incomingMessage, { conversation: undefined });
        adapter.updateActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if activity.id missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, incomingMessage, { id: undefined });
        adapter.updateActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should deleteActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.deleteActivity(reference).then(() => done());
    });

    it(`should fail to deleteActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, reference, { serviceUrl: undefined });
        adapter.deleteActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, reference, { conversation: undefined });
        adapter.deleteActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if activityId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const cpy = Object.assign({}, reference, { activityId: undefined });
        adapter.deleteActivity(cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });
});