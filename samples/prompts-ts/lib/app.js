"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_services_1 = require("botbuilder-services");
const restify = require("restify");
// Create server
let server = restify.createServer();
server.getMessagePipelineToBot(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new botbuilder_services_1.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', botFrameworkAdapter.listen());
// Initialize topic manager
const topicManager = require("./topicManager");
const menu = require("./topics/menu");
const attachmentPrompt = require("./topics/attachmentPrompt");
const choicePrompt = require("./topics/choicePrompt");
const confirmPrompt = require("./topics/confirmPrompt");
const numberPrompt = require("./topics/numberPrompt");
const textPrompt = require("./topics/textPrompt");
topicManager.addTopics(menu, attachmentPrompt, choicePrompt, confirmPrompt, numberPrompt, textPrompt);
// Setup bot
const bot = new botbuilder_1.Bot(botFrameworkAdapter)
    .use(new botbuilder_1.ConsoleLogger())
    .use(new botbuilder_1.MemoryStorage())
    .use(new botbuilder_1.BotStateManager())
    .onReceive((context) => {
    return topicManager.routeActivity(context).then((routed) => {
        if (!routed && context.request.type === 'message') {
            // Show the menu by default
            menu.showMenu(context);
        }
    });
});
