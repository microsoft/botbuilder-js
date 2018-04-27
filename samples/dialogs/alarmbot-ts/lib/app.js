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
const restify = require("restify");
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
const storage = new botbuilder_1.MemoryStorage();
const convoState = new botbuilder_1.ConversationState(storage);
const userState = new botbuilder_1.UserState(storage);
adapter.use(new botbuilder_1.BotStateSet(convoState, userState));
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        // Ensure user properly initialized
        const user = userState.get(context);
        if (!user.alarms) {
            user.alarms = [];
        }
        // Create dialog context
        const convo = convoState.get(context);
        const dc = dialogs.createContext(context, convo);
        // Check for interruptions
        const isMessage = context.activity.type === 'message';
        if (isMessage) {
            const utterance = (context.activity.text || '').trim().toLowerCase();
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
                if (dc.activeDialog) {
                    yield dc.context.sendActivity(`Ok... Cancelled.`);
                    yield dc.endAll();
                }
                else {
                    yield dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
        }
        // Route activity to current dialog if not interrupted
        if (!context.responded) {
            yield dc.continue();
            if (!context.responded && isMessage) {
                // Return default reply message
                yield dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
            }
        }
    }));
});
// Setup Dialogs
const addAlarmDialog_1 = require("./addAlarmDialog");
const deleteAlarmDialog_1 = require("./deleteAlarmDialog");
const showAlarmsDialog_1 = require("./showAlarmsDialog");
const dialogs = new botbuilder_dialogs_1.DialogSet();
dialogs.add('addAlarm', new addAlarmDialog_1.AddAlarmDialog(userState));
dialogs.add('deleteAlarm', new deleteAlarmDialog_1.DeleteAlarmDialog(userState));
dialogs.add('showAlarms', new showAlarmsDialog_1.ShowAlarmsDialog(userState));
//# sourceMappingURL=app.js.map