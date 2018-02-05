"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_services_1 = require("botbuilder-services");
const restify = require("restify");
const addAlarm = require("./addAlarm");
const deleteAlarm = require("./deleteAlarm");
const showAlarms = require("./showAlarms");
const cancel = require("./cancel");
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
// Initialize bot by passing it adapter and middleware
const bot = new botbuilder_1.Bot(adapter)
    .use(new botbuilder_1.MemoryStorage())
    .use(new botbuilder_1.BotStateManager())
    .onReceive((context) => {
    if (context.request.type === 'message') {
        // Check for the triggering of a new topic
        const utterance = (context.request.text || '').trim().toLowerCase();
        if (utterance.includes('add alarm')) {
            return addAlarm.begin(context);
        }
        else if (utterance.includes('delete alarm')) {
            return deleteAlarm.begin(context);
        }
        else if (utterance.includes('show alarms')) {
            return showAlarms.begin(context);
        }
        else if (utterance === 'cancel') {
            return cancel.begin(context);
        }
        else {
            // Continue the current topic
            switch (context.state.conversation.topic) {
                case 'addAlarm':
                    return addAlarm.routeReply(context);
                case 'deleteAlarm':
                    return deleteAlarm.routeReply(context);
                default:
                    context.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                    return Promise.resolve();
            }
        }
    }
});
//# sourceMappingURL=app.js.map