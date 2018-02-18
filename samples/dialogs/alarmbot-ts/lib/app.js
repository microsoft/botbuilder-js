"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_services_1 = require("botbuilder-services");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const restify = require("restify");
const moment = require("moment");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter and listen to servers '/api/messages' route.
const adapter = new botbuilder_services_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', adapter.listen());
const dialogs = new botbuilder_dialogs_1.DialogSet();
// Initialize bot by passing it adapter and middleware
const bot = new botbuilder_1.Bot(adapter)
    .use(new botbuilder_1.MemoryStorage())
    .use(new botbuilder_1.BotStateManager())
    .onReceive((context) => {
    if (context.request.type === 'message') {
        const utterance = (context.request.text || '').trim().toLowerCase();
        // Start addAlarm dialog
        if (utterance.includes('add alarm')) {
            return dialogs.begin(context, 'addAlarm');
            // Start deleteAlarm dialog
        }
        else if (utterance.includes('delete alarm')) {
            return dialogs.begin(context, 'deleteAlarm');
            // Start showAlarms
        }
        else if (utterance.includes('show alarms')) {
            return dialogs.begin(context, 'showAlarms');
            // Check for cancel
        }
        else if (utterance === 'cancel') {
            if (dialogs.getInstance(context)) {
                context.reply(`Ok... Cancelled.`);
                return dialogs.endAll(context);
            }
            else {
                context.reply(`Nothing to cancel.`);
                return Promise.resolve();
            }
            // Continue current dialog
        }
        else {
            return dialogs.continue(context).then(() => {
                // Return default message if nothing replied.
                if (!context.responded) {
                    context.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                }
            });
        }
    }
});
//-----------------------------------------------
// Add Alarm
//-----------------------------------------------
dialogs.add('addAlarm', [
    function (context) {
        return dialogs.prompt(context, 'titlePrompt', `What would you like to call your alarm?`);
    },
    function (context, title) {
        const alarm = dialogs.getInstance(context).state;
        alarm.title = title;
        return dialogs.prompt(context, 'timePrompt', `What time would you like to set the "${alarm.title}" alarm for?`);
    },
    function (context, time) {
        const alarm = dialogs.getInstance(context).state;
        alarm.time = time.toISOString();
        // Alarm completed so set alarm.
        const list = context.state.user.alarms || [];
        list.push(alarm);
        context.state.user.alarms = list;
        // Confirm to user
        context.reply(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
        return dialogs.end(context);
    }
]);
dialogs.add('titlePrompt', new botbuilder_dialogs_1.TextPrompt((context, value) => {
    if (value.length < 3) {
        context.reply(`Title should be at least 3 characters long.`);
        return Promise.resolve();
    }
    else {
        return dialogs.end(context, value.trim());
    }
}));
dialogs.add('timePrompt', new botbuilder_dialogs_1.DatetimePrompt((context, values) => {
    try {
        if (values.length < 0) {
            throw new Error('missing time');
        }
        if (values[0].type !== 'datetime') {
            throw new Error('unsupported type');
        }
        const value = new Date(values[0].value);
        if (value.getTime() < new Date().getTime()) {
            throw new Error('in the past');
        }
        return dialogs.end(context, value);
    }
    catch (err) {
        context.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
        return Promise.resolve();
    }
}));
//-----------------------------------------------
// Delete Alarm
//-----------------------------------------------
dialogs.add('deleteAlarm', [
    function (context) {
        // Divert to appropriate dialog
        const list = context.state.user.alarms || [];
        if (list.length > 1) {
            return dialogs.begin(context, 'deleteAlarmMulti');
        }
        else if (list.length === 1) {
            return dialogs.begin(context, 'deleteAlarmSingle');
        }
        else {
            context.reply(`No alarms set to delete.`);
            return dialogs.end(context);
        }
    }
]);
dialogs.add('deleteAlarmMulti', [
    function (context) {
        // Compute list of choices based on alarm titles
        const choices = context.state.user.alarms.map((value) => value.title);
        // Prompt user for choice (force use of "list" style)
        let prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
        return dialogs.prompt(context, 'choicePrompt', prompt, choices, { style: botbuilder_dialogs_1.ChoicePromptStyle.list });
    },
    function (context, choice) {
        // Delete alarm by position
        const list = context.state.user.alarms || [];
        if (choice.index < list.length) {
            list.splice(choice.index, 1);
        }
        // Notify user of delete
        context.reply(`Deleted "${choice.value}" alarm.`);
        return dialogs.end(context);
    }
]);
dialogs.add('deleteAlarmSingle', [
    function (context) {
        const alarm = context.state.user.alarms[0];
        return dialogs.prompt(context, 'confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`, { style: botbuilder_dialogs_1.ChoicePromptStyle.none });
    },
    function (context, confirm) {
        if (confirm) {
            context.state.user.alarms = [];
            context.reply(`alarm deleted...`);
        }
        else {
            context.reply(`ok...`);
        }
        return Promise.resolve();
    }
]);
dialogs.add('choicePrompt', new botbuilder_dialogs_1.ChoicePrompt());
dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
//-----------------------------------------------
// Show Alarms
//-----------------------------------------------
dialogs.add('showAlarms', [
    function (context) {
        const list = context.state.user.alarms || [];
        if (list.length > 0) {
            let msg = `**Current Alarms**\n\n`;
            let connector = '';
            list.forEach((alarm) => {
                msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                connector = '\n';
            });
            context.reply(msg);
        }
        else {
            context.reply(`No alarms found.`);
        }
        return dialogs.end(context);
    }
]);
//# sourceMappingURL=app.js.map