const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./lgTelemetryUtil');
const {
    ConversationState,
    MemoryStorage,
    TestAdapter,
    MessageFactory,
} = require('botbuilder-core');
const { DialogSet } = require('botbuilder-dialogs');
const { InputDialog, StaticActivityTemplate } = require('../lib');


describe('InputDialog', function() {
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
    const dialogState = conversationState.createProperty('dialog');
    const dialogs = new DialogSet(dialogState);

    // Setup inputDialog dialog
    const dialog = new InputDialog();
    dialog.prompt = new StaticActivityTemplate(MessageFactory.text('test'));
    dialog._telemetryClient = telemetryClient;

    it('eval promptUser()', async () => {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            await dialog.promptUser(dc, undefined);

            // assert telemetry result
            strictEqual(telemetryName, 'GeneratorResult');
            strictEqual(telemetryProperties.result.text, 'test');
            strictEqual(telemetryProperties.template.activity.text, 'test');

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test');
    });
});
