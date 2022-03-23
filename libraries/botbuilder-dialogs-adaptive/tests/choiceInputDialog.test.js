const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const {
    ConversationState,
    MemoryStorage,
    UserState,
    AutoSaveStateMiddleware,
    TestAdapter,
    InputHints,
} = require('botbuilder');
const { DialogManager, DialogSet, ChoicePrompt, ListStyle, DialogTurnStatus } = require('botbuilder-dialogs');
const {
    ChoiceInput,
    StaticActivityTemplate,
    TelemetryLoggerConstants,
    ActivityTemplate,
    ChoiceSet,
} = require('../lib');
const { ObjectExpression } = require('adaptive-expressions');

describe('ChoiceInput test by Ram', function () {
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
    const state = {
        choices: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
    };

    const choiceSet = new ChoiceSet([{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }]);
    const choiceObjExpression = new ObjectExpression(choiceSet);
    const { value } = choiceObjExpression.tryGetValue(state);

    dialog.choices = choiceObjExpression.setValue(ChoiceInput);

    dialog._telemetryClient = telemetryClient;
    dm.rootDialog = dialog;

    it('eval promptUser()', async function () {
        // Send initial activity
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const opts = await dialog.onInitializeOptions(dc, {
                choices: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
            });

            dc.state.setValue(ChoiceInput.OPTIONS_PROPERTY, opts);

            await dialog.promptUser(dc, undefined);

            var testProperties = telemetryProperties;

            // assert telemetry result
            strictEqual(telemetryName, TelemetryLoggerConstants.GeneratorResultEvent);
            // asert test1, test1

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test').sendConversationUpdate().startTest();
    });
});
