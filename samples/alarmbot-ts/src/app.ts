import { Bot, MemoryStorage, BotStateManager } from 'botbuilder';
import { BotFrameworkAdapter } from 'botbuilder-services';
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

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', <any>adapter.listen());

// Initialize bot by passing it adapter and middleware
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive((context) => {
        if (context.request.type === 'message') {
            // Check for the triggering of a new topic
            const utterance = (context.request.text || '').trim().toLowerCase();
            if (utterance.includes('add alarm')) {
                return addAlarm.begin(context);
            } else if (utterance.includes('delete alarm')) {
                return deleteAlarm.begin(context);
            } else if (utterance.includes('show alarms')) {
                return showAlarms.begin(context);
            } else if (utterance === 'cancel') {
                return cancel.begin(context);
            } else {
                // Continue the current topic
                switch (context.state.conversation.topic) {
                    case 'addAlarm':
                        return addAlarm.routeReply(context);
                    case 'deleteAlarm':
                        return deleteAlarm.routeReply(context);
                    default:
                        context.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
                        return Promise.resolve();
                }
            }
        }
    });


declare global {
    export interface ConversationState {
        topic?: string;
        alarm?: Alarm;
        prompt?: string;
    }

    export interface UserState {
        alarms?: Alarm[];
    }
}

interface Alarm {
    title: string;
    time: string;
}