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
const connectionName = process.env.CONNECTION_NAME;
// Add conversation state middleware
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
adapter.use(conversationState);
// Create empty dialog set
const dialogs = new botbuilder_dialogs_1.DialogSet();
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        // Use this command to have the emulator send mocked tokens to the bot rather than authenticating
        // adapter.emulateOAuthCards(context, true);
        if (context.activity.type === 'message') {
            if (context.activity.text === 'signout') {
                yield adapter.signOutUser(context, connectionName);
                yield context.sendActivity("You are now signed out.");
            }
            else {
                // Create dialog context and continue executing the "current" dialog, if any.
                const state = conversationState.get(context);
                const dc = dialogs.createContext(context, state);
                yield dc.continueDialog();
                // Check to see if anyone replied. If not then start dialog
                if (!context.responded) {
                    yield dc.beginDialog('displayToken');
                }
            }
        }
        else if (context.activity.type === 'event' || context.activity.type === 'invoke') {
            // Create dialog context and continue executing the "current" dialog, if any.
            // This is important for OAuthCards because tokens can be received via TokenResponse events
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            yield dc.continueDialog();
        }
    }));
});
// Add a dialog to get a token for the connectrion
dialogs.add('loginPrompt', new botbuilder_dialogs_1.OAuthPrompt({
    connectionName: connectionName,
    text: "Please Sign In",
    title: "Sign In",
    timeout: 300000 // User has 5 minutes to login
}));
// Add a dialog to display the token once the user has logged in
dialogs.add('displayToken', [
    function (dc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.beginDialog('loginPrompt');
        });
    },
    function (dc, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (token) {
                // Continue with task needing access token
                yield dc.context.sendActivity(`Your token is: ` + token.token);
            }
            else {
                yield dc.context.sendActivity(`Sorry... We couldn't log you in. Try again later.`);
                yield dc.endDialog();
            }
        });
    }
]);
