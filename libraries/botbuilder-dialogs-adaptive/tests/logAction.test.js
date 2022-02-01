const { ok, strictEqual } = require('assert');
const { createTelemetryClientAndStub } = require('./telemetryUtils');
const { ConversationState, MemoryStorage, TestAdapter, MessageFactory } = require('botbuilder');
const { DialogSet } = require('botbuilder-dialogs');
const { LogAction, StaticActivityTemplate } = require('../lib');

describe('LogAction', function () {
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

    // Setup logAction dialog
    const dialog = new LogAction();
    dialog.text = new StaticActivityTemplate(MessageFactory.text('test'));
    dialog._telemetryClient = telemetryClient;

    it('eval beginDialog()', async function () {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            await dialog.beginDialog(dc);

            // assert telemetry result
            strictEqual(telemetryName, 'GeneratorResult');
            strictEqual(telemetryProperties.result.text, 'test');
            strictEqual(telemetryProperties.template.activity.text, 'test');

            ok(trackEventStub.calledOnce);
        });

        await adapter.send('test').startTest();
    });
});
