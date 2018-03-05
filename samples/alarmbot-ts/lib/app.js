"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botStateManager_1 = require("./botStateManager");
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
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Create state manager
const state = new botStateManager_1.BotStateManager(new botbuilder_1.MemoryStorage());
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
            }
            else if (utterance.includes('delete alarm')) {
                return deleteAlarm.begin(context, state);
            }
            else if (utterance.includes('show alarms')) {
                return showAlarms.begin(context, state);
            }
            else if (utterance === 'cancel') {
                return cancel.begin(context, state);
            }
            else {
                // Continue the current topic
                switch (state.conversation.get(context).topic) {
                    case 'addAlarm':
                        return addAlarm.routeReply(context, state);
                    case 'deleteAlarm':
                        return deleteAlarm.routeReply(context, state);
                    default:
                        return context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                }
            }
        }
    });
});
//# sourceMappingURL=app.js.map