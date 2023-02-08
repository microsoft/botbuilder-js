// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const sinon = require('sinon');
const { v4: uuid } = require('uuid');

const {
    ActivityTypes,
    Channels,
    MemoryStorage,
    TeamsSSOTokenExchangeMiddleware,
    TestAdapter,
    TestFlow,
    tokenExchangeOperationName,
    CloudAdapterBase,
} = require('../..');

const connectionName = 'connectionName';
const fakeExchangeableItem = 'fake token';
const exchangeId = 'exchange id';
const teamsUserId = 'teams.user.id';
const token = 'token';

const createConversationReference = (channelId = Channels.Msteams) => ({
    channelId,
    serviceUrl: 'https://test.com',
    user: {
        id: teamsUserId,
        name: teamsUserId,
    },
    bot: {
        id: 'bot',
        name: 'bot',
    },
    conversation: {
        isGroup: false,
        conversationType: 'convo1',
        id: 'conversation1',
    },
    locale: 'en-us',
});

class TeamsSSOAdapter extends TestAdapter {
    constructor(conversationReference, logic) {
        super(conversationReference);

        this._logic = logic.bind(this);
    }

    send() {
        return new TestFlow(this.processActivity(this.makeTokenExchangeActivity()), this);
    }

    makeTokenExchangeActivity() {
        return {
            type: ActivityTypes.Invoke,
            locale: this.locale || 'en-us',
            from: this.conversation.user,
            recipient: this.conversation.bot,
            conversation: this.conversation.conversation,
            serviceUrl: this.conversation.serviceUrl,
            id: uuid(),
            name: tokenExchangeOperationName,
            value: {
                token: fakeExchangeableItem,
                id: exchangeId,
                connectionName,
            },
        };
    }
}

describe('TeamsSSOTokenExchangeMiddleware', function () {
    describe('constructor', function () {
        it('throws if storage is falsy', function () {
            assert.throws(() => new TeamsSSOTokenExchangeMiddleware(null, 'oAuthConnectionName'));
        });

        it('throws if oAuthConnectionName is falsy', function () {
            const storage = new MemoryStorage();
            assert.throws(() => new TeamsSSOTokenExchangeMiddleware(storage, null));
            assert.throws(() => new TeamsSSOTokenExchangeMiddleware(storage, ''));
        });
    });

    describe('onTurn', function () {
        beforeEach(function () {
            this.sandbox = sinon.createSandbox();
        });

        afterEach(function () {
            this.sandbox.restore();
        });

        it('tokenExchanged fires', async function () {
            const logic = this.sandbox.fake(function (context) {
                assert.strictEqual(context.responded, false);

                return context.sendActivity('processed');
            });

            const adapter = new TeamsSSOAdapter(createConversationReference(), logic).use(
                new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName)
            );

            adapter.addExchangeableToken(connectionName, Channels.Msteams, teamsUserId, fakeExchangeableItem, token);

            await adapter.send('test').assertReply('processed').startTest();

            assert.strictEqual(logic.callCount, 1);
        });

        it('second tokenExchanged sends invoke response', async function () {
            const logic = this.sandbox.fake(function (context) {
                assert.strictEqual(context.responded, false);

                return context.sendActivity('processed');
            });

            const adapter = new TeamsSSOAdapter(createConversationReference(), logic).use(
                new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName)
            );

            adapter.addExchangeableToken(connectionName, Channels.Msteams, teamsUserId, fakeExchangeableItem, token);

            // Note: it's weird to break these up into two promises, but that's due to the override of
            // TestAdapter#send above and the fact that TestFlow#send is not overridden
            await adapter.send('test').assertReply('processed').startTest();
            await adapter
                .send('test')
                .assertReply((activity) => {
                    assert.strictEqual(activity.type, ActivityTypes.InvokeResponse);
                    assert.deepStrictEqual(activity.value, { body: null, status: 200 });
                })
                .startTest();

            assert.strictEqual(logic.callCount, 1);
        });

        it('yields precondition failed', async function () {
            const logic = this.sandbox.fake(function (context) {
                assert.strictEqual(context.responded, false);

                return context.sendActivity('processed');
            });

            // Note: addExchangeableToken omitted so exchange does not take place
            const adapter = new TeamsSSOAdapter(createConversationReference(), logic).use(
                new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName)
            );

            await adapter
                .send('test')
                .assertReply((activity) => {
                    assert.strictEqual(activity.type, ActivityTypes.InvokeResponse);
                    assert.deepStrictEqual(activity.value, {
                        body: {
                            connectionName,
                            failureDetail: 'The bot is unable to exchange token. Proceed with regular login.',
                            id: exchangeId,
                        },
                        status: 412,
                    });
                })
                .startTest();

            assert.strictEqual(logic.callCount, 0);
        });

        it('ignores direct line activities', async function () {
            const logic = this.sandbox.fake(function (context) {
                assert.strictEqual(context.responded, false);

                return context.sendActivity('processed');
            });

            const adapter = new TeamsSSOAdapter(createConversationReference(Channels.Directline), logic).use(
                new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName)
            );

            await adapter.send('test').assertReply('processed').startTest();

            assert.strictEqual(logic.callCount, 1);
        });
    });

    describe('exchangedToken', function () {
        beforeEach(function () {
            this.sandbox = sinon.createSandbox();
        });

        afterEach(function () {
            this.sandbox.restore();
        });
        it('exchange token with CloudAdapter', async function () {
            class TestCloudAdapter extends CloudAdapterBase {}
            const conversation = TestAdapter.createConversation('Convo1');
            const adapter = new TestCloudAdapter({});
            const context = new TurnContext(adapter, {
                channelId: Channels.Msteams,
                name: tokenExchangeOperationName,
                from: conversation.user,
                conversation: conversation.conversation,
                value: {
                    token: fakeExchangeableItem,
                    id: exchangeId,
                    connectionName,
                },
            });

            const exchangeToken = this.sandbox.stub().returns(Promise.resolve({ token: fakeExchangeableItem }));
            const logic = this.sandbox.stub();

            context.turnState.set(adapter.UserTokenClientKey, { exchangeToken });
            const middleware = new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName);
            await middleware.onTurn(context, logic);

            sinon.assert.calledOnce(exchangeToken);
            sinon.assert.calledOnce(logic);
        });

        it('exchange token with BotFrameworkAdapter', async function () {
            const conversation = TestAdapter.createConversation('Convo1');
            const adapter = new TestAdapter(conversation);
            const context = new TurnContext(adapter, {
                channelId: Channels.Msteams,
                name: tokenExchangeOperationName,
                from: conversation.user,
                conversation: conversation.conversation,
                value: {
                    token: fakeExchangeableItem,
                    id: exchangeId,
                    connectionName,
                },
            });

            const exchangeToken = this.sandbox
                .stub(adapter, 'exchangeToken')
                .returns(Promise.resolve({ token: fakeExchangeableItem }));
            const logic = this.sandbox.stub();

            const middleware = new TeamsSSOTokenExchangeMiddleware(new MemoryStorage(), connectionName);
            await middleware.onTurn(context, logic);

            sinon.assert.calledOnce(exchangeToken);
            sinon.assert.calledOnce(logic);
        });
    });
});
