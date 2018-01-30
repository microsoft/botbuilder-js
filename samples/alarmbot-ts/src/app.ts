'use strict';

import { Bot, ConsoleLogger, MemoryStorage, BotStateManager } from 'botbuilder';
import { Prompt } from 'botbuilder-prompts';
import { BotFrameworkAdapter } from 'botbuilder-services';
import * as restify from 'restify';
import * as alarms from './alarms';

// init restify server
let server = restify.createServer();
// bind listener to port and display start info
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// init connector
const adapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
// bind connector to /api/messages route
server.post('/api/messages', <any>adapter.listen());

// Configure bots routing table
function routeActivity(context: BotContext) {
    if (context.request.type === 'message') {
        if (context.ifRegExp(/(list|show) alarms/i)) {
            return alarms.sayAlarms(context);
        } else if (context.ifRegExp(/(set|create|add|new) alarm/i)) {
            Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
            return alarms.addAlarm(context, {});
        } else if (context.ifRegExp(/(delete|remove|cancel) alarm/i)) {
            Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
            return alarms.deleteAlarm(context);
        } else if (context.ifRegExp(/help/i)) {
            context.reply("Welcome to the Alarm Bot demo.");
            context.reply("To set an alarm, type or say: 'set alarm', or 'new alarm'.\n\nTo cancel an alarm, type or say: 'cancel alarm', or 'delete alarm'.")
        } else {
            return Prompt.routeTo(context).then((handled) => {
                if (!handled) {
                    context.reply(`[Alarm Bot Example] To create a new alarm, type or say: "set alarm" or "new alarm". For more details, type or say 'help'`);
                }
                return { handled: true };
            });
        }
    }
}

// Initialize bot & bind to middleware
const bot = new Bot(adapter)
    .use(new ConsoleLogger())
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive(routeActivity);

// END OF LINE
