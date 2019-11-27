"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const fs = require("fs");
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
// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/08 - ExternalLanguage/ExternalLanguage.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/08 - ExternalLanguage"
// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/07 - BeginDialog/BeginDialog.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/07 - BeginDialog"
const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/06 - DoSteps/DoSteps.main.dialog";
const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/06 - DoSteps";
// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/04 - TextInput/NumberInput.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/04 - TextInput"
function readPackageJson(path, done) {
    fs.readFile(path, function (err, buffer) {
        if (err) {
            return done(err);
        }
        var json = JSON.parse(buffer.toString().trim());
        return done(null, json);
    });
}
async function LoadDialog(path, resourcesFolder) {
    readPackageJson(path, async function (err, json) {
        if (err) {
            console.log(err);
            return;
        }
        // Create bots DialogManager and bind to state storage
        const bot = new botbuilder_dialogs_1.DialogManager();
        bot.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
        bot.userState = new botbuilder_1.UserState(new botbuilder_1.MemoryStorage());
        // bind rootDialog
        let loader = new botbuilder_dialogs_declarative_1.TypeLoader();
        if (resourcesFolder) {
            let resourceProvider = new botbuilder_dialogs_declarative_1.FileResourceProvider();
            resourceProvider.registerDirectory(`../../libraries/botbuilder-dialogs-declarative/tests/resources`);
            loader = new botbuilder_dialogs_declarative_1.TypeLoader(null, resourceProvider);
        }
        const dialog = await loader.load(json);
        bot.rootDialog = dialog;
        // Listen for incoming activities.
        server.post('/api/messages', (req, res) => {
            adapter.processActivity(req, res, async (context) => {
                // Route activity to bot.
                await bot.onTurn(context);
            });
        });
    });
}
LoadDialog(path, resourcesFolder);
//# sourceMappingURL=index.js.map