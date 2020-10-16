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

describe('OrchestratorAdpativeRecognizer tests', function() {
    it('Test intent recognition', (done) => {
        let result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel"
                }
            }
        ];
        let mockResolver = new MockResolver(result);
        let testPaths = "test";
        let rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        let {dc, activity} = createTestDcAndActivity("hello")
        rec.recognize(dc, activity)
            .then(res => {
                assert(res.text, "hello");
                assert(res.intents.mockLabel.score, 0.9);
                done();
            })
            .catch(err => done(err))
    })

    it('Test entity recognition', (done) => {
        let result = [
            {
                score : 0.9,
                label : {
                    name : "mockLabel"
                }
            }
        ];
        let mockResolver = new MockResolver(result);
        let testPaths = "test";
        let rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        rec.entityRecognizers = [
            new NumberEntityRecognizer()
        ];
        let {dc, activity} = createTestDcAndActivity("hello 123")
        rec.recognize(dc, activity)
            .then(res => {
                assert(res.text, "hello 123");
                assert(res.intents.mockLabel.score, 0.9);
                assert(res.entities.number[0], "123");
                done();
            })
            .catch(err => done(err))
    })

    it('Test ambiguous intent recognition', (done) => {
        let result = [
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
        let mockResolver = new MockResolver(result);
        let testPaths = "test";
        let rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        rec.modelPath = new StringExpression(testPaths);
        rec.snapshotPath = new StringExpression(testPaths);
        rec.detectAmbiguousIntents = new BoolExpression(true);
        rec.disambiguationScoreThreshold = new NumberExpression(0.1);
        let {dc, activity} = createTestDcAndActivity("hello")
        rec.recognize(dc, activity)
            .then(res => {
                assert(res.intents.ChooseIntent.score, 1);
                assert(res.candidates[0].intent, "mockLabel1");
                assert(res.candidates[1].intent, "mockLabel2");
                done();
            })
            .catch(err => done(err))
    })
})

const createTestDcAndActivity = function (message) {
    let settings = new TestAdapterSettings('appId', 'password');
    let adapter = new BotFrameworkAdapter(settings);
    let activity = MessageFactory.text(message);
    let turnContext = new TurnContext(adapter, activity);
    turnContext.sendTraceActivity = function() {}
    let state = [{dialogStack: []}];
    let dc = new DialogContext(new DialogSet(), turnContext, state);
    return {dc, activity};
}
