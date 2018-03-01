const assert = require('assert');
const chatdown = require('../lib');

describe('The chatdown lib', () => {
    describe('should correctly output data', () => {
        it('when the input chat contains an attachment', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: Hello, can I help you?
            user: I need an image
            bot: here you go! [Attachments:bot-framework.png]
            `;
            const activities = await chatdown(conversation, {});
            assert(activities.length === 4);

        });

        it('when the input chat contains [Delay:xxxx] instructions', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: [Typing]
            [Delay:5000] How are you?
            `;

            const activities = await chatdown(conversation, {});
            assert(new Date(activities[2].timestamp).getTime() - new Date(activities[1].timestamp).getTime() === 5000);
        });

        it('when a content type must be inferred from the file extension in an attachment', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: [Typing]
            [Delay:5000] How are you?,
            user: Good, hit me with a help fiassert(activities[3].attachments.length);le!
            bot: [Attachments:help.json] here you go!
            `;

            const activities = await chatdown(conversation, {});
            assert(activities[4].attachments[0].contentType === 'application/json');
        });

        it('when base64 data is expected in the attachment', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: [Typing]
            [Delay:5000] How are you?,
            user: Good, hit me with a help file!
            bot: [Attachments:bot-framework.png] here you go!
            `;

            const activities = await chatdown(conversation, {});
            assert.doesNotThrow(() => Buffer.from(activities[4].attachments[0].content, 'base64'));
        });

        it('when JSON string data is expected in the attachment', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: [Typing]
            [Delay:5000] How are you?,
            user: Good, hit me with a help file!
            bot: [Attachments:help.json] here you go!
            `;

            const activities = await chatdown(conversation, {});
            assert(typeof activities[4].attachments[0].content === 'object');
        });

        it('when the input chat contains multiple empty lines', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            
            user: Yo!
            
            
            
            bot: Sup?
            
            `;

            const activities = await chatdown(conversation, {});
            assert(activities.length === 2);
        });
    });

    describe('should throw', () => {

        it('when the chat contains an attachment that points to a non existent file "ENOENT"', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: [Typing]
            [Delay:5000] How are you?,
            user: Good, hit me with a help file!
            bot: [Attachments:notThere.json] here you go!
            `;

            try {
                const activities = await chatdown(conversation, {});
                assert.fail('did not throw', 'will throw');
            } catch (e) {
                assert(e.code === 'ENOENT');
            }
        });
    });

    describe('should output the expected activities', () => {
        it('with the same channelId in each conversation', async () => {
            const conversation = [
                'user=Joe',
                'bot=LulaBot',
                'user: Hello!',
                'bot: Hi there. How can I help you?',
                'user: What time is is?',
                'bot: It\'s go time!'
            ];

            const activities = await chatdown(conversation.join('\n'), {});
            const id = activities[0].conversation.id;
            activities.forEach(activity => {
                assert(activity.conversation.id === id);
            });
        });

        it('with unique ids for each activity', async () => {
            const conversation = [
                'user=Joe',
                'bot=LulaBot',
                'user: Hello!',
                'bot: Hi there. How can I help you?',
                'user: What time is is?',
                'bot: It\'s go time!'
            ];

            const activities = await chatdown(conversation.join('\n'), {});
            let ids = {};
            activities.forEach(activity => {
                assert(ids[activity.id] === undefined);
                ids[activity.id] = true;
            });
        });

        it('With alternating from and recipient ids', async () => {
            const conversation = [
                'user=Joe',
                'bot=LulaBot',
                'user: Hello!',
                'bot: Hi there. How can I help you?',
                'user: What time is is?',
                'bot: It\'s go time!'
            ];

            const activities = await chatdown(conversation.join('\n'), {});
            let previousRecipientId;
            activities.forEach(activity => {
                const recipient = (activity.recipient || {});
                assert(recipient.id === previousRecipientId);
                previousRecipientId = activity.from.id;
            });
        });

        it('with the appropriate messages', async () => {
            const conversation = [
                'user=Joe',
                'bot=LulaBot',
                'user: Hello!',
                'bot: Hi there. How can I help you?',
                'user: What time is is?',
                'bot: It\'s go time!'
            ];

            const activities = await chatdown(conversation.join('\n'), {});
            activities.forEach((activity, index) => {
                assert(activity.text.trim() === conversation[index + 2].replace('user: ', '').replace('bot: ', ''));
            });
        });

        it('when a message contains newlines', async () => {
            const conversation = `
            user=Joe
            bot=LulaBot
            user: Hello!
            bot: Hi there. How can I help you?,
            user: I need a sandwich!
            bot: Great!. I have the following choices:
            * Ham and Cheese
            * Turkey bacon club
            * Veggie on sourdough`;

            const activities = await chatdown(conversation, {});
            assert(activities.length === 4);
            assert(activities[3].text.trim().split('\n').length === 4);
        });
    });
});