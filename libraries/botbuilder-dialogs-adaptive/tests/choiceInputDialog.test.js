const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const { ConversationState, MemoryStorage, TestAdapter, InputHints } = require('botbuilder');
const { DialogManager, DialogSet } = require('botbuilder-dialogs');

const { ChoiceInput, StaticActivityTemplate, TelemetryLoggerConstants, ActivityTemplate } = require('../lib');
const { ObjectExpression } = require('adaptive-expressions');

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

    // Setup inputDialog dialog
    const dialog = new ChoiceInput();
    dialog.prompt = new ActivityTemplate('testtempl');
    dialog.alwaysPrompt = true;

    const promptChoices = new ObjectExpression([{ value: 'test' }, { value: 'test2' }, { value: 'test3' }]);
    dialog.choices = promptChoices;

    dialog._telemetryClient = telemetryClient;

    // Setup dialog manager
    const conversationState = new ConversationState(new MemoryStorage());
    const dm = new DialogManager();
    const dialogState = conversationState.createProperty('dialog');
    const dialogs = new DialogSet(dialogState);
    dm.conversationState = conversationState;
    dm.rootDialog = dialog;

    it('eval promptUser()', async function () {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            await dialog.promptUser(dc, undefined);

            var vv = telemetryProperties;

            // assert telemetry result
            strictEqual(telemetryName, TelemetryLoggerConstants.GeneratorResultEvent);

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test').sendConversationUpdate().startTest();
    });
});
