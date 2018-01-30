import { Bot, BotStateManager } from 'botbuilder';
import { FileStorage } from "botbuilder-node";
import { BotFrameworkAdapter } from 'botbuilder-services';
import { RiveScriptReceiver, routeToRiveScript } from 'botbuilder-rivescript';
import * as restify from 'restify';
import * as path from 'path';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create connector
const botFrameworkAdapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', <any>botFrameworkAdapter.listen());

// Initialize bot
const bot = new Bot(botFrameworkAdapter)
    .use(new FileStorage())
    .use(new BotStateManager())
    .use(new RiveScriptReceiver(path.join(__dirname, "../rive/complex.rive")));

// END OF LINE
