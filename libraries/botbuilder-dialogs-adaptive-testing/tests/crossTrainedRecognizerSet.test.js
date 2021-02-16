const path = require('path');
const { ComponentRegistration, MemoryStorage, useBotState, ConversationState, UserState } = require('botbuilder-core');
const { TemplateEngineLanguageGenerator, AdaptiveComponentRegistration, CrossTrainedRecognizerSet, RegexRecognizer, IntentPattern } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');
const { 
    crossTrainText,
    xIntentText,
    recognizeIntentAndValidateTelemetry,
    spyOnTelemetryClientTrackEvent
} = require('./recognizerTelemetryUtils');
const { createContext } = require('./activityUtils');
const { OnUnknownIntent, AdaptiveDialog, OnIntent, SendActivity } = require('botbuilder-dialogs-adaptive');
const { DialogManager } = require('botbuilder-dialogs');
const { TestAdapter } = require('botbuilder-core');

const createRecognizer = () => {
    return new CrossTrainedRecognizerSet().configure({
        recognizers: [
            new RegexRecognizer().configure({
                id: 'x',
                intents: [
                    new IntentPattern('DeferToRecognizer_y', crossTrainText),
                    new IntentPattern('x', 'x')
                ]
            }),
            new RegexRecognizer().configure({
                id: 'y',
                intents: [
                    new IntentPattern('y', crossTrainText),
                    new IntentPattern('y', 'y')
                ]
            }),
            new RegexRecognizer().configure({
                id: 'z',
                intents: [
                    new IntentPattern('z', crossTrainText),
                    new IntentPattern('z', 'z')
                ]
            })
        ]
    });
};

describe('CrossTrainedRecognizerSetTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/CrossTrainedRecognizerSetTests'),
        true,
        false
    );

    it('AllNone', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_AllNone');
    });

    it('CircleDefer', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_CircleDefer');
    });

    it('DoubleDefer', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleDefer');
    });

    it('DoubleIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleIntent');
    });

    it('Empty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_Empty');
    });

    it('NoneWithIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneWithIntent');
    });

    it('EntitiesWithNoneIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneIntentWithEntities');
    });

    describe('Telemetry', () => {
        const recognizer = createRecognizer();
        let spy;

        beforeEach(() => {
            spy = spyOnTelemetryClientTrackEvent(recognizer);
        });

        afterEach(() => {
            spy.restore();
        });

        it('TEST CIRCULAR DEFER', async () => {
            const myRecognizer = new CrossTrainedRecognizerSet().configure({
                generator: new TemplateEngineLanguageGenerator(),
                recognizers: [
                    new RegexRecognizer().configure({
                        id: 'x',
                        intents: [
                            new IntentPattern('DeferToRecognizer_y', 'test'),
                            new IntentPattern('x', 'x')
                        ]
                    }),
                    new RegexRecognizer().configure({
                        id: 'y',
                        intents: [
                            new IntentPattern('y', 'test'),
                            new IntentPattern('y', 'y')
                        ]
                    }),
                    new RegexRecognizer().configure({
                        id: 'z',
                        intents: [
                            new IntentPattern('DeferToRecognizer_x', 'test'),
                            new IntentPattern('z', 'z')
                        ]
                    })
                ]
            });

            const root = new AdaptiveDialog('root').configure({
                recognizer: myRecognizer,
                triggers: [
                    new OnIntent( // for some reason, this is the only intent that works
                        'x', [], [
                            // new SendActivity('Intent:${turn.recognized.intent}')
                            new SendActivity('Intent:x !!')
                        ]
                    ),
                    new OnIntent(
                        'y', [], [
                            new SendActivity('Intent:${turn.recognized.intent}')
                        ]
                    ),
                    new OnIntent(
                        'z', [], [
                            new SendActivity('Intent:${turn.recognized.intent}')
                        ]
                    ),
                    new OnUnknownIntent([
                        new SendActivity('UnknownIntent. T_T')
                    ])
                ]
            });

            const dm = new DialogManager(root);
            dm.dialogs.add(root);
            
            const adapter = new TestAdapter(async (context) => {
                await dm.onTurn(context);
            });
            const storage = new MemoryStorage();
            useBotState(adapter, new ConversationState(storage), new UserState(storage));
            // const dc = createContext('hi');
            // const activity = dc.context.activity;

            // const result = await recognizer.recognize(dc, activity);
            // console.log(result);

            await adapter
                .send('hi')
                .assertReply('UnknownIntent:None')
        });

        it('Merge - should log PII when logPersonalInformation is true', async() => {
            recognizer.logPersonalInformation = true;

            await recognizeIntentAndValidateTelemetry({ 
                text: crossTrainText, callCount: 1, recognizer, spy
            });

            await recognizeIntentAndValidateTelemetry({ 
                text: xIntentText, callCount: 2, recognizer, spy
            });
        });

        // it('Merge - should not log PII when logPersonalInformation is false', async() => {
        //     recognizer.logPersonalInformation = true;

        //     await recognizeIntentAndValidateTelemetry({ 
        //         text: crossTrainText, callCount: 1, recognizer, spy
        //     });

        //     await recognizeIntentAndValidateTelemetry({ 
        //         text: xIntentText, callCount: 2, recognizer, spy
        //     });
        // });

        // it('should refrain from logging PII by default', async () => {
        //     const recognizerWithDefaultLogPii = createRecognizer();
        //     const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);

        //     await recognizeIntentAndValidateTelemetry({ 
        //         text: crossTrainText,
        //         callCount: 1,
        //         recognizer: recognizerWithDefaultLogPii,
        //         spy: trackEventSpy
        //     });
        // });
    });
});
