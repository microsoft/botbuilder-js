import { BotFrameworkAdapter, MemoryStorage, BatchOutput, BotContext } from 'botbuilder';
import { 
    DialogSet, TextPrompt, ChoicePrompt, ConfirmPrompt, DatetimePrompt, 
    FoundChoice, FoundDatetime, ListStyle 
} from 'botbuilder-dialogs';
import { BotStateManager, Alarm } from './botStateManager';
import * as restify from 'restify';
import * as moment from 'moment';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add state middleware
const state = new BotStateManager(new MemoryStorage());
adapter.use(state);

// Add batch output middleware
adapter.use(new BatchOutput());

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => {
        if (context.request.type === 'message') {
            const utterance = (context.request.text || '').trim().toLowerCase();

            // Create dialog context
            const stack = state.conversation(context).dialogStack;
            const dc = dialogs.createContext(context, stack);

            // Start addAlarm dialog
            if (utterance.includes('add alarm')) {
                return dc.begin('addAlarm');

            // Start deleteAlarm dialog
            } else if (utterance.includes('delete alarm')) {
                return dc.begin('deleteAlarm');

            // Start showAlarms
            } else if (utterance.includes('show alarms')) {
                return dc.begin('showAlarms');

            // Check for cancel
            } else if (utterance === 'cancel') {
                if (dc.instance) {
                    dc.batch.reply(`Ok... Cancelled.`);
                    return dc.endAll();
                } else {
                    dc.batch.reply(`Nothing to cancel.`);
                }

            // Continue current dialog
            } else {
                return dc.continue().then(() => {
                    // Return default message if nothing replied.
                    if (!context.responded) {
                        dc.batch.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
                    }
                });
            }
        }
    });
});


const dialogs = new DialogSet();

//-----------------------------------------------
// Add Alarm
//-----------------------------------------------

dialogs.add('addAlarm', [
    function (dc) {
        // Initialize temp alarm and prompt for title
        dc.instance.state = {} as Alarm;
        return dc.prompt('titlePrompt', `What would you like to call your alarm?`);
    },
    function (dc, title: string) {
        // Save alarm title and prompt for time
        const alarm = dc.instance.state as Alarm;
        alarm.title = title;
        return dc.prompt('timePrompt', `What time would you like to set the "${alarm.title}" alarm for?`);
    },
    function (dc, time: Date) {
        // Save alarm time
        const alarm = dc.instance.state as Alarm;
        alarm.time = time.toISOString();

        // Alarm completed so set alarm.
        const user = state.user(dc.context);
        user.alarms.push(alarm);
        
        // Confirm to user
        dc.batch.reply(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
        return dc.end();
    }
]);

dialogs.add('titlePrompt', new TextPrompt((dc, value) => {
    if (!value || value.length < 3) {
        dc.batch.reply(`Title should be at least 3 characters long.`);
        return undefined;
    } else {
        return value.trim();
    }
}));

dialogs.add('timePrompt', new DatetimePrompt((dc, values) => {
    try {
        if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
        if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
        const value = new Date(values[0].value);
        if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
        return value;
    } catch (err) {
        dc.batch.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
        return undefined;
    }
}));


//-----------------------------------------------
// Delete Alarm
//-----------------------------------------------

dialogs.add('deleteAlarm', [
    function (dc) {
        // Divert to appropriate dialog
        const user = state.user(dc.context);
        if (user.alarms.length > 1) {
            return dc.begin('deleteAlarmMulti');
        } else if (user.alarms.length === 1) {
            return dc.begin('deleteAlarmSingle');
        } else {
            dc.batch.reply(`No alarms set to delete.`);
            return dc.end();
        }
    } 
]);

dialogs.add('deleteAlarmMulti', [
    function (dc) {
        // Compute list of choices based on alarm titles
        const user = state.user(dc.context);
        const choices = user.alarms.map((value) => value.title);

        // Prompt user for choice (force use of "list" style)
        const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
        return dc.prompt('choicePrompt', prompt, choices);
    },
    function (dc, choice: FoundChoice) {
        // Delete alarm by position
        const user = state.user(dc.context);
        if (choice.index < user.alarms.length) { user.alarms.splice(choice.index, 1) }

        // Notify user of delete
        dc.batch.reply(`Deleted "${choice.value}" alarm.`);
        return dc.end();
    }
]);

dialogs.add('deleteAlarmSingle', [
    function (dc) {
        const user = state.user(dc.context);
        const alarm = user.alarms[0];
        return dc.prompt('confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`);
    },
    function (dc, confirm: boolean) {
        if (confirm) {
            const user = state.user(dc.context);
            user.alarms = [];
            dc.batch.reply(`alarm deleted...`);
        } else {
            dc.batch.reply(`ok...`);
        }
        return Promise.resolve();
    }
]);

dialogs.add('choicePrompt', new ChoicePrompt());
dialogs.add('confirmPrompt', new ConfirmPrompt());


//-----------------------------------------------
// Show Alarms
//-----------------------------------------------

dialogs.add('showAlarms', [
    function (dc) {
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
        dc.batch.reply(msg);
        return dc.end();
    }
]);

