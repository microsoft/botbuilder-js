const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const { ConversationState, MemoryStorage, TestAdapter, InputHints } = require('botbuilder');
const { DialogManager, DialogSet } = require('botbuilder-dialogs');

const {
    ChoiceInput,
    StaticActivityTemplate,
    TelemetryLoggerConstants,
    ActivityTemplate,
    ChoiceSet,
} = require('../lib');
const { ObjectExpression, ExpressionParser } = require('adaptive-expressions');

describe('ChoiceInput', function () {
    this.timeout(3000);

    let telemetryName;
    let telemetryProperties;

    const captureTelemetryAction = (eventData) => {
        telemetryName = eventData.name;
        telemetryProperties = eventData.properties;
    };

    // Create telemetryClient and trackEventStub
    const [telemetryClient, trackEventStub] = createTelemetryClientAndStub(captureTelemetryAction);

    // Setup dialog manager
    const conversationState = new ConversationState(new MemoryStorage());
    const dm = new DialogManager();
    const dialogState = conversationState.createProperty('dialog');
    const dialogs = new DialogSet(dialogState);
    dm.conversationState = conversationState;

    // Setup inputDialog dialog
    const dialog = new ChoiceInput();
    dialog.prompt = new ActivityTemplate('testtempl');
    dialog.alwaysPrompt = true;

    const state = {
        choices: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
    };
    const ep = new ObjectExpression('choices');
    const { value } = ep.tryGetValue(state);

    dialog.choices = ep;

    dialog._telemetryClient = telemetryClient;
    dm.rootDialog = dialog;

    it('eval promptUser()', async function () {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            dc.state.setValue(value);
            await dialog.promptUser(dc, undefined);
            // await dialog.beginDialog(dc);

            var vv = telemetryProperties;

            // assert telemetry result
            strictEqual(telemetryName, TelemetryLoggerConstants.GeneratorResultEvent);

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test').sendConversationUpdate().startTest();
    });
});
