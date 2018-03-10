"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Add batch output middleware
adapter.use(new botbuilder_1.BatchOutput());
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.request.type === 'message') {
            const utterance = (context.request.text || '').trim().toLowerCase();
            // Create dialog context
            const stack = state.conversation(context).dialogStack;
            const dc = dialogs.createContext(context, stack);
            // Start addAlarm dialog
            if (utterance.includes('add alarm')) {
                yield dc.begin('addAlarm');
                // Start deleteAlarm dialog
            }
            else if (utterance.includes('delete alarm')) {
                yield dc.begin('deleteAlarm');
                // Start showAlarms
            }
            else if (utterance.includes('show alarms')) {
                yield dc.begin('showAlarms');
                // Check for cancel
            }
            else if (utterance === 'cancel') {
                if (dc.instance) {
                    yield dc.context.sendActivity(`Ok... Cancelled.`);
                    yield dc.endAll();
                }
                else {
                    yield dc.context.sendActivity(`Nothing to cancel.`);
                }
                // Continue current dialog
            }
            else {
                yield dc.continue();
                // Return default message if nothing replied.
                if (!context.responded) {
                    yield dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                }
            }
        }
    }));
});
const dialogs = new botbuilder_dialogs_1.DialogSet();
//-----------------------------------------------
// Add Alarm
//-----------------------------------------------
dialogs.add('addAlarm', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize temp alarm and prompt for title
            dc.instance.state = {};
            yield dc.prompt('titlePrompt', `What would you like to call your alarm?`);
        });
    },
    function (dc, title) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save alarm title and prompt for time
            const alarm = dc.instance.state;
            alarm.title = title;
            yield dc.prompt('timePrompt', `What time would you like to set the "${alarm.title}" alarm for?`);
        });
    },
    function (dc, time) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save alarm time
            const alarm = dc.instance.state;
            alarm.time = time.toISOString();
            // Alarm completed so set alarm.
            const user = state.user(dc.context);
            user.alarms.push(alarm);
            // Confirm to user
            yield dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
            yield dc.end();
        });
    }
]);
dialogs.add('titlePrompt', new botbuilder_dialogs_1.TextPrompt((dc, value) => __awaiter(this, void 0, void 0, function* () {
    if (!value || value.length < 3) {
        yield dc.context.sendActivity(`Title should be at least 3 characters long.`);
        return undefined;
    }
    else {
        return value.trim();
    }
})));
dialogs.add('timePrompt', new botbuilder_dialogs_1.DatetimePrompt((dc, values) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (!Array.isArray(values) || values.length < 0) {
            throw new Error('missing time');
        }
        if (values[0].type !== 'datetime') {
            throw new Error('unsupported type');
        }
        const value = new Date(values[0].value);
        if (value.getTime() < new Date().getTime()) {
            throw new Error('in the past');
        }
        return value;
    }
    catch (err) {
        yield dc.context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
        return undefined;
    }
})));
//-----------------------------------------------
// Delete Alarm
//-----------------------------------------------
dialogs.add('deleteAlarm', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Divert to appropriate dialog
            const user = state.user(dc.context);
            if (user.alarms.length > 1) {
                yield dc.begin('deleteAlarmMulti');
            }
            else if (user.alarms.length === 1) {
                yield dc.begin('deleteAlarmSingle');
            }
            else {
                yield dc.context.sendActivity(`No alarms set to delete.`);
                yield dc.end();
            }
        });
    }
]);
dialogs.add('deleteAlarmMulti', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Compute list of choices based on alarm titles
            const user = state.user(dc.context);
            const choices = user.alarms.map((value) => value.title);
            // Prompt user for choice (force use of "list" style)
            const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
            yield dc.prompt('choicePrompt', prompt, choices);
        });
    },
    function (dc, choice) {
        return __awaiter(this, void 0, void 0, function* () {
            // Delete alarm by position
            const user = state.user(dc.context);
            if (choice.index < user.alarms.length) {
                user.alarms.splice(choice.index, 1);
            }
            // Notify user of delete
            yield dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
            yield dc.end();
        });
    }
]);
dialogs.add('deleteAlarmSingle', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = state.user(dc.context);
            const alarm = user.alarms[0];
            yield dc.prompt('confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`);
        });
    },
    function (dc, confirm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (confirm) {
                const user = state.user(dc.context);
                user.alarms = [];
                yield dc.context.sendActivity(`alarm deleted...`);
            }
            else {
                yield dc.context.sendActivity(`ok...`);
            }
        });
    }
]);
dialogs.add('choicePrompt', new botbuilder_dialogs_1.ChoicePrompt());
dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
//-----------------------------------------------
// Show Alarms
//-----------------------------------------------
dialogs.add('showAlarms', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = `No alarms found.`;
            const user = state.user(dc.context);
            if (user.alarms.length > 0) {
                msg = `**Current Alarms**\n\n`;
                let connector = '';
                user.alarms.forEach((alarm) => {
                    msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                    connector = '\n';
                });
            }
            yield dc.context.sendActivity(msg);
            yield dc.end();
        });
    }
]);
//# sourceMappingURL=app.js.map