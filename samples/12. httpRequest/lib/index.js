"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
// Create bots DialogManager and bind to state storage
const bot = new botbuilder_dialogs_1.DialogManager();
bot.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
// Initialize bots root dialog
const dialogs = new botbuilder_dialogs_adaptive_1.AdaptiveDialog();
bot.rootDialog = dialogs;
// Handle unknown intents
dialogs.addRule(new botbuilder_dialogs_adaptive_1.OnUnknownIntent([
    new botbuilder_dialogs_adaptive_1.TextInput("dialog.petname", "Welcome! Here is a http request sample, please enter a name for you visual pet."),
    new botbuilder_dialogs_adaptive_1.SendActivity("Great! Your pet's name is {dialog.petname}"),
    new botbuilder_dialogs_adaptive_1.NumberInput("dialog.petid", "Now please enter the id of your pet, this could help you find your pet later."),
    new botbuilder_dialogs_adaptive_1.HttpRequest(botbuilder_dialogs_adaptive_1.HttpMethod.POST, "http://petstore.swagger.io/v2/pet", {
        "test": "test",
        "test2": "test2"
    }, {
        "id": "{dialog.petid}",
        "category": {
            "id": 0,
            "name": "string"
        },
        "name": "{dialog.petname}",
        "photoUrls": [
            "string"
        ],
        "tags": [
            {
                "id": 0,
                "name": "string"
            }
        ],
        "status": "available"
    }, botbuilder_dialogs_adaptive_1.ResponsesTypes.Json, "dialog.postResponse"),
    new botbuilder_dialogs_adaptive_1.SendActivity("Done! You have added a pet named \"{dialog.postResponse.content.name}\" with id \"{dialog.postResponse.content.id}\""),
    new botbuilder_dialogs_adaptive_1.NumberInput("dialog.id", "Now try to specify the id of your pet, and I will help your find it out from the store."),
    new botbuilder_dialogs_adaptive_1.HttpRequest(botbuilder_dialogs_adaptive_1.HttpMethod.GET, "http://petstore.swagger.io/v2/pet/{dialog.id}", null, null, null, "dialog.getResponse"),
    new botbuilder_dialogs_adaptive_1.SendActivity("Great! I found your pet named \"{dialog.getResponse.content.name}\"")
]));
//# sourceMappingURL=index.js.map