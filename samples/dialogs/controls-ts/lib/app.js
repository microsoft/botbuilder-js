"use strict";
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
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
adapter.use(conversationState);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    adapter.processRequest(req, res, async (context) => {
        if (context.request.type === 'message') {
            // Update request with current locale
            const state = conversationState.get(context);
            if (state.currentLocale) {
                context.request.locale = state.currentLocale;
            }
            // Route received request
            if (!state.demo) {
                const utterance = (context.request.text || '').trim().toLowerCase();
                if (utterance.includes('dialog')) {
                    await beginDialogDemo(context, state);
                }
                else if (utterance.includes('topic')) {
                    await beginTopicDemo(context, state);
                }
                else {
                    await context.sendActivity(`Which demo would you like to run? The "dialog" or "topic" based demo?`);
                }
            }
            else {
                switch (state.demo) {
                    case 'dialog':
                        await continueDialogDemo(context, state);
                        break;
                    case 'topic':
                        await continueTopicDemo(context, state);
                        break;
                }
            }
        }
    });
});
const language_1 = require("./language");
//---------------------------------------------------------
// Dialog Based Usage
//---------------------------------------------------------
async function beginDialogDemo(context, state) {
    state.demo = 'dialog';
    state.dialogStack = [];
    const dc = dialogs.createContext(context, state.dialogStack);
    await dc.begin('demo');
}
async function continueDialogDemo(context, state) {
    const dc = dialogs.createContext(context, state.dialogStack);
    const result = await dc.continue();
    if (!result.active) {
        state.demo = undefined;
        state.currentLocale = result.result;
    }
}
const dialogs = new botbuilder_dialogs_1.DialogSet();
dialogs.add('demo', [
    async function (dc) {
        return await dc.begin('localePicker');
    },
    async function (dc, locale) {
        await dc.context.sendActivity(`Switching locale to "${locale}".`);
        return await dc.end(locale);
    }
]);
dialogs.add('localePicker', new language_1.LanguagePicker({ defaultLocale: 'en' }));
//---------------------------------------------------------
// Topic Based Usage
//---------------------------------------------------------
async function beginTopicDemo(context, state) {
    state.demo = 'topic';
    state.controlState = {};
    await language_1.LanguagePicker.begin(context, state.controlState, { defaultLocale: 'en' });
}
async function continueTopicDemo(context, state) {
    const result = await language_1.LanguagePicker.continue(context, state.controlState);
    if (!result.active) {
        state.demo = undefined;
        state.currentLocale = result.result;
        await context.sendActivity(`Switching locale to "${state.currentLocale}".`);
    }
}
