const utils = require('./utils');

// init bot
let bot = utils.initBot({ consoleLogger: true, memoryStorage: true, botStateManager: true });
// init LUIS recognizer
let luisRecognizer = utils.initLuisRecognizer();

// handle activities
bot.onReceive(
    (context) => {
        if (context.request.type === 'message') {
            return luisRecognizer.recognize(context)
                .then((results) => {
                    let luisData = results[0];
                    context.reply(`\nYour input generated the following LUIS results:`);
                    context.reply(`Intent name: ${luisData.name}\n\nScore: ${luisData.score}`);
                    luisData.entities.forEach((entity) => {
                        context.reply(`Detected entity:\n\nType: ${entity.type}\n\nValue: ${entity.value}\n\nScore: ${entity.score}`);
                    });

                    if (luisData.name == 'Help.intent') {
                        context.reply(
                            'Here are some things to try:\n\n' +
                            '- Basic: Say "hi"\n\n' +
                            '- Basic: Ask for "help" - shows this message\n\n' +
                            '- Complex: Weather - "what is the weather in Seattle?"' +
                            '- Complex: Find a house - "find house with 3 bedrooms and 2 bathrooms in Seattle, WA');
                    }
                })
                .catch((err) => {
                    context.reply('There was an error connecting to the LUIS API');
                    context.reply(err);
                });
        }
        else if (context.request.type === "conversationUpdate") utils.handleConversationUpdateEvents(context);
        else utils.handleOtherActivityTypes(context);
    }
);
