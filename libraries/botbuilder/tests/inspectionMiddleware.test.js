/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const nock = require('nock');
const assert = require('assert');
const { TestAdapter, MemoryStorage, MessageFactory, UserState, ConversationState } = require('botbuilder-core');
const { InspectionMiddleware, InspectionState } = require('../');
const sinon = require('sinon');

describe('InspectionMiddleware', function () {
    beforeEach(function () {
        nock.cleanAll();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    // const storage = new MemoryStorage();
    // const inspectionState = new InspectionState(storage);
    // const userState = new UserState(storage);
    // const conversationState = new ConversationState(storage);

    it('should not change behavior when inspection middleware is added', async function () {
        const inspectionState = new InspectionState(new MemoryStorage());
        const inspectionMiddleware = new InspectionMiddleware(inspectionState);

        const adapter = new TestAdapter(async (turnContext) => {
            await turnContext.sendActivity(MessageFactory.text('hi'));
        });

        adapter.use(inspectionMiddleware);

        await adapter.receiveActivity(MessageFactory.text('hello'));

        assert(adapter.activityBuffer.length === 1, 'expected a single adapter response');
        assert(adapter.activityBuffer[0].type === 'message', 'expected a message activity');
        assert(adapter.activityBuffer[0].text === 'hi', "expected text saying 'hi'");
    });
    it('should replicate activity data to listening emulator following open and attach', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        const inboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        const outboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        const stateExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using

        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here

        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        const attachCommand = inspectionOpenResultActivity.value;

        // the logic of teh bot including replying with a message and updating user and conversation state

        const x = userState.createProperty('x');
        const y = conversationState.createProperty('y');

        const applicationAdapter = new TestAdapter(
            async (turnContext) => {
                await turnContext.sendActivity(MessageFactory.text(`echo: ${turnContext.activity.text}`));

                (await x.get(turnContext, { property: '' })).property = 'hello';
                (await y.get(turnContext, { property: '' })).property = 'world';

                await userState.saveChanges(turnContext);
                await conversationState.saveChanges(turnContext);
            },
            null,
            true
        );

        // IMPORTANT add the InspectionMiddleware to the adapter that is running our bot

        applicationAdapter.use(inspectionMiddleware);

        await applicationAdapter.receiveActivity(MessageFactory.text(attachCommand));

        // the attach command response is a informational message

        await applicationAdapter.receiveActivity(MessageFactory.text('hi'));

        // trace activities should be sent to the emulator using the connector and the conversation reference

        // verify that all our expectations have been met

        assert(inboundExpectation.isDone(), 'The expectation of a trace message for the inbound activity was not met');
        assert(
            outboundExpectation.isDone(),
            'The expectation of a trace message for the outbound activity was not met'
        );
        assert(stateExpectation.isDone(), 'The expectation of a trace message for the bot state was not met');
    });
    it('should replicate activity data to listening emulator following open and attach with at mention', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        const inboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        const outboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        const stateExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using

        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here

        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];

        const recipientId = 'bot';
        const attachCommand = `<at>${recipientId}</at> ${inspectionOpenResultActivity.value}`;

        // the logic of the bot including replying with a message and updating user and conversation state

        const x = userState.createProperty('x');
        const y = conversationState.createProperty('y');

        const applicationAdapter = new TestAdapter(
            async (turnContext) => {
                await turnContext.sendActivity(MessageFactory.text(`echo: ${turnContext.activity.text}`));

                (await x.get(turnContext, { property: '' })).property = 'hello';
                (await y.get(turnContext, { property: '' })).property = 'world';

                await userState.saveChanges(turnContext);
                await conversationState.saveChanges(turnContext);
            },
            null,
            true
        );

        // IMPORTANT add the InspectionMiddleware to the adapter that is running our bot

        applicationAdapter.use(inspectionMiddleware);

        const attachActivity = {
            type: 'message',
            text: attachCommand,
            recipient: { id: recipientId },
            entities: [
                {
                    type: 'mention',
                    text: `<at>${recipientId}</at>`,
                    mentioned: {
                        name: 'Bot',
                        id: recipientId,
                    },
                },
            ],
        };

        await applicationAdapter.receiveActivity(attachActivity);

        // the attach command response is a informational message

        await applicationAdapter.receiveActivity(MessageFactory.text('hi'));

        // trace activities should be sent to the emulator using the connector and the conversation reference

        // verify that all our expectations have been met

        assert(inboundExpectation.isDone(), 'The expectation of a trace message for the inbound activity was not met');
        assert(
            outboundExpectation.isDone(),
            'The expectation of a trace message for the outbound activity was not met'
        );
        assert(stateExpectation.isDone(), 'The expectation of a trace message for the bot state was not met');
    });
    it('should replicate activity data to listening emulator following open and attach within Teams Team', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        const inboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        const outboundExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        const stateExpectation = nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using

        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here

        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        const attachCommand = inspectionOpenResultActivity.value;

        // the logic of teh bot including replying with a message and updating user and conversation state

        const x = userState.createProperty('x');
        const y = conversationState.createProperty('y');

        const applicationAdapter = new TestAdapter(
            async (turnContext) => {
                await turnContext.sendActivity(MessageFactory.text(`echo: ${turnContext.activity.text}`));

                (await x.get(turnContext, { property: '' })).property = 'hello';
                (await y.get(turnContext, { property: '' })).property = 'world';

                await userState.saveChanges(turnContext);
                await conversationState.saveChanges(turnContext);
            },
            null,
            true
        );

        // IMPORTANT add the InspectionMiddleware to the adapter that is running our bot

        applicationAdapter.use(inspectionMiddleware);

        const attachActivity = MessageFactory.text(attachCommand);
        attachActivity.channelData = { team: { id: 'team-id' } };

        await applicationAdapter.receiveActivity(attachActivity);

        // the attach command response is a informational message

        const hiActivity = MessageFactory.text('hi');
        hiActivity.channelData = { team: { id: 'team-id' } };

        await applicationAdapter.receiveActivity(hiActivity);

        // trace activities should be sent to the emulator using the connector and the conversation reference

        // verify that all our expectations have been met

        assert(inboundExpectation.isDone(), 'The expectation of a trace message for the inbound activity was not met');
        assert(
            outboundExpectation.isDone(),
            'The expectation of a trace message for the outbound activity was not met'
        );
        assert(stateExpectation.isDone(), 'The expectation of a trace message for the bot state was not met');
    });

    it('should update activity message to trigger turnContext.onUpdateActivity', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here
        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        const attachCommand = inspectionOpenResultActivity.value;

        // Updating the activity message to trigger turnContext.onUpdateActivity

        const activity = MessageFactory.text('hi');

        activity.id = '0';

        const adapter = new TestAdapter(
            async (turnContext) => {
                activity.text = 'new text';
                await turnContext.updateActivity(activity);
                await userState.saveChanges(turnContext);
                await conversationState.saveChanges(turnContext);
            },
            null,
            true
        );

        adapter.use(inspectionMiddleware);

        await adapter.receiveActivity(MessageFactory.text(attachCommand));

        adapter.activityBuffer.push(activity);
        assert.strictEqual(adapter.activityBuffer.length, 2);
        await adapter.receiveActivity(activity);

        assert.strictEqual(adapter.activityBuffer.length, 2, 'no activities updated.');
        assert.strictEqual(adapter.activityBuffer[1].text, activity.text, 'invalid update activity text.');
    });

    it('should delete activity to trigger turnContext.onDeleteActivity', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here

        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        const attachCommand = inspectionOpenResultActivity.value;

        // Updating the activity message to trigger turnContext.onDeleteActivity

        const activity = MessageFactory.text('hi');

        activity.id = '0';

        const adapter = new TestAdapter(
            async (turnContext) => {
                await turnContext.deleteActivity(activity.id);
                await userState.saveChanges(turnContext);
                await conversationState.saveChanges(turnContext);
            },
            null,
            true
        );

        adapter.use(inspectionMiddleware);

        await adapter.receiveActivity(MessageFactory.text(attachCommand));

        adapter.activityBuffer.push(activity);
        assert.strictEqual(adapter.activityBuffer.length, 2);

        await adapter.receiveActivity(activity);
        assert.strictEqual(adapter.activityBuffer.length, 1, 'no activities deleted.');
    });

    it('should throw an error when onTurn next parameter is null', async function () {
        // set up our expectations in nock - each corresponds to a trace message we expect to receive in the emulator

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) => activity.type === 'trace' && activity.value.text == 'echo: hi'
            )
            .reply(200, { id: 'test' });

        nock('https://test.com')
            .post(
                '/v3/conversations/Convo1/activities',
                (activity) =>
                    activity.type === 'trace' &&
                    activity.value.userState &&
                    activity.value.userState.x.property == 'hello' &&
                    activity.value.conversationState &&
                    activity.value.conversationState.y.property == 'world'
            )
            .reply(200, { id: 'test' });

        // create the various storage and middleware objects we will be using
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // the emulator sends an /INSPECT open command - we can use another adapter here
        const openActivity = MessageFactory.text('/INSPECT open');

        const inspectionAdapter = new TestAdapter(
            async (turnContext) => {
                await inspectionMiddleware.processCommand(turnContext);
            },
            null,
            true
        );

        await inspectionAdapter.receiveActivity(openActivity);

        const inspectionOpenResultActivity = inspectionAdapter.activityBuffer[0];
        const attachCommand = inspectionOpenResultActivity.value;

        const adapter = new TestAdapter(
            async (turnContext) => {
                await assert.rejects(
                    inspectionMiddleware.onTurn(turnContext, null),
                    TypeError('next is not a function', 'next function should be null')
                );
            },
            null,
            true
        );

        adapter.use(inspectionMiddleware);

        await adapter.receiveActivity(MessageFactory.text(attachCommand));

        await adapter.receiveActivity('');
    });

    it('should invokeInbound throw an error', async function () {
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // Override warn current behavior to intercept when it's called.
        const warn = sinon.stub(console, 'warn');

        await inspectionMiddleware.invokeInbound();

        assert(warn.called, 'invokeInbound should have throw a warning');

        // Revert warn to original behavior.
        warn.restore();
    });

    it('should invokeOutbound throw an error', async function () {
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // Override warn current behavior to intercept when it's called.
        const warn = sinon.stub(console, 'warn');

        await inspectionMiddleware.invokeOutbound();

        assert(warn.called, 'invokeOutbound should have throw a warning');

        // Revert warn to original behavior.
        warn.restore();
    });

    it('should invokeTraceState throw an error', async function () {
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        // Override warn current behavior to intercept when it's called.
        const warn = sinon.stub(console, 'warn');

        await inspectionMiddleware.invokeTraceState();

        assert(warn.called, 'invokeTraceState should have throw a warning');

        // Revert warn to original behavior.
        warn.restore();
    });

    it('should attachCommand return false', async function () {
        const storage = new MemoryStorage();
        const inspectionState = new InspectionState(storage);
        const userState = new UserState(storage);
        const conversationState = new ConversationState(storage);
        const inspectionMiddleware = new InspectionMiddleware(inspectionState, userState, conversationState);

        const result = await inspectionMiddleware.attachCommand(
            '',
            { openedSessions: { 'session-1': undefined } },
            'session-1'
        );
        assert.strictEqual(result, false, 'should be returning false');
    });
});
