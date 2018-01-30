const botbuilder = require('botbuilder');
const prompts = require('botbuilder-prompts')
const BotFrameworkAdapter = require('botbuilder-services').BotFrameworkAdapter;
const restify = require('restify');
const alarms = require('./alarms');

// init restify server
let server = restify.createServer();
// bind listener to port and display start info
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// init connector
const botFrameworkAdapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// bind connector to /api/messages route
server.post('/api/messages', botFrameworkAdapter.listen());

// init bot & bind to middleware
const bot = new botbuilder.Bot(botFrameworkAdapter).use(
    new botbuilder.ConsoleLogger(),
    new botbuilder.MemoryStorage(),
    new botbuilder.BotStateManager()
);

// configure bots routing table
function routeActivity(context) {
    if (context.request.type === botbuilder.ActivityTypes.message) {
        if (context.ifRegExp(/(list|show) alarms/i)) {
            return alarms.sayAlarms(context);
        } else if (context.ifRegExp(/(set|create|add|new) alarm/i)) {
            prompts.Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
            return alarms.addAlarm(context, {});
        } else if (context.ifRegExp(/(delete|remove|cancel) alarm/i)) {
            prompts.Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
            return alarms.deleteAlarm(context);
        } else if (context.ifRegExp(/help/i)) {
            context.reply("Welcome to the Alarm Bot demo.");
            context.reply("To set an alarm, type or say: 'set alarm', or 'new alarm'.\n\nTo cancel an alarm, type or say: 'cancel alarm', or 'delete alarm'.")
        } else {
            return prompts.Prompt.routeTo(context).then((handled) => {
                if (!handled) {
                    context.reply(`[Alarm Bot Example] To create a new alarm, type or say: "set alarm" or "new alarm". For more details, type or say 'help'`);
                }
                return { handled: true };
            });
        }
    }
}

// handle activities
bot.onReceive((context) => routeActivity(context));


// END OF LINE
