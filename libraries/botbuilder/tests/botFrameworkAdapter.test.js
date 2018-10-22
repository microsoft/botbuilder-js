const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { ChannelValidation } = require('botframework-connector');
const { BotFrameworkAdapter } = require('../');
const os = require('os');

const reference = {
    activityId: '1234',
    channelId: 'test',
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: { id: 'convo1' }
};
const incomingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference, true);
const outgoingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference);
const incomingInvoke = TurnContext.applyConversationReference({ type: 'invoke' }, reference, true);

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
        return {
            conversations: {
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
            }
        };
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

    status(status) {
        this.statusCode = status;
    }

    send(body) {
        assert(!this.ended, `response.send() called after response.end().`);
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

    it(`should processActivity().`, function (done) {
        let called = false;
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should processActivity() sent as body.`, function (done) {
        let called = false;
        const req = new MockBodyRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should check timestamp in processActivity() sent as body.`, function (done) {
        let called = false;
        let message = incomingMessage;
        message.timestamp = '2018-10-01T14:14:54.790Z';
        message.localTimestamp = '2018-10-01T14:14:54.790Z';
        const req = new MockBodyRequest(message);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.equal(typeof context.activity.timestamp, 'object', `'context.activity.timestamp' is not a date`);
            assert(context.activity.timestamp instanceof Date, `'context.activity.timestamp' is not a date`);
            assert.equal(typeof context.activity.localTimestamp, 'object', `'context.activity.localTimestamp' is not a date`);
            assert(context.activity.localTimestamp instanceof Date, `'context.activity.localTimestamp' is not a date`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            assertResponse(res, 200);
            done();
        });
    });

    it(`should reject a bogus request sent to processActivity().`, function (done) {
        const req = new MockRequest('bogus');
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 400, true);
            done();
        });
    });

    it(`should reject a request without activity type sent to processActivity().`, function (done) {
        const req = new MockBodyRequest({ text: 'foo' });
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 400, true);
            done();
        });
    });

    it(`should fail to auth on call to processActivity().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.failAuth = true;
        adapter.processActivity(req, res, (context) => {
            assert(false, `shouldn't have called bot logic.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 401, true);
            done();
        });
    });

    it(`should return 500 error on bot logic exception during processActivity().`, function (done) {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
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
            assert(context.activity, `context has no request.`);
            assert(context.activity.type === 'event', `request has invalid type.`);
            assert(context.activity.from && context.activity.from.id === reference.user.id, `request has invalid from.id.`);
            assert(context.activity.recipient && context.activity.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should createConversation().`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.createConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.activity, `context has no request.`);
            assert(context.activity.conversation && context.activity.conversation.id === 'convo2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should createConversation() and assign new serviceUrl.`, function (done) {
        let called = false;
        const adapter = new AdapterUnderTest();
        adapter.newServiceUrl = 'https://example.org/channel2';
        adapter.createConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.activity, `context has no request.`);
            assert(context.activity.conversation && context.activity.conversation.id === 'convo2', `request has invalid conversation.id.`);
            assert(context.activity.serviceUrl === 'https://example.org/channel2', `request has invalid conversation.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });

    it(`should fail to createConversation() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const bogus = Object.assign({}, reference);
        delete bogus.serviceUrl;
        adapter.createConversation(bogus, (context) => {
            assert(false, `bot logic shouldn't be called.`);
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should deliver a single activity using sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 1, `invalid number of responses returned.`);
            assert(responses[0].id === '5678', `invalid response returned.`);
            done();
        });
    });

    it(`should deliver multiple activities using sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, outgoingMessage]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 2, `invalid number of responses returned.`);
            done();
        });
    });

    it(`should wait for a 'delay' using sendActivities().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, { type: 'delay', value: 600 }, outgoingMessage]).then((responses) => {
            const end = new Date().getTime();
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 3, `invalid number of responses returned.`);
            assert((end - start) >= 500, `didn't pause for delay.`);
            done();
        });
    });

    it(`should wait for a 'delay' withut a value using sendActivities().`, function (done) {
        const start = new Date().getTime();
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.sendActivities(context, [outgoingMessage, { type: 'delay' }, outgoingMessage]).then((responses) => {
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
        adapter.processActivity(req, res, (context) => {
            return context.sendActivity({ type: 'invokeResponse', value: { status: 200, body: 'body' }})
        }).then(() => {
            assertResponse(res, 200, true);
            done();
        });
    });

    it(`should return 501 error if bot fails to return an 'invokeResponse'.`, function (done) {
        const req = new MockRequest(incomingInvoke);
        const res = new MockResponse();
        const adapter = new AdapterUnderTest();
        adapter.processActivity(req, res, (context) => {
            // don't return anything
        }).then(() => {
            assert(false, `shouldn't have passed.`);
        }, (err) => {
            assert(err, `error not returned.`);
            assertResponse(res, 501, false);
            done();
        });
    });

    it(`should fail to sendActivities().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.failOperation = true;
        const cpy = Object.assign({}, outgoingMessage);
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivities() without a serviceUrl.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { serviceUrl: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to sendActivities() without a conversation.id.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { conversation: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should post to a whole conversation using sendActivities() if replyToId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, outgoingMessage, { replyToId: undefined });
        adapter.sendActivities(context, [cpy]).then((responses) => {
            assert(Array.isArray(responses), `array of responses not returned.`);
            assert(responses.length === 1, `invalid number of responses returned.`);
            assert(responses[0].id === '5678', `invalid response returned.`);
            done();
        });
    });

    it(`should updateActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.updateActivity(context, incomingMessage).then(() => done());
    });

    it(`should fail to updateActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { serviceUrl: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { conversation: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to updateActivity() if activity.id missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, incomingMessage, { id: undefined });
        adapter.updateActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should deleteActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        adapter.deleteActivity(context, reference).then(() => done());
    });

    it(`should fail to deleteActivity() if serviceUrl missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { serviceUrl: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if conversation missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { conversation: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should fail to deleteActivity() if activityId missing.`, function (done) {
        const adapter = new AdapterUnderTest();
        const context = new TurnContext(adapter, incomingMessage);
        const cpy = Object.assign({}, reference, { activityId: undefined });
        adapter.deleteActivity(context, cpy).then((responses) => {
            assert(false, `shouldn't succeed`);
        }, (err) => {
            assert(err, `error not returned.`);
            done();
        });
    });

    it(`should create a User-Agent header with the same info as the host machine.`, function (done) {
        const adapter = new BotFrameworkAdapter();
        const client = adapter.createConnectorClient('https://example.com');
        const userAgentHeader = client.userAgentInfo.value;
        const pjson = require('../package.json');
        const userAgent = 'Microsoft-BotFramework/3.1 BotBuilder/' + pjson.version + ' (Node.js,Version=' + process.version + '; ' + os.type() + ' ' + os.release() + '; ' + os.arch() + ')';
        assert(userAgentHeader.includes(userAgent), `ConnectorClient doesn't have user-agent header created by BotFrameworkAdapter or header is incorrect.`);
        done();
    });

    it(`should set openIdMetadata property on ChannelValidation`, function (done) {
        const testEndpoint = "http://rainbows.com";
        const original = ChannelValidation.OpenIdMetadataEndpoint;
        const adapter = new BotFrameworkAdapter({openIdMetadata: testEndpoint});
        assert(testEndpoint === ChannelValidation.OpenIdMetadataEndpoint, `ChannelValidation.OpenIdMetadataEndpoint was not set.`);
        ChannelValidation.OpenIdMetadataEndpoint = original;
        done();
    });

    it(`should set oAuthEndpoint property on connector client`, function (done) {
        const testEndpoint = "http://rainbows.com";
        const adapter = new BotFrameworkAdapter({oAuthEndpoint: testEndpoint});
        const url = adapter.oauthApiUrl();
        assert(testEndpoint === url, `adapter.oauthApiUrl is incorrect.`);
        done();
    });

    it(`should throw error if missing serviceUrl in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in deleteConversationMember()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.deleteConversationMember({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing serviceUrl in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing serviceUrl',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing activityId in getActivityMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getActivityMembers({ activity: { serviceUrl: 'https://test.com', conversation: { id: '1' } } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id',
                `expected "BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing serviceUrl in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing serviceUrl',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing serviceUrl" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com' } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing conversation.id in getConversationMembers()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getConversationMembers({ activity: { serviceUrl: 'https://test.com', conversation: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id',
                `expected "BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });
    
    it(`should throw error if missing from in getUserToken()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getUserToken({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getUserToken(): missing from or from.id',
                `expected "BotFrameworkAdapter.getUserToken(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in getUserToken()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getUserToken({ activity: { from: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getUserToken(): missing from or from.id',
                `expected "BotFrameworkAdapter.getUserToken(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from in signOutUser()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.signOutUser({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.signOutUser(): missing from or from.id',
                `expected "BotFrameworkAdapter.signOutUser(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in signOutUser()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.signOutUser({ activity: { from: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.signOutUser(): missing from or from.id',
                `expected "BotFrameworkAdapter.signOutUser(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from in signOutUser()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getAadTokens({ activity: {} });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getAadTokens(): missing from or from.id',
                `expected "BotFrameworkAdapter.getAadTokens(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });

    it(`should throw error if missing from.id in getAadTokens()`, async function () {
        try {
            const adapter = new AdapterUnderTest();
            await adapter.getAadTokens({ activity: { from: {} } });
        } catch (err) {
            assert(err.message === 'BotFrameworkAdapter.getAadTokens(): missing from or from.id',
                `expected "BotFrameworkAdapter.getAadTokens(): missing from or from.id" Error message, not "${ err.message }"`);
            return;
        }
        assert(false, `should have thrown an error message`);
    });
});