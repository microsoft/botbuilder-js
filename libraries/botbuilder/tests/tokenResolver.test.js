const assert = require('assert');
const { TurnContext, CardFactory, BotCallbackHandlerKey } = require('botbuilder-core');
const { BotFrameworkAdapter } = require('../');
const { TokenResolver } = require('../lib/tokenResolver');

class MockAdapter extends BotFrameworkAdapter {
    constructor(botLogic, getUserTokenCallback) {
        super(undefined);

        this.botLogic = async (ctx) => { botLogic(ctx); };
        this.getUserTokenCallback = getUserTokenCallback;
    }

    createTurnContext(activity) {
        const context = new TurnContext(this, activity);
        context.turnState.set(BotCallbackHandlerKey, this.botLogic);
        return context;
    }

    getUserToken(context, connectionName, magicCode) {
        return Promise.resolve(this.getUserTokenCallback());
    }
}

function createOAuthCardActivity() {
    let activity = {
        activityId: '1234',
        channelId: 'test',
        serviceUrl: 'urn:botframework.com:websocket:wss://channel.com/blah',
        user: { id: 'user', name: 'User Name' },
        bot: { id: 'bot', name: 'Bot Name' },
        conversation: { 
            id: 'convo1',
            properties: {
                'foo': 'bar'
            }
        },
        attachments: [],
    };
    activity.attachments.push(CardFactory.oauthCard('foo', 'sign-in'));
    return activity;
}

describe(`TokenResolver`, function () {
    this.timeout(50000000);

    it(`should throw on empty connectionName`, async function () {
        const returnTokenResponse = () => { return { token: '1234', connectionName: 'foo' }; };
        const botLogic= (ctx) => {
            if (ctx.activity.type === 'event' && ctx.activity.value.token) {
                gotToken = true;
            }
        };
        const adapter = new MockAdapter(botLogic, returnTokenResponse);
        const activity = createOAuthCardActivity();
        activity.attachments[0].content.connectionName = undefined;
        const context = adapter.createTurnContext(activity);

        try
        {
            TokenResolver.checkForOAuthCards(adapter, context, activity);
            assert(false, 'did not throw when should have');
        }
        catch(e)
        {
            assert(e.message === 'The OAuthPrompt\'s ConnectionName property is missing a value.', 'did not receive token');
        }
    });

    it(`should get the token`, async function () {
        let gotToken = false;
        const returnTokenResponse = () => { return { token: '1234', connectionName: 'foo' }; };
        let doneResolve, doneReject;
        let done = new Promise((resolve, reject) => {
            doneResolve = resolve;
            doneReject = reject;
        });
        const botLogic= (ctx) => {
            if (ctx.activity.type === 'event' && ctx.activity.value.token) {
                gotToken = true;
                doneResolve('done');
            } else {
                doneReject('error');
            }
        };
        const adapter = new MockAdapter(botLogic, returnTokenResponse);
        const activity = createOAuthCardActivity();
        const context = adapter.createTurnContext(activity);

        TokenResolver.checkForOAuthCards(adapter, context, activity);

        await done;

        assert(gotToken, 'did not receive token');
    });

    it(`should get the token on the second try`, async function () {
        let gotToken = false;
        let i = 0;
        const returnTokenResponse = () => 
        { 
            i++;
            if ( i < 2 )
                return undefined;
            return { token: '1234', connectionName: 'foo' };
        };
        let doneResolve, doneReject;
        let done = new Promise((resolve, reject) => {
            doneResolve = resolve;
            doneReject = reject;
        });
        const botLogic= (ctx) => {
            if (ctx.activity.type === 'event' && ctx.activity.value.token) {
                gotToken = true;
                doneResolve('done');
            } else {
                doneReject('error');
            }
        };
        const adapter = new MockAdapter(botLogic, returnTokenResponse);
        const activity = createOAuthCardActivity();
        const context = adapter.createTurnContext(activity);

        TokenResolver.checkForOAuthCards(adapter, context, activity);

        await done;

        assert(gotToken, 'did not receive token');
    });

    it(`should end polling`, async function () {
        let doneResolve, doneReject;
        let done = new Promise((resolve, reject) => {
            doneResolve = resolve;
            doneReject = reject;
        });
        const returnTokenResponse = () => 
        { 
            doneResolve('done');
            return { properties: { tokenPollingSettings: { timeout: 0 } } };
        };
        const botLogic= (ctx) => {
        };
        const adapter = new MockAdapter(botLogic, returnTokenResponse);
        const activity = createOAuthCardActivity();
        const context = adapter.createTurnContext(activity);
        const log = [];

        TokenResolver.checkForOAuthCards(adapter, context, activity, log);

        await done;

        assert(log.indexOf('End polling') !== -1, 'did not end polling');
    });

    it(`should change interval polling`, async function () {
        let doneResolve, doneReject;
        let done = new Promise((resolve, reject) => {
            doneResolve = resolve;
            doneReject = reject;
        });
        let i = 0;
        const returnTokenResponse = () => 
        { 
            i++;
            if (i < 2) {
                return { properties: { tokenPollingSettings: { interval: 100 } } };
            } else {
                doneResolve('done');
                return { properties: { tokenPollingSettings: { timeout: 0 } } };
            }
        };
        const botLogic= (ctx) => {
        };
        const adapter = new MockAdapter(botLogic, returnTokenResponse);
        const activity = createOAuthCardActivity();
        const context = adapter.createTurnContext(activity);
        const log = [];

        TokenResolver.checkForOAuthCards(adapter, context, activity, log);

        await done;

        assert(log.indexOf('Changing polling interval to 100') !== -1, 'did not end polling');
    });
});