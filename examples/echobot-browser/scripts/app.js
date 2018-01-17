var userId = { id: 'userId' };
var conversationId = { id: 'testConversation' };
var botId = { id: 'echoBot' };

requirejs(['jquery', 'botbuilder-core', 'webchatconnector'], function ($, builder, chatConnector) {
    $('document').ready(function () {
        
        connector = new chatConnector.WebChatConnector();
        BotChat.App({
            botConnection: connector,
            user: userId,
            bot: botId,
            resize: 'detect'
        }, document.getElementById("bot"));

        bot = new builder.Bot(connector);
        bot.use(new builder.ConsoleLogger())
            //.use(new builder.BrowserSessionStorage())
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => {
                if (context.request.type === 'message') {
                    let count = context.state.conversation.count || 1;
                    context.reply(`${count}: You said "${context.request.text}"`);
                    context.state.conversation.count = count + 1;
                } else {
                    context.reply(`[${context.request.type}]`);
                }
            });
    });
});