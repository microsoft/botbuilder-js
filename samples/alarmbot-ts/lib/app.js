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
// Add state middleware
const state = new botStateManager_1.BotStateManager(new botbuilder_1.MemoryStorage());
adapter.use(state);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.activity.type === 'message') {
            // Check for the triggering of a new topic
            const utterance = (context.activity.text || '').trim().toLowerCase();
            if (utterance.includes('add alarm')) {
                yield addAlarm.begin(context, state);
            }
            else if (utterance.includes('delete alarm')) {
                yield deleteAlarm.begin(context, state);
            }
            else if (utterance.includes('show alarms')) {
                yield showAlarms.begin(context, state);
            }
            else if (utterance === 'cancel') {
                yield cancel.begin(context, state);
            }
            else {
                // Continue the current topic
                switch (state.conversation(context).topic) {
                    case 'addAlarm':
                        yield addAlarm.routeReply(context, state);
                        break;
                    case 'deleteAlarm':
                        yield deleteAlarm.routeReply(context, state);
                        break;
                    default:
                        yield context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                        break;
                }
            }
        }
    }));
});
//# sourceMappingURL=app.js.map