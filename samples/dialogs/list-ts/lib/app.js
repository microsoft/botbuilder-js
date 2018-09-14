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
            // Create dialog context.
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            // Check for list to show
            const utterance = (context.activity.text || '').trim().toLowerCase();
            if (utterance.includes('images')) {
                const startImage = Math.floor(Math.random() * 100);
                await dc.endAll().begin('imageList', { filter: { start: startImage } });
            }
            else {
                await dc.continueDialog();
                // Check to see if anyone replied.
                if (!context.responded) {
                    await context.sendActivity(`To show a list send a reply with "images".`);
                }
            }
        }
    });
});
const listControl_1 = require("./listControl");
const dialogs = new botbuilder_dialogs_1.DialogSet();
dialogs.add('imageList', new listControl_1.ListControl((dc, filter, continueToken) => {
    // Render a page of images to hero cards 
    const page = typeof continueToken === 'number' ? continueToken : 0;
    const cards = [];
    for (let i = 0; i < 10; i++) {
        const imageNum = i + (page * 10) + 1;
        const card = botbuilder_1.CardFactory.heroCard(`Image ${imageNum}`, [`https://picsum.photos/100/100/?image=${filter.start + imageNum}`]);
        cards.push(card);
    }
    // Render cards to user as a carousel
    const activity = botbuilder_1.MessageFactory.carousel(cards);
    // Return page of results
    return { results: activity, continueToken: page < 4 ? page + 1 : undefined };
}));
