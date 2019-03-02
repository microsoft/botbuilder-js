"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_planning_1 = require("botbuilder-planning");
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
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.onTurn(context);
    });
});
// Create the main planning dialog and bind to storage.
const bot = new botbuilder_planning_1.PlanningDialog();
bot.storage = new botbuilder_1.MemoryStorage();
// Add a top level fallback rule to handle received messages
bot.addRule(new botbuilder_planning_1.FallbackRule([
    new botbuilder_planning_1.CallDialog('hello')
]));
bot.addRule(new botbuilder_planning_1.EventRule('cancelDialog', [
    new botbuilder_planning_1.SendActivity('ok canceling')
]));
bot.addRule(new botbuilder_planning_1.EventRule('cancelApi', [
    new botbuilder_planning_1.SendActivity('api call cancelled')
]));
const helloDialog = new botbuilder_planning_1.SequenceDialog('hello', [
    new botbuilder_planning_1.CallDialog('myApi'),
    new botbuilder_planning_1.IfProperty('!conversation.apiSuccess', [
        new botbuilder_planning_1.DoStepsLater([
            new botbuilder_planning_1.SendActivity(`I'm really done`)
        ])
    ]),
    new botbuilder_planning_1.SetPlanTitle(`booking your trip to {dialog.result.dest}`),
    new botbuilder_planning_1.IfProperty('conversation.maxAlarms', [
        new botbuilder_planning_1.SendActivity('max alarms'),
        new botbuilder_planning_1.EndDialog()
    ]),
    new botbuilder_planning_1.TextInput('conversation.alarmTime', `What time would you like to set your alarm for?`),
    new botbuilder_planning_1.SendActivity(`done`)
]);
bot.addDialog(helloDialog);
const callApi = new botbuilder_planning_1.SequenceDialog('myApi', [
    new botbuilder_planning_1.SendActivity(`calling api...`),
    new botbuilder_planning_1.CodeStep(async (planning) => {
        planning.state.setValue('conversation.apiSuccess', false);
        planning.state.setValue('conversation.maxAlarms', false);
        planning.state.setValue('conversation.alarmTime', '9am');
        return await planning.endDialog();
    }),
    new botbuilder_planning_1.WaitForInput()
]);
callApi.recognizer = new botbuilder_planning_1.RegExpRecognizer().addIntent('Cancel', /^cancel/i);
callApi.addRule(new botbuilder_planning_1.DoStepsRule('Cancel', [
    new botbuilder_planning_1.CancelDialog('cancelApi')
]));
bot.addDialog(callApi);
//# sourceMappingURL=index.js.map