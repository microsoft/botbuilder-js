import { Bot, ConsoleLogger, MemoryStorage, BotStateManager } from 'botbuilder-core';
import { BotFrameworkAdapter } from 'botbuilder-services';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', <any>botFrameworkAdapter.listen());

// Initialize topic manager
import * as topicManager from './topicManager';
import * as menu from './topics/menu';
import * as attachmentPrompt from './topics/attachmentPrompt';
import * as choicePrompt from './topics/choicePrompt';
import * as confirmPrompt from './topics/confirmPrompt';
import * as numberPrompt from './topics/numberPrompt';
import * as textPrompt from './topics/textPrompt';
topicManager.addTopics(menu, attachmentPrompt, choicePrompt, confirmPrompt, numberPrompt, textPrompt);


// Setup bot
const bot = new Bot(botFrameworkAdapter)
    .use(new ConsoleLogger())
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive((context) => {
        return topicManager.routeActivity(context).then((routed) => {
            if (!routed && context.request.type === 'message') {
                // Show the menu by default
                menu.showMenu(context);
            }
        });
    });
