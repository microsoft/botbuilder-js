/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { MockResolver, TestAdapterSettings } = require('./mockResolver');
const { ok, rejects } = require('assert');
const { OrchestratorAdaptiveRecognizer } = require('../lib');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { TurnContext, MessageFactory, NullTelemetryClient } = require('botbuilder-core');
const { BotFrameworkAdapter } = require('../../botbuilder/lib');
const { StringExpression, BoolExpression, NumberExpression } = require('adaptive-expressions');
const { NumberEntityRecognizer } = require('botbuilder-dialogs-adaptive');
const sinon = require('sinon');
const { orchestratorIntentText, getLogPersonalInformation, validateTelemetry } = require('./recognizerTelemetryUtils');

describe('OrchestratorAdpativeRecognizer tests', function () {
    it('Expect initialize is called when orchestrator obj is null', async () => {
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

        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = null;
        rec._initializeModel = sinon.fake();

        const { dc, activity } = createTestDcAndActivity('hello');
        const res = await rec.recognize(dc, activity);

        ok(res.text, 'hello');
        ok(res.intents.mockLabel.score, 0.9);
        ok(rec._initializeModel.calledOnce);
    });

    it('Expect initialize is called when labelresolver is null', async () => {
        const testPaths = 'test';
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, null);
        OrchestratorAdaptiveRecognizer.orchestrator = null;

        rec._initializeModel = sinon.fake();

        const { dc, activity } = createTestDcAndActivity('hello');
        rejects(async () => await rec.recognize(dc, activity));

        ok(rec._initializeModel.calledOnce);
    });

    it('Test intent recognition', async () => {
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
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = 'mock';
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        const { dc, activity } = createTestDcAndActivity('hello');

        const res = await rec.recognize(dc, activity);
        ok(res.text, 'hello');
        ok(res.intents.mockLabel.score, 0.9);
    });

    it('Test entity recognition', async () => {
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
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
        OrchestratorAdaptiveRecognizer.orchestrator = 'mock';
        rec.modelFolder = new StringExpression(testPaths);
        rec.snapshotFile = new StringExpression(testPaths);
        rec.externalEntityRecognizer = new NumberEntityRecognizer();
        const { dc, activity } = createTestDcAndActivity('hello 123');

        const res = await rec.recognize(dc, activity);
        ok(res.text, 'hello 123');
        ok(res.intents.mockLabel.score, 0.9);
        ok(res.entities.number[0], '123');
    });

    it('Test ambiguous intent recognition', async () => {
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
        const rec = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
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

    describe('telemetry', () => {
        it('should log PII when logPersonalInformation is true', async () => {
            // Set up OrchestratorAdaptiveRecognizer
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
            const recognizer = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
            OrchestratorAdaptiveRecognizer.orchestrator = 'mock';
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

        it('does not log PII when logPersonalInformation is false', async () => {
            // Set up OrchestratorAdaptiveRecognizer
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
            const recognizer = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
            OrchestratorAdaptiveRecognizer.orchestrator = 'mock';
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

        it('should refrain from logging PII by default', async () => {
            // Set up OrchestratorAdaptiveRecognizer
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
            const recognizerWithDefaultLogPii = new OrchestratorAdaptiveRecognizer(testPaths, testPaths, mockResolver);
            OrchestratorAdaptiveRecognizer.orchestrator = 'mock';
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
