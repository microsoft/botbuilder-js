import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { BotStateManager } from './botStateManager';
import * as restify from 'restify';
import * as addAlarm from './addAlarm';
import * as deleteAlarm from './deleteAlarm';
import * as showAlarms from './showAlarms';
import * as cancel from './cancel';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add state middleware
const state = new BotStateManager(new MemoryStorage());
adapter.use(state);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => {
        if (context.request.type === 'message') {
            // Check for the triggering of a new topic
            const utterance = (context.request.text || '').trim().toLowerCase();
            if (utterance.includes('add alarm')) {
                return addAlarm.begin(context, state);
            } else if (utterance.includes('delete alarm')) {
                return deleteAlarm.begin(context, state);
            } else if (utterance.includes('show alarms')) {
                return showAlarms.begin(context, state);
            } else if (utterance === 'cancel') {
                return cancel.begin(context, state);
            } else {
                // Continue the current topic
                switch (state.conversation(context).topic) {
                    case 'addAlarm':
                        return addAlarm.routeReply(context, state);
                    case 'deleteAlarm':
                        return deleteAlarm.routeReply(context, state);
                    default:
                        return context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
                }
            }
        }
    });
});
