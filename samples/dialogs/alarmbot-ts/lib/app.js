"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botStateManager_1 = require("./botStateManager");
const restify = require("restify");
const moment = require("moment");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Add state middleware
const state = new botStateManager_1.BotStateManager(new botbuilder_1.MemoryStorage());
adapter.use(state);
adapter.use(new botbuilder_1.BatchOutput());
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => {
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
                    context.batch.reply(`Ok... Cancelled.`);
                    return dialogs.endAll(context);
                }
                else {
                    context.batch.reply(`Nothing to cancel.`);
                    return Promise.resolve();
                }
                // Continue current dialog
            }
            else {
                return dialogs.continue(context).then(() => {
                    // Return default message if nothing replied.
                    if (!context.responded) {
                        context.batch.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                    }
                });
            }
        }
    });
});
const dialogs = new botbuilder_dialogs_1.DialogSet();
//-----------------------------------------------
// Add Alarm
//-----------------------------------------------
dialogs.add('addAlarm', [
    function (context) {
        // Initialize temp alarm and prompt for title
        state.conversation(context).alarm = {};
        return dialogs.prompt(context, 'titlePrompt', `What would you like to call your alarm?`);
    },
    function (context, title) {
        // Save alarm title and prompt for time
        const alarm = state.conversation(context).alarm;
        alarm.title = title;
        return dialogs.prompt(context, 'timePrompt', `What time would you like to set the "${alarm.title}" alarm for?`);
    },
    function (context, time) {
        // Save alarm time
        const alarm = state.conversation(context).alarm;
        alarm.time = time.toISOString();
        // Alarm completed so set alarm.
        const user = state.user(context);
        user.alarms.push(alarm);
        // Confirm to user
        context.batch.reply(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
        return dialogs.end(context);
    }
]);
dialogs.add('titlePrompt', new botbuilder_dialogs_1.TextPrompt((context, value) => {
    if (value.length < 3) {
        context.batch.reply(`Title should be at least 3 characters long.`);
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
        context.batch.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
        return Promise.resolve();
    }
}));
//-----------------------------------------------
// Delete Alarm
//-----------------------------------------------
dialogs.add('deleteAlarm', [
    function (context) {
        // Divert to appropriate dialog
        const user = state.user(context);
        if (user.alarms.length > 1) {
            return dialogs.begin(context, 'deleteAlarmMulti');
        }
        else if (user.alarms.length === 1) {
            return dialogs.begin(context, 'deleteAlarmSingle');
        }
        else {
            context.batch.reply(`No alarms set to delete.`);
            return dialogs.end(context);
        }
    }
]);
dialogs.add('deleteAlarmMulti', [
    function (context) {
        // Compute list of choices based on alarm titles
        const user = state.user(context);
        const choices = user.alarms.map((value) => value.title);
        // Prompt user for choice (force use of "list" style)
        const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
        return dialogs.prompt(context, 'choicePrompt', prompt, choices);
    },
    function (context, choice) {
        // Delete alarm by position
        const user = state.user(context);
        if (choice.index < user.alarms.length) {
            user.alarms.splice(choice.index, 1);
        }
        // Notify user of delete
        context.batch.reply(`Deleted "${choice.value}" alarm.`);
        return dialogs.end(context);
    }
]);
dialogs.add('deleteAlarmSingle', [
    function (context) {
        const user = state.user(context);
        const alarm = user.alarms[0];
        return dialogs.prompt(context, 'confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`);
    },
    function (context, confirm) {
        if (confirm) {
            const user = state.user(context);
            user.alarms = [];
            context.batch.reply(`alarm deleted...`);
        }
        else {
            context.batch.reply(`ok...`);
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
        let msg = `No alarms found.`;
        const user = state.user(context);
        if (user.alarms.length > 0) {
            msg = `**Current Alarms**\n\n`;
            let connector = '';
            user.alarms.forEach((alarm) => {
                msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                connector = '\n';
            });
        }
        context.batch.reply(msg);
        return dialogs.end(context);
    }
]);
//# sourceMappingURL=app.js.map