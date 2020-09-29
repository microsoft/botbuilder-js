// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

const assert = require('assert');
const { TestAdapter, ActivityTypes, TelemetryLoggerMiddleware } = require('botbuilder-core');
const { TelemetryInitializerMiddleware } = require('../');
const appInsights = require('applicationinsights');
const TelemetryClient = appInsights.TelemetryClient;
const sinon = require('sinon').createSandbox();

class TestInitializerMiddleware extends TelemetryInitializerMiddleware {
    constructor(botTelemetryClient, logActivities, mockCorrelationContext) {
        super(botTelemetryClient, logActivities);

        this.appInsightsCorrelationContext = mockCorrelationContext;
    }
}

describe(`TelemetryInitializerMiddleware`, function() {
    this.timeout(5000);

    afterEach(() => {
        sinon.restore();
    });

    it('telemetry initializer stores activity', function(done) {

        const telemetryClient = {
            trackEvent: () => {
            }
        };

        const telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        const initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, true, []);
        
        const adapter = new TestAdapter(async (context) => {
            const typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${ context.activity.text }`);
        }).use(initializerMiddleware);

        adapter
            .send('foo')
            .then(() => { assert(initializerMiddleware.appInsightsCorrelationContext.activity.text == 'foo'); })
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .then(() => { assert(initializerMiddleware.appInsightsCorrelationContext.activity.text == 'bar'); })
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it('calls logging middleware (when logActivityTelemetry is true)', function(done) {

        let callCount = 0;

        const telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                ++callCount;
                assert(callCount < 7 && callCount > 0);
            }
        };

        const telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        const initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, true, []);
        
        const adapter = new TestAdapter(async (context) => {
            const typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${ context.activity.text }`);
        }).use(initializerMiddleware);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it('does not call logging middleware (when logActivityTelemetry is false)', function(done) {

        const telemetryClient = {
            trackEvent: () => {
                assert.fail('logging middleware was called');
            }
        };

        const telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        const initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, false, []);
        
        const adapter = new TestAdapter(async (context) => {
            const typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${ context.activity.text }`);
        }).use(initializerMiddleware);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it('logActivityTelemetry() getter calls logActivityTelemetry function passed into constructor', function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        let passedInFunctionWasCalled = false;
        const middleware = new TelemetryInitializerMiddleware(logger, () => {
            passedInFunctionWasCalled = true;
            return true;
        });

        const result = middleware.logActivityTelemetry();
        assert.strictEqual(result, true);
        assert.strictEqual(passedInFunctionWasCalled, true);
    });

    it('telemetryClient() getter calls returns client passed into constructor', function() {
        const fakeKey = 'fakeKey';
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient(fakeKey));
        const middleware = new TelemetryInitializerMiddleware(logger);

        const client = middleware.telemetryClient;
        assert.strictEqual(client._telemetryClient.config.instrumentationKey, fakeKey);
    });

    it('throws an error if onTurn() context is null', function(done) {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);

        client.onTurn(null, () => new Promise((resolve) => { resolve(); }))
            .then(() => done('should have thrown'))
            .catch((err) => {
                assert.strictEqual(err.message, 'context is null');
                done();
            });
    });

    it('onTurn() uses default appInsights CorrelationContext if instance\'s _correlationContext not set', async function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);
        client._correlationContext = null;

        const stub = sinon.stub(appInsights, 'getCorrelationContext');
        stub.returns({ key: 'stub context' });

        const context = {
            activity: { id: 'fake' }
        };

        const contextBeforeOnTurn = appInsights.getCorrelationContext();
        assert.strictEqual(contextBeforeOnTurn.activity, undefined);

        await client.onTurn(context, () => new Promise((resolve) => { resolve(); }));

        const updatedContext = appInsights.getCorrelationContext();
        assert.deepEqual(updatedContext.activity, context.activity);
    });

    it('onTurn() does not change correlationContext if no activity is present', async function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);
        client._correlationContext = null;

        const stub = sinon.stub(appInsights, 'getCorrelationContext');
        stub.returns({ key: 'stub context' });

        const context = {};

        const contextBeforeOnTurn = appInsights.getCorrelationContext();
        assert.strictEqual(contextBeforeOnTurn.activity, undefined);

        await client.onTurn(context, () => new Promise((resolve) => { resolve(); }));

        const updatedContext = appInsights.getCorrelationContext();
        assert.deepEqual(updatedContext.activity, undefined);
    });

    it('onTurn() does not change correlationContext if activity is present, but correlationContext is not', async function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);
        client._correlationContext = null;

        const stub = sinon.stub(appInsights, 'getCorrelationContext');
        stub.returns(undefined);

        const context = {
            activity: {
                id: 'fake id'
            }
        };

        const contextBeforeOnTurn = appInsights.getCorrelationContext();
        assert.strictEqual(contextBeforeOnTurn, undefined);

        await client.onTurn(context, () => new Promise((resolve) => { resolve(); }));

        const updatedContext = appInsights.getCorrelationContext();
        assert.deepEqual(updatedContext, undefined);
    });

    it('onTurn() performs next() callback itself if no telemetryLoggerMiddleware present', async function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);
        client._logActivityTelemetry = false;
        client._telemetryLoggerMiddleware = false;

        let nextCalled = false;
        const next = async () => {
            nextCalled = true;
        };

        await client.onTurn(context, next);
        assert.strictEqual(nextCalled, true);
    });

    it('onTurn() does not attempt to perform next() callback if not present', async function() {
        const logger = new TelemetryLoggerMiddleware(new TelemetryClient('fakeKey'));
        const client = new TelemetryInitializerMiddleware(logger);
        client._logActivityTelemetry = false;
        client._telemetryLoggerMiddleware = false;

        assert.doesNotReject(async () => await client.onTurn(context, null));
    });
});
