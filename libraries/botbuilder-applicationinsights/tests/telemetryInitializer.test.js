// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

const assert = require('assert');
const { TestAdapter, ActivityTypes, TelemetryLoggerMiddleware } = require('botbuilder-core');
const { TelemetryInitializerMiddleware } = require('../');

class TestInitializerMiddleware extends TelemetryInitializerMiddleware {
    constructor(botTelemetryClient, logActivities, mockCorrelationContext) {
        super(botTelemetryClient, logActivities);

        this.appInsightsCorrelationContext = mockCorrelationContext;
    }
}

describe(`TelemetryInitializerMiddleware`, function() {
    this.timeout(5000);

    it(`telemetry initializer stores activity`, function(done) {

        var telemetryClient = {
            trackEvent: (telemetry) => {
            }
        };

        var telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        var initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, true, []);
        
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${ context.activity.text }`);
        }).use(initializerMiddleware);

        adapter
            .send('foo')
            .then(res => { assert(initializerMiddleware.appInsightsCorrelationContext.activity.text == 'foo'); })
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .then(res => { assert(initializerMiddleware.appInsightsCorrelationContext.activity.text == 'bar'); })
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it(`calls logging middleware (when logActivityTelemetry is true)`, function(done) {

        var callCount = 0;

        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                ++callCount;
                assert(callCount < 7 && callCount > 0);
            }
        };

        var telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        var initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, true, []);
        
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
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

    it(`does not call logging middleware (when logActivityTelemetry is false)`, function(done) {

        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert.fail('logging middleware was called');
            }
        };

        var telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient, true);
        var initializerMiddleware = new TestInitializerMiddleware(telemetryLoggerMiddleware, false, []);
        
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
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
});
