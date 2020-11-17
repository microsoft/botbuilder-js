/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { MockResolver, TestAdapterSettings } = require('./mockResolver');
const assert = require('assert');
const { OrchestratorAdaptiveRecognizer } = require('../lib');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { TurnContext, MessageFactory } = require('botbuilder-core');
const { BotFrameworkAdapter } = require('../../botbuilder/lib');
const { StringExpression, BoolExpression, NumberExpression } = require('adaptive-expressions');
const { NumberEntityRecognizer } = require('botbuilder-dialogs-adaptive');
const sinon = require('sinon');

describe('OrchestratorAdpativeRecognizer tests', function() {
    it('Expect initialize is called when orchestrator obj is null', async () => {
        const result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel"
                }
            }
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = "test";

        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = null;
        rec.Initialize = sinon.fake();

        const {dc, activity} = createTestDcAndActivity("hello");
        const res = await rec.recognize(dc, activity);

        assert(res.text, "hello");
        assert(res.intents.mockLabel.score, 0.9);
        assert(rec.Initialize.calledOnce);
    });

    it('Expect initialize is called when labelresolver is null', async () => {
        const testPaths = "test";
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, null);
        OrchestratorAdaptiveRecognizer.orchestrator = null;
        
        rec.Initialize = sinon.fake();
        
        const {dc, activity} = createTestDcAndActivity("hello");
        assert.rejects(async () => await rec.recognize(dc, activity));
        
        assert(rec.Initialize.calledOnce);
    });

    it('Test intent recognition', async () => {
        const result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel"
                }
            }
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = "test";
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = "mock";
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        const {dc, activity} = createTestDcAndActivity("hello");

        const res = await rec.recognize(dc, activity)
        assert(res.text, "hello");
        assert(res.intents.mockLabel.score, 0.9);
    })

    it('Test entity recognition', async () => {
        const result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel"
                }
            }
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = "test";
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = "mock";
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        rec.entityRecognizers = [
            new NumberEntityRecognizer()
        ];
        const {dc, activity} = createTestDcAndActivity("hello 123")
        
        const res = await rec.recognize(dc, activity)
        assert(res.text, "hello 123");
        assert(res.intents.mockLabel.score, 0.9);
        assert(res.entities.number[0], "123");
    })

    it('Test ambiguous intent recognition', async () => {
        const result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel1"
                }
            },
            {
                score : 0.85,
                label : {
                    name : "mockLabel2"
                }
            },
            {
                score : 0.79,
                label : {
                    name : "mockLabel3"
                }
            }
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = "test";
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        rec.detectAmbiguousIntents = new BoolExpression(true);
        rec.disambiguationScoreThreshold = new NumberExpression(0.1);
        const {dc, activity} = createTestDcAndActivity("hello");

        const res = await rec.recognize(dc, activity);
        assert(res.intents.ChooseIntent.score, 1);
        assert(res.candidates[0].intent, "mockLabel1");
        assert(res.candidates[1].intent, "mockLabel2");
    })
})

const createTestDcAndActivity = function (message) {
    const settings = new TestAdapterSettings('appId', 'password');
    const adapter = new BotFrameworkAdapter(settings);
    const activity = MessageFactory.text(message);
    const turnContext = new TurnContext(adapter, activity);
    turnContext.sendTraceActivity = function() {}
    const state = [{dialogStack: []}];
    const dc = new DialogContext(new DialogSet(), turnContext, state);
    return {dc, activity};
}
