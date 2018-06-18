import { BotFrameworkAdapter, ConversationState, UserState, BotStateSet, MemoryStorage,TurnContext } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import * as restify from 'restify';

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
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        // Ensure user properly initialized
        const user = userState.get(context);
        if (!user.alarms) { user.alarms = [] }

        // Create dialog context
        const convo = convoState.get(context);
        const dc = dialogs.createContext(context, convo);

        // Check for interruptions
        const isMessage = context.activity.type === 'message';
        if (isMessage) {
            const utterance = (context.activity.text || '').trim().toLowerCase();

            // Start addAlarm dialog
            if (utterance.includes('add alarm')) {
                await dc.begin('addAlarm');

            // Start deleteAlarm dialog
            } else if (utterance.includes('delete alarm')) {
                await dc.begin('deleteAlarm');

            // Start showAlarms
            } else if (utterance.includes('show alarms')) {
                await dc.begin('showAlarms');

            // Check for cancel
            } else if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    await dc.context.sendActivity(`Ok... Cancelled.`);
                    await dc.endAll();
                } else {
                    await dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
        }

        // Route activity to current dialog if not interrupted
        if (!context.responded) {
            await dc.continue();
            if (!context.responded && isMessage) {
                // Return default reply message
                await dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
            }
        } 
    });
});

// Setup Dialogs

import { AddAlarmDialog } from './addAlarmDialog';
import { DeleteAlarmDialog } from './deleteAlarmDialog';
import { ShowAlarmsDialog } from './showAlarmsDialog';

const dialogs = new DialogSet();
dialogs.add('addAlarm', new AddAlarmDialog(userState));
dialogs.add('deleteAlarm', new DeleteAlarmDialog(userState));
dialogs.add('showAlarms', new ShowAlarmsDialog(userState));
