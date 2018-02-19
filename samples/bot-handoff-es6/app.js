const { Bot, MemoryStorage, BotStateManager } = require('botbuilder');
const { BotFrameworkAdapter } = require('botbuilder-services');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', adapter.listen());

// Users
let users = [];
function getUser(conversationId) {
    return users.find(function(user) {
        if (user.conversationId === conversationId)
            return user;
    });
};

// Initialize bot by passing it adapter
const bot = new Bot(adapter);
bot
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .use({
        contextCreated: (context, next) => {
            context.state.user.id = context.conversationReference.user.id 
            context.state.conversation.id = context.conversationReference.conversation.id

            if (context.state.user.id === 'Agent') {
                context.state.user.agent = true;
            }
            let user = getUser(context.state.conversation.id);
            if (!user) {
                users.push({"name": context.conversationReference.user.name, "conversationId": context.state.conversation.id, "conversationReference" : context.conversationReference});
            }

            //console.log(JSON.stringify(users, null, 2));

            return next();
        },
        receiveActivity: (context, next) => {
            let text = context.request.text;
            let me = getUser(context.state.conversation.id);
            if (me.connectId) {
                let them = getUser(me.connectId);
                if (context.state.user.agent && text.toLowerCase() === 'disconnect') {
                    me.connectId = undefined;
                    them.connectId = undefined;
                    bot.createContext(them.conversationReference, context => context.reply(`Disconnected from ${me.name}`));
                    context.reply(`Disconnected from ${them.name}`);
                    return;
                }
                bot.createContext(them.conversationReference, context => context.reply(text));
                return;
            }
            return next();
        }
    })

// Define the bots onReceive message handler
bot.onReceive((context) => {
    if (context.request.type === 'message') {
        if (context.state.user.agent) {
            const input = context.request.text.split(" ");
            let command = input[0].toLowerCase(), arg;
            if (input.length > 1) {
                arg = input.slice(1).join(" ");
            }
            switch (command) {
                case 'list':
                    let reply = 'Users:\n\n';
                    users.forEach(function(item, index, array) {
                        reply  += ' * ' + item.name + ' - ' + item.conversationId + '\n\n';
                    });
                    context.reply(reply);
                    break;
                case 'connect':
                    if (!arg) {
                        context.reply(`Usage: connect <conversation id>`);
                        break;
                    }
                    let them = getUser(arg);
                    if (!them) {
                        context.reply(`Conversation id ${arg} not found`);
                        break;
                    }
                    let me = getUser(context.state.conversation.id);
                    me.connectId = them.conversationId;
                    them.connectId = me.conversationId;
                    context.reply(`Connected to ${them.name}`);
                    break;
                case 'disconnect':
                    context.reply("Not connected");
                    break;
                default:
                    context.reply(`Commands: \n * list \n * connect <conversation id> \n  * disconnect`);
            }
        }
        else {
            context.reply(`Hello ${context.state.user.id} from bot.`);
        }
    }
});