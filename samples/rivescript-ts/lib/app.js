"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_core_1 = require("botbuilder-core");
const botbuilder_node_1 = require("botbuilder-node");
const botbuilder_services_1 = require("botbuilder-services");
const botbuilder_rivescript_1 = require("botbuilder-rivescript");
const restify = require("restify");
const path = require("path");
// Create server
let server = restify.createServer();
server.getMessagePipelineToBot(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector
const botFrameworkAdapter = new botbuilder_services_1.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', botFrameworkAdapter.listen());
// Initialize bot
const bot = new botbuilder_core_1.Bot(botFrameworkAdapter)
    .use(new botbuilder_node_1.FileStorage())
    .use(new botbuilder_core_1.BotStateManager())
    .use(new botbuilder_rivescript_1.RiveScriptReceiver(path.join(__dirname, "../rive/complex.rive")));
// END OF LINE
