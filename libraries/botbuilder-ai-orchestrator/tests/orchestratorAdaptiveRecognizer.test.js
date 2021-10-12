/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { MockResolver, TestAdapterSettings } = require('./mockResolver');
const { ok, rejects, strictEqual } = require('assert');
const { OrchestratorRecognizer, LabelType } = require('../lib');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { TurnContext, MessageFactory, NullTelemetryClient } = require('botbuilder-core');
const { BotFrameworkAdapter } = require('../../botbuilder/lib');
const { StringExpression, BoolExpression, NumberExpression } = require('adaptive-expressions');
const { NumberEntityRecognizer } = require('botbuilder-dialogs-adaptive');
const sinon = require('sinon');
const { orchestratorIntentText, getLogPersonalInformation, validateTelemetry } = require('./recognizerTelemetryUtils');

describe('OrchestratorAdpativeRecognizer tests', function () {
    it('Expect initialize is called when labelresolver is not null', async function () {
        const result = [
            {
                score: 0.9,
                label: {
                    name: 'mockLabel',
                },
            },
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = 'test';

        const rec = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);

        const { dc, activity } = createTestDcAndActivity('hello');
        const res = await rec.recognize(dc, activity);

        strictEqual(res.text, 'hello');
        strictEqual(res.intents.mockLabel.score, 0.9);
    });

    it('Expect initialize is called when labelresolver is null', async function () {
        rejects(async () => {
            const testPaths = 'test';
            const rec = new OrchestratorRecognizer(testPaths, testPaths, null);

            const { dc, activity } = createTestDcAndActivity('hello');
            await rec.recognize(dc, activity);
        });
    });

    it('Test none intent recognition', async function () {
        const result = [
            {
                score: 0.3,
                label: {
                    name: 'mockLabel',
                },
            },
            {
                score: 0.8,
                label: {
                    name: 'None',
                },
            },
            {
                score: 0.6,
                label: {
                    name: 'mockLabel2',
                },
            },
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = 'test';
        const rec = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        const { dc, activity } = createTestDcAndActivity('hey hey');

        const res = await rec.recognize(dc, activity);
        strictEqual(res.text, 'hey hey');
        strictEqual(Object.keys(res.intents).length, 3);
        strictEqual(res.intents.mockLabel.score, 0.3);
        strictEqual(res.intents.mockLabel2.score, 0.6);
        strictEqual(res.intents.None.score, 1.0);
    });

    it('Test intent recognition', async function () {
        const result = [
            {
                score: 0.9,
                label: {
                    name: 'mockLabel',
                },
            },
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = 'test';
        const rec = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        const { dc, activity } = createTestDcAndActivity('hello');

        const res = await rec.recognize(dc, activity);
        strictEqual(res.text, 'hello');
        strictEqual(res.intents.mockLabel.score, 0.9);
    });

    it('Test entity recognition', async function () {
        const result = [
            {
                score: 0.9,
                label: {
                    name: 'mockLabel',
                },
            },
        ];
        const entityResult = [
            {
                score: 0.75,
                label: {
                    name: 'mockEntityLabel',
                    type: LabelType.Entity,
                    span: {
                        offset: 17,
                        length: 7,
                    },
                },
            },
        ];
        const mockResolver = new MockResolver(result, entityResult);
        const testPaths = 'test';
        const rec = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
        rec.scoreEntities = true;
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        rec.externalEntityRecognizer = new NumberEntityRecognizer();
        const { dc, activity } = createTestDcAndActivity('turn on light in room 12');

        const res = await rec.recognize(dc, activity);
        strictEqual(res.text, 'turn on light in room 12');
        strictEqual(res.intents.mockLabel.score, 0.9);
        strictEqual(res.entities.number[0], '12');

        strictEqual(res['entityResult'], entityResult);
        ok(res.entities.mockEntityLabel);
        strictEqual(res.entities.mockEntityLabel[0].score, 0.75);
        strictEqual(res.entities.mockEntityLabel[0].text, 'room 12');
        strictEqual(res.entities.mockEntityLabel[0].start, 17);
        strictEqual(res.entities.mockEntityLabel[0].end, 24);
        strictEqual(Object.keys(res.entities).length, 3);
        strictEqual(Object.keys(res.entities.$instance).length, 2);
        console.log('ENTITIES ' + JSON.stringify(res.entities));
    });

    it('Test ambiguous intent recognition', async function () {
        const result = [
            {
                score: 0.9,
                label: {
                    name: 'mockLabel1',
                },
            },
            {
                score: 0.85,
                label: {
                    name: 'mockLabel2',
                },
            },
            {
                score: 0.79,
                label: {
                    name: 'mockLabel3',
                },
            },
        ];
        const mockResolver = new MockResolver(result);
        const testPaths = 'test';
        const rec = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        rec.detectAmbiguousIntents = new BoolExpression(true);
        rec.disambiguationScoreThreshold = new NumberExpression(0.1);
        const { dc, activity } = createTestDcAndActivity('hello');

        const res = await rec.recognize(dc, activity);
        ok(res.intents.ChooseIntent.score, 1);
        ok(res.candidates[0].intent, 'mockLabel1');
        ok(res.candidates[1].intent, 'mockLabel2');
    });

    describe('telemetry', function () {
        it('should log PII when logPersonalInformation is true', async function () {
            // Set up OrchestratorAdaptiveRecognizer
            const result = [
                {
                    score: 0.9,
                    label: {
                        name: 'mockLabel',
                    },
                },
                {
                    score: 0.8,
                    label: {
                        name: 'mockLabel2',
                    },
                },
            ];
            const mockResolver = new MockResolver(result);
            const testPaths = 'test';
            const recognizer = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
            recognizer.modelFolder = new StringExpression(testPaths);
            recognizer.snapshotFile = new StringExpression(testPaths);

            //Set up telemetry
            const { dc, activity } = createTestDcAndActivity(orchestratorIntentText);
            const telemetryClient = new NullTelemetryClient();
            const spy = sinon.spy(telemetryClient, 'trackEvent');
            recognizer.telemetryClient = telemetryClient;
            recognizer.logPersonalInformation = true;

            const res = await recognizer.recognize(dc, activity);

            ok(res.text, orchestratorIntentText);
            ok(res.intents.mockLabel.score, 0.9);
            validateTelemetry({
                recognizer,
                dialogContext: dc,
                spy,
                activity,
                result,
                callCount: 1,
            });
        });

        it('does not log PII when logPersonalInformation is false', async function () {
            // Set up OrchestratorAdaptiveRecognizer
            const result = [
                {
                    score: 0.9,
                    label: {
                        name: 'mockLabel',
                    },
                },
                {
                    score: 0.8,
                    label: {
                        name: 'mockLabel2',
                    },
                },
            ];
            const mockResolver = new MockResolver(result);
            const testPaths = 'test';
            const recognizer = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
            recognizer.modelFolder = new StringExpression(testPaths);
            recognizer.snapshotFile = new StringExpression(testPaths);

            //Set up telemetry
            const { dc, activity } = createTestDcAndActivity(orchestratorIntentText);
            const telemetryClient = new NullTelemetryClient();
            const spy = sinon.spy(telemetryClient, 'trackEvent');
            recognizer.telemetryClient = telemetryClient;
            recognizer.logPersonalInformation = false;

            const res = await recognizer.recognize(dc, activity);

            ok(res.text, orchestratorIntentText);
            ok(res.intents.mockLabel.score, 0.9);
            validateTelemetry({
                recognizer,
                dialogContext: dc,
                spy,
                activity,
                result,
                callCount: 1,
            });
        });

        it('should refrain from logging PII by default', async function () {
            // Set up OrchestratorAdaptiveRecognizer
            const result = [
                {
                    score: 0.9,
                    label: {
                        name: 'mockLabel',
                    },
                },
                {
                    score: 0.8,
                    label: {
                        name: 'mockLabel2',
                    },
                },
            ];
            const mockResolver = new MockResolver(result);
            const testPaths = 'test';
            const recognizerWithDefaultLogPii = new OrchestratorRecognizer(testPaths, testPaths, mockResolver);
            recognizerWithDefaultLogPii.modelFolder = new StringExpression(testPaths);
            recognizerWithDefaultLogPii.snapshotFile = new StringExpression(testPaths);

            //Set up telemetry
            const { dc, activity } = createTestDcAndActivity(orchestratorIntentText);
            const telemetryClient = new NullTelemetryClient();
            const spy = sinon.spy(telemetryClient, 'trackEvent');
            recognizerWithDefaultLogPii.telemetryClient = telemetryClient;

            const res = await recognizerWithDefaultLogPii.recognize(dc, activity);

            ok(res.text, orchestratorIntentText);
            ok(res.intents.mockLabel.score, 0.9);
            ok(!getLogPersonalInformation(recognizerWithDefaultLogPii, dc));
            validateTelemetry({
                recognizer: recognizerWithDefaultLogPii,
                dialogContext: dc,
                spy,
                activity,
                result,
                callCount: 1,
            });
        });
    });
});

const createTestDcAndActivity = function (message) {
    const settings = new TestAdapterSettings('appId', 'password');
    const adapter = new BotFrameworkAdapter(settings);
    const activity = MessageFactory.text(message);
    const turnContext = new TurnContext(adapter, activity);
    turnContext.sendTraceActivity = function () {};
    const state = [{ dialogStack: [] }];
    const dc = new DialogContext(new DialogSet(), turnContext, state);
    return { dc, activity };
};
