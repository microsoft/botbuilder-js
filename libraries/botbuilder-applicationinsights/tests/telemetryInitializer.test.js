// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

const assert = require('assert');
const appInsights = require("applicationinsights");
const { TestAdapter, ActivityTypes } = require('botbuilder-core');
const { TelemetryInitializerMiddleware } = require('../');

describe(`TelemetryMiddleware`, function () {
    this.timeout(5000);

    it(`telemetry initializer stores activity`, function (done) {      

        var callCount = 0;

        var telemetryClient = {
            trackEvent: (telemetry) => {
                callCount++;
            }
        };

        var initializerMiddleware = new TelemetryInitializerMiddleware(telemetryClient, true, true);
        initializerMiddleware.appInsightsDep = appInsights;
        
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(initializerMiddleware);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);

        var correlationContext = appInsights.getCorrelationContext();
        var activity = correlationContext.activity;
        assert.equal(activity.text, 'bar');
    });
});
