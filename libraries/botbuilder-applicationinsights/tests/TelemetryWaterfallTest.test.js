const { ConversationState, MemoryStorage, NullTelemetryClient, TestAdapter } = require('botbuilder-core');
const { ComponentDialog, DialogSet, WaterfallDialog } = require('../../botbuilder-dialogs/lib');
const assert = require('assert');

describe('TelemetryWaterfall', function() {

    it('should track a dialog start event on first turn of dialog', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            await dc.beginDialog('testDialog');
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register TestDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const dialog = new WaterfallDialog('testDialog',[
            async (step) => { return step.next(); }
        ]);
        dialog.telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                if (telemetry.name === 'WaterfallStart') {
                    done();
                }
            }
        }
        dialogs.add(dialog);

        adapter.send({text: 'hello'}).startTest();
    });

    it('should track an event for every step of a waterfall dialog', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            await dc.beginDialog('testDialog');
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register TestDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const dialog = new WaterfallDialog('testDialog',[
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); }
        ]);

        let count = 0;

        dialog.telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                if (telemetry.name === 'WaterfallStep') {
                    assert(telemetry.properties.StepName==='Step' + (count + 1) + 'of' + dialog.steps.length,'waterfallstep step name is wrong');
                    count++;
                }
                if (telemetry.name === 'WaterfallComplete') {
                    assert(count === dialog.steps.length,'incorrect number of waterfall step events');
                    done();
                }

            }
        }
        dialogs.add(dialog);

        adapter.send({text: 'hello'}).startTest();
    });

    it('should track an event for at the end of the waterfall dialog', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            await dc.beginDialog('testDialog');
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register TestDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const dialog = new WaterfallDialog('testDialog',[
            async (step) => { return step.next(); },
        ]);

        let count = 0;

        dialog.telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                if (telemetry.name === 'WaterfallComplete') {
                    done();
                }
            }
        }
        dialogs.add(dialog);

        adapter.send({text: 'hello'}).startTest();
    });

    it('should track an event for a waterfall cancel', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            await dc.beginDialog('testDialog');
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register TestDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const dialog = new WaterfallDialog('testDialog',[
            async (step) => { step.cancelAllDialogs(); },
        ]);

        let count = 0;

        dialog.telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                if (telemetry.name === 'WaterfallCancel') {
                    done();
                }
            }
        }
        dialogs.add(dialog);

        adapter.send({text: 'hello'}).startTest();
    });

    it('should have same instance id for all events', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            await dc.beginDialog('testDialog');
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register TestDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const dialog = new WaterfallDialog('testDialog',[
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); },
            async (step) => { return step.next(); }
        ]);

        let count = 0;
        let instanceId = null;

        dialog.telemetryClient = {
            trackEvent: (telemetry) => {
                if (!instanceId && telemetry.properties.InstanceId) {
                    instanceId = telemetry.properties.InstanceId
                }
                assert(telemetry, 'telemetry is null');
                assert(instanceId,'instanceid is not set on event');
                assert(instanceId === telemetry.properties.InstanceId,'instance id does not match other events');

                if (telemetry.name === 'WaterfallStep') {
                    count++;
                }

                if (telemetry.name === 'WaterfallComplete') {
                    assert(count === dialog.steps.length,'wrong number of waterfall step events');
                    done();
                }
            }
        }
        dialogs.add(dialog);

        adapter.send({text: 'hello'}).startTest();
    });

    it('should set telemetryClient on dialogs inside a component dialog', function(done) {

        const component = new ComponentDialog('id');
        
        component.addDialog(new WaterfallDialog('secondary'), [
            async (step) => { return await step.next(); }
        ]);

        assert(component.findDialog('secondary').telemetryClient instanceof NullTelemetryClient, 'should be nulltelemetryclient by default');
        assert(component.telemetryClient instanceof NullTelemetryClient,'child dialog should have same telemetry client');

        class TestClient {
            trackEvent(t) {
            } 
            trackTrace(t) {
            }
            trackEvent(t) {
            }
            trackException(t) {
            }
        }

        component.telemetryClient = new TestClient();

        assert(component.findDialog('secondary').telemetryClient instanceof TestClient, 'child dialogs should now be TestClient');
        assert(component.telemetryClient instanceof TestClient,'component should have a testclient as well');
        assert(component.telemetryClient === component.findDialog('secondary').telemetryClient,'component should have same client as children');

        component.addDialog(new WaterfallDialog('third'), [
            async (step) => { return await step.next(); }
        ]);

        assert(component.findDialog('third').telemetryClient instanceof TestClient, 'child dialogs should now be TestClient');
        assert(component.findDialog('secondary').telemetryClient instanceof TestClient, 'child dialogs should now be TestClient');
        assert(component.telemetryClient === component.findDialog('third').telemetryClient,'component should have same client as new children');
        assert(component.findDialog('third').telemetryClient === component.findDialog('secondary').telemetryClient,'children should have identical clients');

        component.telemetryClient = null;
        assert(component.findDialog('secondary').telemetryClient instanceof NullTelemetryClient, 'child dialog should be reset to nulltelemetryclient');
        assert(component.telemetryClient instanceof NullTelemetryClient,'component should be reset to nulltelemetryclient');

        done();

    });

});