const { equal, ok: assert, strictEqual } = require('assert');
const dayjs = require('dayjs');

const { ActivityTypes, EventFactory, HandoffEventNames, MessageFactory, TestAdapter, TurnContext } = require('../');

describe('EventFactory', function () {
    this.timeout(5000);

    describe('createHandoffInitiation', function () {
        it('should succeed', function () {
            const adapter = new TestAdapter(async () => {
                /* no op */
            });
            const fromId = 'test';
            const activity = {
                type: ActivityTypes.Message,
                text: '',
                conversation: {},
                recipient: {},
                from: { id: fromId },
                channelId: 'testchannel',
                serviceUrl: 'http://myservice',
            };

            const context = new TurnContext(adapter, activity);
            const transcript = { activities: [MessageFactory.text('hello')] };

            equal(transcript.activities[0].channelId, undefined);
            equal(transcript.activities[0].serviceUrl, undefined);
            equal(transcript.activities[0].conversation, undefined);

            const skillValue = 'any';
            const handoffEvent = EventFactory.createHandoffInitiation(context, { skill: skillValue }, transcript);

            strictEqual(handoffEvent.name, HandoffEventNames.InitiateHandoff);
            strictEqual(handoffEvent.type, ActivityTypes.Event);
            const skill = handoffEvent.value && handoffEvent.value.skill;
            strictEqual(skill, skillValue);
            strictEqual(handoffEvent.from.id, fromId);
        });

        it('should throw if turnContext is falsy', function () {
            assert.throws(
                () => EventFactory.createHandoffInitiation(null, 'some text'),
                TypeError('EventFactory.createHandoffInitiation(): Missing context.')
            );
        });
    });

    describe('createHandoffStatus', function () {
        it('should succeed', function () {
            const state = 'failed';
            const message = 'timed out';
            const handoffEvent = EventFactory.createHandoffStatus({}, state, message);

            strictEqual(handoffEvent.name, HandoffEventNames.HandoffStatus);

            const stateFormEvent = handoffEvent.value && handoffEvent.value.state;
            strictEqual(stateFormEvent, state);

            const messageFormEvent = handoffEvent.value && handoffEvent.value.message;
            strictEqual(messageFormEvent, message);

            const status = JSON.stringify(handoffEvent.value);
            strictEqual(status, `{"state":"${state}","message":"${message}"}`);
            assert(handoffEvent.attachments, 'handoffEvent.attachments should not be undefined.');
            assert(handoffEvent.id, 'handoffEvent.id should not be undefined.');
            strictEqual(handoffEvent.localTimezone, dayjs.tz.guess());
        });

        it('should succeed with no message', function () {
            const state = 'failed';
            const handoffEvent = EventFactory.createHandoffStatus({}, state);

            const stateFormEvent = handoffEvent.value && handoffEvent.value.state;
            strictEqual(state, stateFormEvent);

            const messageFormEvent = handoffEvent.value && handoffEvent.value.message;
            strictEqual(undefined, messageFormEvent);
        });

        it('should throw if conversation is falsy', function () {
            assert.throws(
                () => EventFactory.createHandoffStatus(null, 'some text'),
                TypeError('EventFactory.createHandoffStatus(): missing conversation.')
            );
        });

        it('should throw if state is falsy', function () {
            assert.throws(
                () => EventFactory.createHandoffStatus({}, null),
                TypeError('EventFactory.createHandoffStatus(): missing state.')
            );
        });
    });
});
