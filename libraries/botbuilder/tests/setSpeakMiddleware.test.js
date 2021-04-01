// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { SetSpeakMiddleware } = require('..');
const { MessageFactory, TestAdapter } = require('botbuilder-core');

describe('SetSpeakMiddleware', function () {
    describe('constructor', function () {
        it('works', function () {
            new SetSpeakMiddleware('voiceName', false);
        });
    });

    describe('onTurn', function () {
        function makeAdapter({
            channelId = 'emulator',
            fallback = true,
            logic = async (context) => {
                await context.sendActivity(MessageFactory.text('OK'));
            },
            voice = 'male',
        } = {}) {
            return new TestAdapter(logic, { channelId }).use(new SetSpeakMiddleware(voice, fallback));
        }

        it('no fallback does nothing to speak', async function () {
            const adapter = makeAdapter({ fallback: false });

            await adapter
                .send('foo')
                .assertReply((activity) => assert(activity.speak == null))
                .startTest();
        });

        it('unsupported channel and empty speak yields speak === text', async function () {
            const adapter = makeAdapter({ channelId: 'doesnotsupportspeach' });

            await adapter
                .send('foo')
                .assertReply((activity) => assert.strictEqual(activity.speak, activity.text))
                .startTest();
        });

        it('unsupported channel and non-empty value yields untouched speak', async function () {
            const adapter = makeAdapter({
                channelId: 'doesnotsupportspeach',
                logic: async (context) => {
                    const activity = MessageFactory.text('OK');
                    activity.speak = 'custom speak';

                    await context.sendActivity(activity);
                },
            });

            await adapter
                .send('foo')
                .assertReply((activity) => assert.strictEqual(activity.speak, 'custom speak'))
                .startTest();
        });

        it('supported channel yields speak with voice added', async function () {
            const adapter = makeAdapter();

            await adapter
                .send('foo')
                .assertReply((activity) => assert(activity.speak.includes('<voice ')))
                .startTest();
        });

        it('null voice param yields untouched speak', async function () {
            const adapter = makeAdapter({ voice: null });

            await adapter
                .send('foo')
                .assertReply((activity) => assert.strictEqual(activity.speak, 'OK'))
                .startTest();
        });
    });
});
