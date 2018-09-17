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
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            // Update request with current locale
            const state = conversationState.get(context);
            if (state.currentLocale) {
                context.activity.locale = state.currentLocale;
            }
            // Route received request
            if (!state.demo) {
                const utterance = (context.activity.text || '').trim().toLowerCase();
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
    state.demoState = {};
    const dc = dialogs.createContext(context, state.demoState);
    await dc.beginDialog('demo');
}
async function continueDialogDemo(context, state) {
    const dc = dialogs.createContext(context, state.demoState);
    await dc.continueDialog();
    if (!dc.activeDialog) {
        state.demo = undefined;
        state.demoState = undefined;
    }
}
const dialogs = new botbuilder_dialogs_1.DialogSet();
dialogs.add('demo', [
    async function (dc) {
        return await dc.beginDialog('localePicker');
    },
    async function (dc, locale) {
        await dc.context.sendActivity(`Switching locale to "${locale}".`);
        const state = conversationState.get(dc.context);
        state.currentLocale = locale;
        return await dc.endDialog();
    }
]);
dialogs.add('localePicker', new language_1.LanguagePicker({ defaultLocale: 'en' }));
//---------------------------------------------------------
// Topic Based Usage
//---------------------------------------------------------
const localePicker = new language_1.LanguagePicker({ defaultLocale: 'en' });
async function beginTopicDemo(context, state) {
    state.demo = 'topic';
    state.demoState = {};
    await localePicker.begin(context, state.demoState);
}
async function continueTopicDemo(context, state) {
    const completion = await localePicker.continue(context, state.demoState);
    if (completion.isCompleted) {
        state.demo = undefined;
        state.demoState = undefined;
        state.currentLocale = completion.result;
        await context.sendActivity(`Switching locale to "${state.currentLocale}".`);
    }
}
//# sourceMappingURL=app.js.map