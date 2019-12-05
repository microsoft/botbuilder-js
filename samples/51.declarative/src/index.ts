// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { DialogManager, Dialog } from 'botbuilder-dialogs';
import { TypeLoader, FileResourceProvider, ResourceExplorer} from 'botbuilder-dialogs-declarative';
import fs = require('fs');
import { resolve } from 'path';

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});

// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/08 - ExternalLanguage/ExternalLanguage.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/08 - ExternalLanguage"
// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/07 - BeginDialog/BeginDialog.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/07 - BeginDialog"
const path = "./libraries/botbuilder-dialogs-declarative/tests/resources/06 - DoSteps/DoSteps.main.dialog";
const resourcesFolder = "./libraries/botbuilder-dialogs-declarative/tests/resources/06 - DoSteps";
// const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/04 - TextInput/NumberInput.main.dialog"
// const resourcesFolder = "../../libraries/botbuilder-dialogs-declarative/tests/resources/04 - TextInput"

let dialogManager: DialogManager = null;

function readPackageJson(path, done) {
    fs.readFile(path, function (err, buffer) {
      if (err) { return done(err); }
      var json = JSON.parse(buffer.toString().trim());
      return done(null, json);
    });
}

async function LoadDialog(path, resourcesFolder){
    readPackageJson(path,
        async function (err, json) {
            if (err) {
                console.log(err);
                return;
            }

            // Create bots DialogManager and bind to state storage
            dialogManager =  new DialogManager();
            dialogManager.conversationState = new ConversationState(new MemoryStorage());
            dialogManager.userState = new UserState(new MemoryStorage());

            // bind rootDialog
            let loader = new TypeLoader();
            if (resourcesFolder) {
                let resourceExplorer = new ResourceExplorer();
                resourceExplorer.emitter.on("changed", (resource) => {
                    LoadDialog(path, resourcesFolder);
                });
                // resourceExplorer.registerDirectory(`./libraries/botbuilder-dialogs-declarative/tests/resources`);
                resourceExplorer.addFolder(`./libraries/botbuilder-dialogs-declarative/tests/resources`);
                loader = new TypeLoader(null, resourceExplorer);
            }
            const dialog = await loader.load(json);
            dialogManager.rootDialog = dialog as Dialog;


    });
}

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await dialogManager.onTurn(context);
    });
});

LoadDialog(path, resourcesFolder);