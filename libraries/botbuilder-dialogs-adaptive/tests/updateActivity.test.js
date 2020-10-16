const { ok, strictEqual } = require('assert');
const { stub } = require('sinon');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const {
    ConversationState,
    MemoryStorage,
    TestAdapter,
    MessageFactory,
} = require('botbuilder-core');
const { DialogSet } = require('botbuilder-dialogs');
const { UpdateActivity } = require('../lib')


describe('UpdateActivity', function () {
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

    // Setup skill dialog
    const dialog = new UpdateActivity('activityId', MessageFactory.text('test'));
    dialog._telemetryClient = telemetryClient;

    it('eval beginDialog()', async () => {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const updateActivitySub = stub(context, 'updateActivity');
            updateActivitySub.callsFake(() => {});
            const dc = await dialogs.createContext(context);
            await dialog.beginDialog(dc);

            // assert telemetry result
            strictEqual(telemetryName, 'GeneratorResult');
            strictEqual(telemetryProperties.result.text, 'test');
            strictEqual(telemetryProperties.template.activity.text, 'test');

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test');
    });
});