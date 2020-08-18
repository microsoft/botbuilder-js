const assert = require('assert');
const { ApplicationInsightsWebserverMiddleware, ApplicationInsightsTelemetryClient } = require('../');
const { CorrelationContextManager } = require('applicationinsights/out/AutoCollection/CorrelationContextManager');
const appInsights = require('applicationinsights');
const { EventEmitter } = require('events');
const sinon = require('sinon').createSandbox();

describe('ApplicationInsightsTelemetryClient', function() {

    describe('Constructor', function() {

        afterEach(() => {
            appInsights.dispose();
        });

        it('should throw if an instrumentation key is not passed in', function() {
            assert.throws(() => new ApplicationInsightsTelemetryClient());
        });
        it('should add the default appInsights client to the instance when constructed', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');

            assert.strictEqual(client.client, appInsights.defaultClient);
        });
        it('should add a telemetry processor to the instance when constructed', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');

            assert.strictEqual(client.client._telemetryProcessors.length, 1);
        });
    });

    describe('Methods', function() {

        afterEach(() => {
            appInsights.dispose();
            sinon.restore();
        });

        it('configuration() getter should return configuration', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const config = client.configuration;

            assert.strictEqual(config, client.config);
        });
        it('defaultClient() getter should return the client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const defaultClient = client.defaultClient;

            assert.strictEqual(defaultClient, client.client);
        });
        it('trackDependency() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'trackDependency');
            const mockArgument = { contextObjects: [{ fake: 'object' }], correlationContext: {}};

            client.trackDependency(mockArgument);

            assert(spy.calledOnce);
        });
        it('trackEvent() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'trackEvent');
            const mockArgument = {};

            client.trackEvent(mockArgument);

            assert(spy.calledOnce);
        });
        it('trackException() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'trackException');
            const mockArgument = { exception: new Error('fake error') };

            client.trackException(mockArgument);

            assert(spy.calledOnce);
        });
        it('trackTrace() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'trackTrace');
            const mockArgument = {};

            client.trackTrace(mockArgument);

            assert(spy.calledOnce);
        });
        it('trackPageView() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'trackPageView');
            const mockArgument = {};

            client.trackPageView(mockArgument);

            assert(spy.calledOnce);
        });
        it('flush() method should call the same method in default appInsights client', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const spy = sinon.spy(appInsights.defaultClient, 'flush');

            client.flush();

            assert(spy.calledOnce);
        });
        it('addBotIdentifiers() correctly sets App Insights values', function() {
            const client = new ApplicationInsightsTelemetryClient('fakeKey');
            const activity = {
                from: { id: 'stub from id' },
                channelId: 'stub channel id',
                conversation: { id: 'stub conversation id'},
                id: 'stub activity id',
                type: 'stub activity type'
            };
            const operation = { 
                id: 'stub operation id',
                name: 'stub operation name',
                parentId: 'stub parent id'
            };
            const stub = sinon.stub(CorrelationContextManager, 'getCurrentContext');
            stub.returns({
                activity,
                operation 
            });
            const spy = sinon.spy(client.client.channel, 'send');

            client.trackEvent({});

            const envelope = spy.args[0][0];
            assert.strictEqual(envelope.iKey, 'fakeKey');
            assert.strictEqual(envelope.tags['ai.operation.id'], operation.id);
            assert.strictEqual(envelope.tags['ai.operation.parentId'], operation.parentId);
            assert.strictEqual(envelope.tags['ai.user.id'], `${ activity.channelId }${ activity.from.id }`);
            assert.strictEqual(envelope.data.baseData.properties.activityId, activity.id);
            assert.strictEqual(envelope.data.baseData.properties.activityType, activity.type);
            assert.strictEqual(envelope.data.baseData.properties.channelId, activity.channelId);
            assert.strictEqual(envelope.data.baseData.properties.conversationId, activity.conversation.id);
        });
    });

    describe('ApplicationInsightsWebserverMiddleware', function() {

        afterEach(() => {
            sinon.restore();
        });

        it('should set the context as the activity from req.body', function() {
            const activity = {
                id: 'fake id',
                type: 'fake type',
                text: 'fake text'
            };
            const operation = { 
                id: 'stub operation id',
                name: 'stub operation name',
                parentId: 'stub parent id'
            };
            const stub = sinon.stub(CorrelationContextManager, 'getCurrentContext');
            stub.returns({
                activity: {},
                operation 
            });
            const emitter = new EventEmitter();
            emitter.body = activity;

            ApplicationInsightsWebserverMiddleware(emitter, new EventEmitter(), () => { });
            
            assert.strictEqual(appInsights.getCorrelationContext().activity, activity);
        });
    });
});