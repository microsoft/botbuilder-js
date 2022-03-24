const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder');
const { DialogManager, DialogSet, ChoicePrompt, ListStyle } = require('botbuilder-dialogs');
const { ChoiceInput, TelemetryLoggerConstants, ActivityTemplate, ChoiceSet } = require('../lib');
const { ObjectExpression, BoolExpression } = require('adaptive-expressions');

describe('ChoiceInput multi-choices properties', function () {
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
    const storage = new MemoryStorage();
    const conversationState = new ConversationState(storage);
    const dialogState = conversationState.createProperty('dialog');
    const dialogs = new DialogSet(dialogState);
    const choicePrompt = new ChoicePrompt('prompt');
    choicePrompt.style = ListStyle.none;
    dialogs.add(choicePrompt);
    const dm = new DialogManager();
    dm.conversationState = conversationState;

    // Setup inputDialog dialog
    const dialog = new ChoiceInput();
    dialog.prompt = new ActivityTemplate('testTemplate');
    dialog.alwaysPrompt = true;

    // set up prompt choices
    const choiceSet = new ChoiceSet([{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }]);
    dialog.choices = new ObjectExpression(choiceSet);
    dialog.alwaysPrompt = new BoolExpression(true);
    dialog._telemetryClient = telemetryClient;
    dm.rootDialog = dialog;

    it('Log ChoiceInput choices properties', async function () {
        // Send initial activity
        const adapter = new TestAdapter(async (turnContext) => {
            await dm.onTurn(turnContext);

            // assert telemetry result
            strictEqual(telemetryName, TelemetryLoggerConstants.GeneratorResultEvent);
            strictEqual(telemetryProperties.choices, choiceSet);
            ok(trackEventStub.calledOnce);
        });
        await adapter.send('test').sendConversationUpdate().startTest();
    });
});
