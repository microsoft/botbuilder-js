const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const {
    ConversationState,
    MemoryStorage,
    TestAdapter
} = require('botbuilder-core');
const { DialogSet } = require('botbuilder-dialogs');
const { TelemetryTrackEventAction } = require('../lib');


describe('TelemetryTrackEventAction', function () {
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

    // Setup sendActivity dialog
    const dialog = new TelemetryTrackEventAction('testEvent', {'test': 'test123'});
    dialog._telemetryClient = telemetryClient;

    it('eval beginDialog()', async () => {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            await dialog.beginDialog(dc);

            // assert telemetry result
            strictEqual(telemetryName, 'testEvent');
            strictEqual(telemetryProperties.test, 'test123');

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test');
    });
});