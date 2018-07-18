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
const restify = require("restify");
const alarmBot_1 = require("./alarmBot");
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
// Create root bot
const bot = new alarmBot_1.AlarmBot(userState);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        // Ensure user properly initialized
        const user = userState.get(context);
        if (!user.alarms) {
            user.alarms = [];
        }
        // Dispatch activity to bot
        const state = convoState.get(context);
        yield bot.continue(context, state);
    }));
});
//# sourceMappingURL=app.js.map