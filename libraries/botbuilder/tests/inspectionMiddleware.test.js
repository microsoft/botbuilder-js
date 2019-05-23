
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

//const nock = require('nock');
const assert = require('assert');
const { TestAdapter, MemoryStorage, MessageFactory, UserState, ConversationState } = require('botbuilder-core');
const { InspectionMiddleware, InspectionState } = require('../');

describe('InspectionMiddleware', function() {

    it('should not change behavior when inspection middleware is added', async function() {

        var inspectionState = new InspectionState(new MemoryStorage());
        var inspectionMiddleware = new InspectionMiddleware(inspectionState);

        const adapter = new TestAdapter(async (turnContext) => {

            await turnContext.sendActivity(MessageFactory.text('hi'));
        });

        adapter.use(inspectionMiddleware);

        await adapter.receiveActivity(MessageFactory.text('hello'));

        assert(adapter.activityBuffer.length === 1, 'expected a single adapter response');
        assert(adapter.activityBuffer[0].type === 'message', 'expected a message activity');
        assert(adapter.activityBuffer[0].text === 'hi', `expected text saying 'hi'`);
    });    
    it('should replicate activity data to listening emulator following open and attach', async function() {

        var storage = new MemoryStorage();
        var inspectionState = new InspectionState(storage);
        var userState = new UserState(storage);
        var conversationState = new ConversationState(storage);
        var inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        var openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(async (turnContext) => {
            await inspectionMiddleware.processCommand(turnContext);
        }, null, true);

        inspectionAdapter.use(inspectionMiddleware);

        await inspectionAdapter.receiveActivity(openActivity);

        var inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        var attachCommand = inspectionOpenResultActivity.value;

        var applicationAdapter = new TestAdapter(async (turnContext) => {

            await turnContext.sendActivity(MessageFactory.text(`echo: ${ turnContext.activity.text }`));

            //(await userState.CreateProperty<Scratch>("x").GetAsync(turnContext, () => new Scratch())).Property = "hello";
            //(await conversationState.CreateProperty<Scratch>("y").GetAsync(turnContext, () => new Scratch())).Property = "world";

            await userState.saveChanges(turnContext);
            await conversationState.saveChanges(turnContext);

        }, null, true);

        await applicationAdapter.receiveActivity(MessageFactory.text(attachCommand));

        // the attach command response is a informational message

        await applicationAdapter.receiveActivity(MessageFactory.text('hi'));

        // a trace activity should be sent to the emulator using the connector and teh conversation reference
    });    
});

