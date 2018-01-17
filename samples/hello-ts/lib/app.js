"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_core_1 = require("botbuilder-core");
const botbuilder_services_1 = require("botbuilder-services");
const restify = require("restify");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new botbuilder_services_1.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', botFrameworkAdapter.listen());
// Initialize bot by passing it adapter
const bot = new botbuilder_core_1.Bot(botFrameworkAdapter);
// define the bot's onReceive message handler
bot.onReceive((context) => {
    context.reply(`Hello World`);
});
// END OF LINE
